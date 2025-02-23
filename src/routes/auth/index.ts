import { Router } from "express";

import { validateMe, validateRefreshToken } from "../../middleware/auth";
import { issueRefreshToken, meController } from "../../controllers/auth";

const router = Router();

router.post("/refresh", validateRefreshToken, issueRefreshToken);
router.get("/me", validateMe, meController);

export default router;
