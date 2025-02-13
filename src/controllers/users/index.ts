import { RequestHandler } from "express";
import {
  getUsersQuery,
  getUserQuery,
  registerUserQuery,
  queryUserByEmail,
} from "../../queries/userQueries";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";

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

    const token = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res
      .status(200)
      .cookie("jwt", token, {
        httpOnly: true, // ✅ Prevents XSS attacks
        secure: true, // ✅ Required when SameSite=None (only works over HTTPS)
        sameSite: "none", // ✅ Allows cross-origin requests (CORS)
        maxAge: 15 * 60 * 1000, // Token expires in 15 minutes
      })
      .send({ status: "valid" });
  } catch (error) {
    res.status(500).send({ status: "failed to login user, try again" });
  }
};
