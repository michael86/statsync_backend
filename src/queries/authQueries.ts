import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import {
  DeleteRefreshToken,
  InsertRefreshToken,
  SelectedRefreshToken,
  SelectRefreshToken,
} from "src/types/queryTypes";

/**
 * Inserts a new refresh token into the database.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} tokenHash - The hashed refresh token.
 * @param {Date} expires - The expiration date of the refresh token.
 * @param {string} deviceIp - The user's IP address.
 * @param {string} userAgent - The user's browser and OS information.
 * @returns {Promise<string | undefined>} The `refresh_token_id` if successful, otherwise `undefined`.
 */
export const insertRefreshToken: InsertRefreshToken = async (
  userId,
  refreshTokenId,
  tokenHash,
  expires,
  deviceIp,
  userAgent
) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO refresh_tokens 
      (user_id, refresh_token_id, token_hash, device_ip, user_agent, last_used_at, refresh_count, expires_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), 0, ?)`,
      [userId, refreshTokenId, tokenHash, deviceIp, userAgent, expires]
    );

    return result.affectedRows > 0 ? refreshTokenId : undefined;
  } catch (error) {
    console.error("❌ Failed to insert refresh token:", error);
    return undefined;
  }
};

/**
 * Checks if a hashed refresh token exists in the database.
 *
 * @param {string} hashedToken - The hashed refresh token to check.
 * @returns {Promise<boolean>} `true` if the token exists, otherwise `false`.
 */
export const selectRefreshToken: SelectRefreshToken = async (refreshTokenId: string) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM refresh_tokens WHERE refresh_token_id = ? AND expires_at > NOW()",
      [refreshTokenId]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ Refresh token not found or expired: ${refreshTokenId}`);
      return;
    }

    return rows[0] as SelectedRefreshToken;
  } catch (error) {
    console.error("❌ Failed to select refresh token:", error);
    return;
  }
};

/**
 * Deletes a refresh token from the database by its ID.
 * @param {string} refreshTokenId - The token ID to delete.
 * @return {Promise<boolean>} - Returns true if successful, false if no rows were deleted.
 */
export const deleteRefreshToken: DeleteRefreshToken = async (refreshTokenId) => {
  try {
    // Explicitly define the return type of `pool.query()`
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM refresh_tokens WHERE refresh_token_id = ?",
      [refreshTokenId]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ Refresh token deleted: ${refreshTokenId}`);
      return true;
    } else {
      console.warn(`⚠️ No refresh token found for ID: ${refreshTokenId}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to delete refresh token:", error);
    return false;
  }
};
