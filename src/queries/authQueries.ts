import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";

export const insertRefreshToken = async (userId: number, token: string, expires: Date) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)",
      [userId, token, expires]
    );

    if (!result.insertId) return;

    return result.insertId;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const selectRefreshToken = async (hashedToken: string) => {
  try {
    console.log("hashedToken ", hashedToken);
    const [token] = await pool.query<RowDataPacket[]>(
      "SELECT token_hash FROM refresh_tokens where token_hash = ?",
      [hashedToken]
    );

    console.log("result ", token);

    return token.length > 0;
  } catch (error) {
    console.error(error);
    return;
  }
};
