"use strict";
// src/api/p2p/[p2pId]/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const p2pService_1 = require("../../../services/p2pService");
const router = (0, express_1.Router)();
router.get('/view-once', async (req, res) => {
    const { p2pId } = req.params;
    const result = await (0, p2pService_1.viewOnce)(p2pId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.delete('/', async (req, res) => {
    const { p2pId } = req.params;
    const result = await (0, p2pService_1.cancel)(p2pId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
