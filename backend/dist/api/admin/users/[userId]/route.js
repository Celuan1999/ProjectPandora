"use strict";
// src/api/admin/users/[userId]/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService_1 = require("../../../../services/userService");
const router = express_1.default.Router();
router.patch('/', async (req, res) => {
    const { userId } = req.params;
    const result = await (0, userService_1.updateUser)(userId, req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/', async (req, res) => {
    const { userId } = req.params;
    const result = await (0, userService_1.deleteUser)(userId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
