import express from 'express';
import { handleBfhlPost } from '../controllers/bfhlController.js';

const router = express.Router();

router.post('/', handleBfhlPost); // POST /bfhl endpoint [cite: 8]

export default router;