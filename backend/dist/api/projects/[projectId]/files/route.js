"use strict";
// src/api/projects/[projectId]/files/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileService_1 = require("../../../../services/fileService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, fileService_1.listByProject)(projectId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
