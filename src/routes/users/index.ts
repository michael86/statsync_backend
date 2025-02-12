import { Router } from "express";
import { getUsers, registerUser, loginUser } from "../../controllers/users";
import { registerUserValidation, loginUserValidation } from "../../middleware/users";

const router = Router();

router.get("/get/:id?", getUsers);
router.post("/register", registerUserValidation, registerUser);
router.post("/login", loginUserValidation, loginUser);

export default router;
