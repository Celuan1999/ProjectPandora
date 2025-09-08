"use strict";
// src/api/access/overrides/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const overrideService_1 = require("../../../services/overrideService");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const result = await (0, overrideService_1.addOverride)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
