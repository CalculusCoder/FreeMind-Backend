export {};
import express from "express";
import { loginHandler } from "../controllers/signin";
import { registerHandler } from "../controllers/register";
import { paymentHandler } from "../controllers/payment";

const router = express.Router();

router.get("/Login", loginHandler);
router.post("/Register", registerHandler);
router.post("/Payment", paymentHandler);

export { router };
