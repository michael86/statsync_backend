import { RowDataPacket } from "mysql2";

export interface SelectedRefreshToken {
  user_id: string;
  token_hash: string;
  device_ip: string;
  user_agent: string;
  last_used_at: Date;
  refresh_count: number;
}

export type InsertRefreshToken = (
  userId: number,
  refreshTokenId: string,
  tokenHash: string,
  expires: Date,
  deviceIp: string,
  userAgent: string
) => Promise<string | undefined>;

export type SelectRefreshToken = (refreshTokenId: string) => Promise<SelectedRefreshToken | void>;

export type DeleteRefreshToken = (refreshTokenId: string) => Promise<boolean>;

export type QueryUser = (email: string) => Promise<UserRow[] | null>;

export type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date; // ✅ Corrected from number to Date
} & RowDataPacket; // ✅ Ensures it's treated as a RowDataPacket

export type UserEmailRow = {
  email: string;
} & RowDataPacket; // Ensures it's treated as a RowDataPacket

export type UserUsernameRow = {
  username: string;
} & RowDataPacket;

export type SelectUserEmail = (userId: number) => Promise<string | void>;
export type SelectUserUsername = (userId: number) => Promise<string | void>;
