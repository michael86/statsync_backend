import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db";

export const getUsersQuery = async () => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users"); // Extract rows
    return rows.length > 0 ? rows : null; // Return a single user or null if not found
  } catch (error) {
    console.error(new Error("❌ Failed to get users\n"), error);
    return null; // Explicitly return null on failure
  }
};

export const getUserQuery = async (id: number) => {
  try {
    if (isNaN(id)) throw new Error("❌ ID must be a number");

    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]); // Extract rows
    return rows.length > 0 ? rows[0] : null; // Return a single user or null if not found
  } catch (error) {
    console.error(new Error("❌ Failed to get user\n"), error);
    return null; // Explicitly return null on failure
  }
};

type RegisterUser = (
  email: string,
  password: string,
  username: string
) => Promise<number | "DUPLICATE_ENTRY" | null>;

export const registerUserQuery: RegisterUser = async (email, password, username) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)",
      [email, password, username]
    );

    return result.affectedRows > 0 ? result.insertId : null; // Return user ID if inserted, else null
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Failed to register user:", error.message);
    }

    // Handle MySQL-specific errors
    if ("code" in (error as any)) {
      const sqlError = error as Error & { code?: string };
      console.log("MySQL Error Code:", sqlError.code);

      if (sqlError.code === "ER_DUP_ENTRY") {
        return "DUPLICATE_ENTRY"; // Return custom string for duplicate email/username
      }
    }

    return null;
  }
};

type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date; // ✅ Corrected from number to Date
} & RowDataPacket; // ✅ Ensures it's treated as a RowDataPacket
type QueryUser = (email: string) => Promise<UserRow[] | null>;

export const queryUserByEmail: QueryUser = async (email) => {
  try {
    const [user] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);
    return user.length > 0 ? user : null;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
};
