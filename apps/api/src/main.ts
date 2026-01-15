// apps/api/src/main.ts
import "dotenv/config";
import { buildServer } from "./server";

async function bootstrap() {
  const server = await buildServer();
  await server.listen({ port: 3001, host: "0.0.0.0" });
  console.log("Server running on http://localhost:3001");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
