export {};
import express from "express";
import { loginHandler } from "../controllers/signin";
import { registerHandler } from "../controllers/register";
import { paymentHandler } from "../controllers/payment";
import verifyToken from "../middleware/verifyToken";

const router = express.Router();

router.post("/Signin", loginHandler);
router.post("/Register", registerHandler);
router.post("/Payment", verifyToken, paymentHandler);

export { router };
