import request from "supertest";
import { app, pool } from "../src/server"; // Ensure correct path

describe("Authentication Tests", () => {
  let refreshTokenId = "";

  afterAll(async () => {
    await pool.end(); // ✅ Close DB connection after tests
  });

  it("should log in and get tokens", async () => {
    const res = await request(app).post("/users/login").send({
      email: "test@gmail.com",
      password: "pass13",
    });

    console.log("Response Status:", res.status);
    console.log("Response Body:", res.body); // ✅ Debugging output

    expect(res.status).toBe(200);
    expect(res.body.body.accessToken).toBeDefined();
    expect(res.body.body.refreshToken).toBeDefined();
    expect(res.body.body.refreshTokenId).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();

    const rawCookies = res.headers["set-cookie"];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies || ""];

    refreshTokenId =
      cookies.find((cookie: string) => cookie.startsWith("refresh_token_id="))?.split("=")[1] || "";

    expect(refreshTokenId).toBeTruthy();
  });
});
