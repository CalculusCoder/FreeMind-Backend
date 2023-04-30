export {};
import express from 'express';
import { loginHandler } from '../controllers/signin';

const router = express.Router();

router.get('/Login', loginHandler);

export { router };
