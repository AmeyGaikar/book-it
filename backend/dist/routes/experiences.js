"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const experienceController_1 = require("../controllers/experienceController");
const router = (0, express_1.Router)();
router.get('/', experienceController_1.getAllExperiences);
router.get('/:id', experienceController_1.getExperienceById);
exports.default = router;
