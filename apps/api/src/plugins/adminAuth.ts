// apps/api/src/plugins/adminAuth.ts
import { FastifyPluginAsync } from "fastify";

export const adminAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("requireAdmin", async (req: any, reply: any) => {
    const key = req.headers["x-admin-key"];
    const adminKey = process.env.ADMIN_KEY;

    if (!adminKey) {
      return reply.code(500).send({ error: "ADMIN_KEY not configured" });
    }

    if (!key || key !== adminKey) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
};

declare module "fastify" {
  interface FastifyInstance {
    requireAdmin: (req: any, reply: any) => Promise<void>;
  }
}
