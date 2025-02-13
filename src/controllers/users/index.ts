import { RequestHandler } from "express";
import {
  getUsersQuery,
  getUserQuery,
  registerUserQuery,
  queryUserByEmail,
} from "../../queries/userQueries";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
import { insertRefreshToken } from "../../queries/authQueries";
import { generateJwtToken, setAuthCookies } from "../../utils/auth";

dotenv.config(); // Load environment variables from .env

type GetUsers = RequestHandler<{ id?: string }>;
export const getUsers: GetUsers = async (req, res) => {
  const data =
    req.params.id !== undefined ? await getUserQuery(+req.params.id) : await getUsersQuery();

  res.status(200).send({ status: "ok", data });
};

type RegisterUser = RequestHandler<
  {}, // Route parameters (none in this case)
  {}, // Response body (we're not specifying a custom response type here)
  { username: string; email: string; password: string } // Request body
>;

export const registerUser: RegisterUser = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await registerUserQuery(email, hashedPassword, username);

    if (result === "DUPLICATE_ENTRY") {
      res.status(409).send({ status: result });
      return;
    }

    if (result === null) throw new Error(`Register User: ${result}`);

    res.status(201).send({ status: "user registered " });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Failed to register user" });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await queryUserByEmail(email);

    if (!user || user.length === 0) {
      res.status(404).send({ status: "no user found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password_hash); //Don't hash the received password, .compare() does this

    if (!passwordMatch) {
      res.status(401).json({ status: "Invalid credentials" });
      return;
    }

    const { id } = user[0];
    const accessToken = generateJwtToken("15m", { id, email });
    const refreshToken = generateJwtToken("30d", { id, email });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); //  Add 30 days to the current date

    const refreshId = await insertRefreshToken(
      user[0].id,
      await bcrypt.hash(refreshToken, 10),
      expiresAt
    );

    if (!refreshId) throw new Error("Failed to insert refresh token");

    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).send({ status: "valid" });
  } catch (error) {
    res.status(500).send({ status: "failed to login user, try again" });
  }
};

export const logoutUser: RequestHandler = (req, res) => {
  res.clearCookie("jwt"); // Remove JWT from client
  res.status(200).json({ status: "Logout successful" });
};
