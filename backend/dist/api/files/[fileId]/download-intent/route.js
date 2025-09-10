"use strict";
// src/api/files/[fileId]/download-intent/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileService_1 = require("../../../../services/fileService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { fileId } = req.params;
    const result = await (0, fileService_1.downloadIntent)(fileId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
