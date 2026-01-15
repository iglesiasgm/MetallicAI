import { FastifyPluginAsync } from "fastify";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: { username: string; password: string } }>(
    "/auth/login",
    async (req, reply) => {
      const { username, password } = req.body;

      const user = await fastify.usersStore.findByUsername(username);
      if (!user) return reply.code(401).send({ error: "Invalid credentials" });

      const ok = await fastify.verifyPassword(password, user.passwordHash);
      if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

      const token = await reply.jwtSign(
        { id: user.id, username: user.username, role: user.role },
        { expiresIn: "7d" }
      );

      return reply.send({
        accessToken: token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    }
  );

  fastify.get(
    "/auth/me",
    { preHandler: fastify.authenticate },
    async (req: any) => {
      return {
        user: {
          id: req.user.sub,
          username: req.user.username,
          role: req.user.role,
        },
      };
    }
  );
};
