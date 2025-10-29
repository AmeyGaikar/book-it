import { Router } from 'express';
import { validatePromoCode } from '../controllers/promoController';

const router = Router();

router.post('/validate', validatePromoCode);

export default router;
