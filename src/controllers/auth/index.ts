import { generateAndStoreTokens } from "../../utils/auth";
import { selectUserEmail, selectUserUsername } from "../../queries/userQueries";
import { IssueRefreshToken, MeController } from "../../types/authTypes";
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
      console.warn(`Old refresh token not found: ${refresh_token_id}`);
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

export const meController: MeController = async (req, res) => {
  try {
    console.log("in me controller");
    if (!req.user)
      throw new Error(`User does not exist on meController.\nExpected behaviour, to be there! `);

    const id = +req.user.id;

    if (!Number.isInteger(id)) {
      res.status(401).json({ status: "error", message: "Invalid query" });
      return;
    }

    const user = {
      email: await selectUserEmail(id),
      username: await selectUserUsername(id),
    };

    if (!user.email || !user.username) {
      res.status(401).json({ status: "error", message: "user doesn't exist" });
      return;
    }

    res.status(200).json({ user });
    return;
  } catch (error) {
    console.error(`Failed to validate me\n${error}`);
    res.status(500).send();
    return;
  }
};
