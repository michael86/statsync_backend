import { generateAndStoreTokens } from "../../utils/auth";
import { selectUserEmail } from "../../queries/userQueries";
import { IssueRefreshToken } from "../../types/authTypes";
import { deleteRefreshToken } from "../../queries/authQueries";

export const issueRefreshToken: IssueRefreshToken = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { refresh_token_id } = req.cookies;
    if (!userId) throw new Error("User id was not present in the header");

    const email = await selectUserEmail(userId);
    if (!email) throw new Error("Failed to select user Email");

    //as we're about to issue a new refresh token, delete this one as it is valid and should not be used any mroe
    const deleted = await deleteRefreshToken(refresh_token_id!);
    if (!deleted) {
      console.warn(`⚠️ Old refresh token not found: ${refresh_token_id}`);
    }

    const { refreshToken } = await generateAndStoreTokens(req, res, userId, email);

    res
      .status(200)
      .json({ status: "success", message: "token created", refresh_token: refreshToken });
  } catch (error) {
    console.error("❌ Error in issueRefreshToken:", error);
    res.status(500).json({ status: "Internal server error" });
  }
};
