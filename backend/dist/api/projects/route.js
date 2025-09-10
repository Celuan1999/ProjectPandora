"use strict";
// src/api/projects/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectService_1 = require("../../services/projectService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const result = await (0, projectService_1.createProject)(req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.get('/', async (req, res) => {
    const result = await (0, projectService_1.listProjects)();
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
