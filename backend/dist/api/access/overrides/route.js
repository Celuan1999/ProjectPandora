"use strict";
// src/api/access/overrides/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const overrideService_1 = require("../../../services/overrideService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const result = await (0, overrideService_1.addOverride)(req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
