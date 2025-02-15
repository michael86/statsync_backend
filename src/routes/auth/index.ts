import { Router } from "express";

import { validateRefreshToken } from "../../middleware/auth";
import { issueRefreshToken } from "../../controllers/auth";

const router = Router();

router.post("/refresh", validateRefreshToken, issueRefreshToken);

export default router;
