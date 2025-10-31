"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promoController_1 = require("../controllers/promoController");
const router = (0, express_1.Router)();
router.post('/validate', promoController_1.validatePromoCode);
exports.default = router;
