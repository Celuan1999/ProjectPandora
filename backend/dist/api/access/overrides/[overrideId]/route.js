"use strict";
// src/api/access/overrides/[overrideId]/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const overrideService_1 = require("../../../../services/overrideService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { overrideId } = req.params;
    const result = await (0, overrideService_1.getOverride)(overrideId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.patch('/', async (req, res) => {
    const { overrideId } = req.params;
    const result = await (0, overrideService_1.updateOverride)(overrideId, req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.delete('/', async (req, res) => {
    const { overrideId } = req.params;
    const result = await (0, overrideService_1.deleteOverride)(overrideId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
