import { Request, RequestHandler } from "express";
import { generateAndStoreTokens } from "../../utils/auth";
import { selectUserEmail } from "../../queries/userQueries";

interface RefreshRequest extends Request {
  headers: Request["headers"] & {
    user_id?: string;
  };
}

export const issueRefreshToken: RequestHandler = async (req: RefreshRequest, res, next) => {
  try {
    const userId = Number(req.headers.user_id);

    if (!userId) throw new Error("User id was not present in the header");

    const email = await selectUserEmail(userId);
    if (!email) throw new Error("Failed to select user Email");

    const { refreshToken } = await generateAndStoreTokens(req, res, userId, email);

    res
      .status(200)
      .json({ status: "success", message: "token created", refresh_token: refreshToken });
  } catch (error) {
    console.error("❌ Error in issueRefreshToken:", error);
    res.status(500).json({ status: "Internal server error" });
    return;
  }
};
