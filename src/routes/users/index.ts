import { Router } from "express";
import { getUsers, registerUser, loginUser, logoutUser } from "../../controllers/users";
import { registerUserValidation, loginUserValidation } from "../../middleware/users";
import { validateJWT } from "../../middleware/auth";

const router = Router();

router.get("/get/:id?", getUsers);
router.post("/register", registerUserValidation, registerUser);
router.post("/login", loginUserValidation, loginUser);
router.post("/logout", validateJWT, logoutUser);

export default router;
