import request from "supertest";
import { app, pool } from "../src/server"; // Ensure correct path
import { RowDataPacket } from "mysql2/promise"; // ✅ Import type helper

describe("Authentication Tests", () => {
  let refreshTokenId = "";

  it("should log in and get tokens", async () => {
    const res = await request(app).post("/users/login").send({
      email: "test@gmail.com",
      password: "MysuperStrongpass123!!",
    });

    // ✅ Ensure the response has the expected structure
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("body.refreshToken");
    expect(res.body).toHaveProperty("body.accessToken");
    expect(res.body).toHaveProperty("body.refreshTokenId");
    expect(res.headers["set-cookie"]).toBeDefined();

    // ✅ Extract cookies safely
    const rawCookies = res.headers["set-cookie"];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies || ""];

    refreshTokenId =
      cookies.find((cookie: string) => cookie.startsWith("refresh_token_id="))?.split("=")[1] || "";

    expect(refreshTokenId).toBeTruthy();
  });
});

describe("Refresh Token Security", () => {
  let refreshTokenId: string;

  beforeAll(async () => {
    // Create a test user and get a valid refresh token
    const res = await request(app).post("/users/login").send({
      email: "test@gmail.com",
      password: "MysuperStrongpass123!!",
    });

    // ✅ Ensure the response has the correct structure before accessing properties
    if (!res.body || !res.body.body || !res.body.body.refreshTokenId) {
      throw new Error("❌ Login failed: refreshTokenId not found in response.");
    }

    refreshTokenId = res.body.body.refreshTokenId;
  });

  test("Should delete refresh token if User-Agent does not match", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refresh_token_id=${refreshTokenId}`]) // Send valid refresh_token_id
      .set("User-Agent", "FakeUserAgent") // Simulate a different browser
      .send({ refresh_token: "ValidButStolenToken" });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("invalid refresh token");

    // ✅ Fix: Explicitly type rows as an array of objects
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM refresh_tokens WHERE id = ?", [
      refreshTokenId,
    ]);

    // ✅ Now TypeScript recognizes `length`
    expect(rows.length).toBe(0); // The refresh token should be deleted
  });

  afterAll(async () => {
    await pool.end(); // ✅ Now safe to close the database connection after all tests
  });
});
