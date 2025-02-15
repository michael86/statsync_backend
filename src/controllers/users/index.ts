import { RequestHandler } from "express";
import {
  getUsersQuery,
  getUserQuery,
  registerUserQuery,
  queryUserByEmail,
} from "../../queries/userQueries";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { generateAndStoreTokens } from "../../utils/auth";

dotenv.config(); // Load environment variables from .env

type GetUsers = RequestHandler<{ id?: string }>;

/**
 * Retrieves all users or a specific user by ID.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with user data.
 */
export const getUsers: GetUsers = async (req, res): Promise<void> => {
  try {
    const data =
      req.params.id !== undefined ? await getUserQuery(+req.params.id) : await getUsersQuery();

    res.status(200).json({ status: "ok", data });
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    res.status(500).json({ status: "error", message: "Failed to retrieve users" });
  }
};

type RegisterUser = RequestHandler<
  {}, // Route parameters (none in this case)
  {}, // Response body (not explicitly defined)
  { username: string; email: string; password: string } // Request body
>;

/**
 * Registers a new user in the database.
 *
 * @param {Request} req - Express request object containing user details.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a success or error response.
 */
export const registerUser: RegisterUser = async (req, res): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await registerUserQuery(email, hashedPassword, username);

    if (result === "DUPLICATE_ENTRY") {
      res.status(409).json({ status: "error", message: "User already exists" });
      return;
    }

    if (result === null) {
      throw new Error(`Register User Failed: ${result}`);
    }

    const body = await generateAndStoreTokens(req, res, result, email);

    res.status(201).json({ status: "success", message: "User registered", body });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ status: "error", message: "Failed to register user" });
  }
};

/**
 * Authenticates a user and issues JWT & refresh tokens.
 *
 * @param {Request} req - Express request object containing login details.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a success response with auth tokens or an error message.
 */
export const loginUser: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await queryUserByEmail(email);

    if (!user || user.length === 0) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password_hash);

    if (!passwordMatch) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    const body = await generateAndStoreTokens(req, res, user[0].id, email);

    res.status(200).json({ status: "success", message: "Login successful", body });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ status: "error", message: "Failed to login, please try again" });
  }
};

/**
 * Logs out the user by clearing authentication cookies.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Sends a success response.
 */
export const logoutUser: RequestHandler = (req, res): void => {
  res.clearCookie("access_token", { httpOnly: true });
  res.clearCookie("refresh_token_id", { httpOnly: true });

  res.status(200).json({ status: "success", message: "Logout successful" });
};
