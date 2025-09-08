"use strict";
// src/api/organizations/me/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orgService_1 = require("../../../services/orgService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    // Assume userId comes from auth middleware (e.g., req.user.id)
    const userId = 'user-uuid'; // Replace with actual auth logic
    const result = await (0, orgService_1.getUserOrg)(userId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
