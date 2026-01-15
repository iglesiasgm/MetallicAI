import { describe, it, expect } from "vitest";
import { buildServer } from "../server";

describe("band submissions (MVP)", () => {
  it("creates a submission", async () => {
    const server = await buildServer();

    const res = await server.inject({
      method: "POST",
      url: "/band-submissions",
      payload: {
        name: "Test Band",
        description: "desc",
        subgenres: ["Thrash Metal"],
        moods: ["Aggressive"],
        features: ["Fast riffs"],
        links: [{ spotify: "https://open.spotify.com/artist/xxx" }],
        contactEmail: "test@mail.com",
      },
    });

    expect(res.statusCode).toBe(202);
    const body = res.json();
    expect(body.submission.id).toBeTruthy();
    expect(body.submission.status).toBe("PENDING");
  });

  it("blocks admin list without key", async () => {
    const server = await buildServer();

    const res = await server.inject({
      method: "GET",
      url: "/admin/band-submissions?status=PENDING",
    });

    expect(res.statusCode).toBe(401);
  });
});
