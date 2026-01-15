// apps/api/src/routes/bandSubmissions.routes.ts
import { FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { BandSubmissionsStore } from "../stores/bandSubmissions.store";
import { notifyAdmin } from "../utils/notify";
import { CreateBandInput } from "../domain/types";

type Ctx = {
  store: BandSubmissionsStore;
  qdrant: any; // QdrantClient
};

export const bandSubmissionsRoutes: FastifyPluginAsync<Ctx> = async (
  fastify,
  ctx
) => {
  // Crear submission (usuario)
  fastify.post<{ Body: CreateBandInput & { contactEmail?: string } }>(
    "/band-submissions",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const input = request.body;

      const u = (request as any).user; //cuidado que aca se declara como any........

      const actor = {
        userId: u.sub,
        username: u.username,
        role: u.role,
      };

      const spotifyUrl = input.links?.find((l) => l.spotify)?.spotify;
      if (!input.name || !input.description || !spotifyUrl) {
        return reply.code(400).send({ error: "Missing required fields" });
      }

      // Flag simple: posible duplicado por nombre (MVP)
      let possibleDuplicate = false;
      try {
        const result = await ctx.qdrant.scroll("bands", {
          limit: 5,
          with_vector: false,
          with_payload: true,
          filter: {
            should: [{ key: "name", match: { text: input.name } }],
          },
        });

        possibleDuplicate = (result.points?.length ?? 0) > 0;
      } catch {
        // si falla qdrant acá, NO bloqueamos la submission
      }

      const now = new Date().toISOString();
      const id = uuidv4();

      const sub = await ctx.store.create({
        id,
        status: "PENDING",
        payload: input,
        createdBy: actor,
        createdAt: now,
        updatedAt: now,
        flags: { possibleDuplicate },
      });

      await notifyAdmin(
        `🆕 New band submission: **${input.name}**\nBy: **${
          actor.username
        }**\nID: ${id}\nPossible duplicate: ${possibleDuplicate ? "YES" : "NO"}`
      );

      return reply.code(202).send({
        message: "Submission received. Pending review.",
        submission: { id: sub.id, status: sub.status, flags: sub.flags },
      });
    }
  );

  // Consultar estado (usuario)
  fastify.get<{ Params: { id: string } }>(
    "/band-submissions/:id",
    async (request, reply) => {
      const sub = await ctx.store.getById(request.params.id);
      if (!sub) return reply.code(404).send({ error: "Not found" });

      // MVP: devolvemos status + reason + publishedBandId
      return reply.send({
        id: sub.id,
        status: sub.status,
        reviewReason: sub.reviewReason,
        publishedBandId: sub.publishedBandId,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      });
    }
  );
};
