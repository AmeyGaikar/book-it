import { Router } from 'express';
import { getAllExperiences, getExperienceById } from '../controllers/experienceController';

const router = Router();

router.get('/', getAllExperiences);
router.get('/:id', getExperienceById);

export default router;
