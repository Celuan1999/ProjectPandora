"use strict";
// src/api/admin/users/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../../../services/userService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const result = await (0, userService_1.createUser)(req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.get('/', async (req, res) => {
    const result = await (0, userService_1.getUsers)();
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
