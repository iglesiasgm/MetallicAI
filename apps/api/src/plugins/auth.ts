import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { UsersStore } from "../stores/users.store";
import { UserRole } from "../domain/users";

type Ctx = { usersStore: UsersStore };

export const authPlugin = fp<Ctx>(async (fastify, ctx) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  await fastify.register(fastifyJwt, { secret });

  fastify.decorate("usersStore", ctx.usersStore);

  fastify.decorate("authenticate", async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  fastify.decorate("requireRole", (role: UserRole) => {
    return async (req: any, reply: any) => {
      await fastify.authenticate(req, reply);
      if (reply.sent) return;

      // jwt payload lo dejamos como { sub, username, role }
      if (req.user?.role !== role) {
        return reply.code(403).send({ error: "Forbidden" });
      }
    };
  });

  // helper para login
  fastify.decorate("verifyPassword", async (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
  });
});

declare module "fastify" {
  interface FastifyInstance {
    usersStore: UsersStore;
    authenticate: (req: any, reply: any) => Promise<void>;
    requireRole: (role: UserRole) => (req: any, reply: any) => Promise<void>;
    verifyPassword: (plain: string, hash: string) => Promise<boolean>;
  }
}
