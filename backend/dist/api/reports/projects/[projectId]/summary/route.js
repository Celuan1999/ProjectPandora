"use strict";
// src/api/reports/projects/[projectId]/summary/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auditService_1 = require("../../../../../services/auditService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, auditService_1.getProjectSummary)(projectId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
