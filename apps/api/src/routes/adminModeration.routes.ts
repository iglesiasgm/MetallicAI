// apps/api/src/routes/adminModeration.routes.ts
import { FastifyPluginAsync } from "fastify";
import * as fs from "fs";
import * as path from "path";
import { BandSubmissionsStore } from "../stores/bandSubmissions.store";
import { GeminiService } from "../services/gemini.service";
import { SpotifyService } from "../services/spotify.service";

type Ctx = {
  store: BandSubmissionsStore;
  qdrant: any;
  aiService: GeminiService;
  spotifyService: SpotifyService;
  dataPath: string; // bands.json
};

export const adminModerationRoutes: FastifyPluginAsync<Ctx> = async (
  fastify,
  ctx
) => {
  // Admin list
  fastify.get(
    "/admin/band-submissions",
    { preHandler: fastify.requireRole("ADMIN") },

    async (request, reply) => {
      const status = (request.query as any)?.status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "PUBLISHED"
        | undefined;

      const list = await ctx.store.list(status);
      // Para admin devolvemos el payload completo
      return reply.send(list);
    }
  );

  // Reject
  fastify.post<{ Params: { id: string }; Body: { reason?: string } }>(
    "/admin/band-submissions/:id/reject",
    { preHandler: fastify.requireRole("ADMIN") },
    async (request, reply) => {
      const actor = {
        userId: (request as any).user.sub,
        username: (request as any).user.username,
        role: (request as any).user.role,
      };

      const sub = await ctx.store.getById(request.params.id);
      if (!sub) return reply.code(404).send({ error: "Not found" });
      if (sub.status !== "PENDING") {
        return reply.code(409).send({ error: "Submission is not pending" });
      }

      const updated = await ctx.store.update(sub.id, {
        status: "REJECTED",
        reviewReason: request.body?.reason ?? "Rejected by moderator",
        reviewedAt: new Date().toISOString(),
        reviewedBy: actor, // MVP
      });

      return reply.send({
        message: "Rejected",
        submission: updated,
      });
    }
  );

  // Approve -> publica en Qdrant + backup JSON
  fastify.post<{ Params: { id: string } }>(
    "/admin/band-submissions/:id/approve",
    { preHandler: fastify.requireRole("ADMIN") },
    async (request, reply) => {
      const actor = {
        userId: (request as any).user.sub,
        username: (request as any).user.username,
        role: (request as any).user.role,
      };

      const sub = await ctx.store.getById(request.params.id);
      if (!sub) return reply.code(404).send({ error: "Not found" });
      if (sub.status !== "PENDING") {
        return reply.code(409).send({ error: "Submission is not pending" });
      }

      const input = sub.payload;
      const spotifyUrl = input.links?.find((l) => l.spotify)?.spotify;
      if (!spotifyUrl) {
        return reply
          .code(400)
          .send({ error: "Submission missing spotify link" });
      }

      try {
        // 1) Spotify data
        const spotifyData = await ctx.spotifyService.getBandDetails(spotifyUrl);
        if (!spotifyData) {
          return reply.code(404).send({ error: "Band not found on Spotify" });
        }

        // 2) Embedding
        const membersStr =
          input.members?.map((m) => `${m.name} (${m.role})`).join(", ") || "";

        const context = `Band: ${input.name}. Description: ${
          input.description
        }. Genres: ${input.subgenres.join(", ")}. Moods: ${input.moods.join(
          ", "
        )}. Features: ${input.features.join(", ")}. Members: ${membersStr}`;

        const embedding = await ctx.aiService.getEmbedding(context);

        const newBandId = sub.id; // clave: usamos submissionId como id del punto (idempotente)

        // 3) Payload
        const bandPayload = {
          name: input.name,
          subgenres: input.subgenres,
          moods: input.moods,
          features: input.features,
          description: input.description,
          members: input.members || [],
          links: input.links || [{ spotify: spotifyData.url }],
          imageUrl: spotifyData.imageUrl ?? undefined,
          popularity: spotifyData.popularity,
        };

        // 4) Upsert Qdrant
        await ctx.qdrant.upsert("bands", {
          wait: true,
          points: [{ id: newBandId, vector: embedding, payload: bandPayload }],
        });

        // 5) Backup JSON
        const backupBand = { id: newBandId, ...bandPayload };
        let currentJsonBands: any[] = [];

        if (fs.existsSync(ctx.dataPath)) {
          const fileContent = fs.readFileSync(ctx.dataPath, "utf-8");
          currentJsonBands = fileContent ? JSON.parse(fileContent) : [];
        }

        currentJsonBands.push(backupBand);
        fs.writeFileSync(
          ctx.dataPath,
          JSON.stringify(currentJsonBands, null, 2)
        );

        // 6) Update submission status
        const updated = await ctx.store.update(sub.id, {
          status: "PUBLISHED",
          reviewedAt: new Date().toISOString(),
          reviewedBy: actor,
          publishedAt: new Date().toISOString(),
          publishedBandId: newBandId,
        });

        return reply.send({
          message: "Approved and published",
          band: { id: newBandId, ...bandPayload },
          submission: updated,
        });
      } catch (error: any) {
        console.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          details: error.message,
        });
      }
    }
  );
};
