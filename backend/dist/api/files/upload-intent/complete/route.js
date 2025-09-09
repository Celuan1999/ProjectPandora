"use strict";
// src/api/files/complete/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileService_1 = require("../../../../services/fileService");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const result = await (0, fileService_1.complete)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
