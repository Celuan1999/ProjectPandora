"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const route_1 = require("./api/admin/users/route");
const route_2 = require("./api/projects/route");
const logger_1 = require("./lib/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express_1.default.json());
app.use('/api/admin/users', route_1.router);
app.use('/api/projects', route_2.router);
//Message needs to be first with the metadata second for Winston logging purposes
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`, { port: PORT });
});
