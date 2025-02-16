import request from "supertest";
import { app, pool } from "../src/server"; // Ensure correct path
import { RowDataPacket } from "mysql2/promise"; // ✅ Import type helper

describe("Authentication Tests", () => {
  let refreshTokenId = "";

  it("should log in and get tokens", async () => {
    const res = await request(app).post("/users/login").send({
      email: "test@gmail.com", // ✅ Using test account
      password: "MysuperStrongpass123!!",
    });

    console.log("🔍 Response Status:", res.status);
    console.log("🔍 Full Login Response:", JSON.stringify(res.body, null, 2)); // ✅ Debugging output

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
  let secondSessionRefreshTokenId: string;
  let oldRefreshToken: string;

  beforeAll(async () => {
    // ✅ First session login
    const res1 = await request(app).post("/users/login").send({
      email: "test@gmail.com", // ✅ Using test account
      password: "MysuperStrongpass123!!",
    });

    console.log("🔍 Full Login Response (First Session):", JSON.stringify(res1.body, null, 2));

    if (!res1.body || !res1.body.body || !res1.body.body.refreshTokenId) {
      throw new Error("❌ Login failed: refreshTokenId not found in first session.");
    }

    refreshTokenId = res1.body.body.refreshTokenId;
    oldRefreshToken = res1.body.body.refreshToken; // Save old refresh token for replay test

    // ✅ Second session login (simulating login from a different device)
    const res2 = await request(app).post("/users/login").send({
      email: "test@gmail.com", // ✅ Using test account
      password: "MysuperStrongpass123!!",
    });

    console.log("🔍 Full Login Response (Second Session):", JSON.stringify(res2.body, null, 2));

    if (!res2.body || !res2.body.body || !res2.body.body.refreshTokenId) {
      throw new Error("❌ Login failed: refreshTokenId not found in second session.");
    }

    secondSessionRefreshTokenId = res2.body.body.refreshTokenId;

    // Ensure both sessions have unique refresh tokens
    expect(refreshTokenId).not.toEqual(secondSessionRefreshTokenId);
  });

  test("Should delete refresh token if User-Agent does not match", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refresh_token_id=${refreshTokenId}`]) // Send valid refresh_token_id
      .set("User-Agent", "FakeUserAgent") // Simulate a different browser
      .send({ refresh_token: "ValidButStolenToken" });

    console.log("🔍 Refresh Response:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("invalid refresh token");

    // ✅ Fix: Explicitly type rows as an array of objects
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM refresh_tokens WHERE id = ?", [
      refreshTokenId,
    ]);

    console.log("🔍 Refresh Token Query Result:", rows); // Debugging

    // ✅ Now TypeScript recognizes `length`
    expect(rows.length).toBe(0); // The refresh token should be deleted
  });

  test("Should reject an expired refresh token", async () => {
    // Simulate an expired refresh token by manually updating the database
    await pool.query(
      "UPDATE refresh_tokens SET expires_at = NOW() - INTERVAL 1 MINUTE WHERE id = ?",
      [refreshTokenId]
    );

    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refresh_token_id=${refreshTokenId}`])
      .send({ refresh_token: oldRefreshToken });

    console.log("🔍 Expired Refresh Token Response:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("invalid refresh token");
  });

  test("Should reject a replayed old refresh token", async () => {
    // Simulate an attacker trying to reuse a previously valid refresh token
    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refresh_token_id=${refreshTokenId}`]) // Using same refresh_token_id
      .send({ refresh_token: oldRefreshToken }); // Sending the old refresh token

    console.log("🔍 Replayed Refresh Token Response:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("invalid refresh token"); // Should be rejected
  });

  afterAll(async () => {
    console.log("Closing DB connection...");
    await pool.end(); // ✅ Now safe to close the database connection after all tests
  });
});
