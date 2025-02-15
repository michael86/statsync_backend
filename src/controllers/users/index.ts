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
import { generateJwtToken, generateRefreshToken, setAuthCookies } from "../../utils/auth";

dotenv.config(); // Load environment variables from .env

type GetUsers = RequestHandler<{ id?: string }>;

/**
 * Retrieves all users or a specific user by ID.
 * @param {string} [req.params.id] - The user ID (optional).
 * @returns {Promise<void>} Sends a JSON response with user data.
 */
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

/**
 * Registers a new user in the database.
 * @param {string} req.body.email - The email address of the user.
 * @param {string} req.body.password - The plain-text password of the user.
 * @param {string} req.body.username - The chosen username of the user.
 * @returns {Promise<void>} Sends a success or error response.
 */
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

    res.status(201).send({ status: "user registered" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Failed to register user" });
  }
};

/**
 * Authenticates a user and issues JWT & refresh tokens.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @returns {Promise<void>} Sends a success response with auth tokens or an error message.
 */
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await queryUserByEmail(email);

    if (!user || user.length === 0) {
      res.status(404).send({ status: "no user found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password_hash);

    if (!passwordMatch) {
      res.status(401).json({ status: "Invalid credentials" });
      return;
    }

    const { id } = user[0];
    const accessToken = generateJwtToken("15m", { id, email });
    const refreshToken = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);

    const refreshId = await insertRefreshToken(
      user[0].id,
      await bcrypt.hash(refreshToken, 10),
      expiresAt
    );

    if (!refreshId) throw new Error("Failed to insert refresh token");

    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).send({ status: "valid" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ status: "Failed to login user, try again" });
  }
};

/**
 * Logs out the user by clearing authentication cookies.
 * @returns {void} Sends a success response.
 */
export const logoutUser: RequestHandler = (req, res) => {
  res.clearCookie("jwt"); // Remove JWT from client
  res.status(200).json({ status: "Logout successful" });
};
