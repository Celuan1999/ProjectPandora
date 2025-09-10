"use strict";
// src/api/reports/projects/[projectId]/summary/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectService_1 = require("../../../../../services/projectService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, projectService_1.getProjectSummary)(projectId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
