"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const p2pCleanupWorker_1 = require("./jobs/p2pCleanupWorker");
const overridesExpiryWorker_1 = require("./jobs/overridesExpiryWorker");
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const route_1 = __importDefault(require("./api/org/me/route"));
const route_2 = __importDefault(require("./api/org/teams/route"));
const route_3 = __importDefault(require("./api/org/teams/[teamId]/route"));
const route_4 = __importDefault(require("./api/org/teams/[teamId]/members/route"));
const route_5 = __importDefault(require("./api/org/teams/[teamId]/members/[userId]/route"));
const route_6 = __importDefault(require("./api/admin/users/route"));
const route_7 = __importDefault(require("./api/admin/users/[userId]/route"));
const route_8 = __importDefault(require("./api/projects/route"));
const route_9 = __importDefault(require("./api/projects/[projectId]/route"));
const route_10 = __importDefault(require("./api/projects/[projectId]/members/route"));
const route_11 = __importDefault(require("./api/projects/[projectId]/members/[userId]/route"));
const route_12 = __importDefault(require("./api/projects/[projectId]/files/route"));
const route_13 = __importDefault(require("./api/files/upload-intent/route"));
const route_14 = __importDefault(require("./api/files/complete/route"));
const route_15 = __importDefault(require("./api/files/[fileId]/route"));
const route_16 = __importDefault(require("./api/files/[fileId]/clearance/route"));
const route_17 = __importDefault(require("./api/files/[fileId]/download-intent/route"));
const route_18 = __importDefault(require("./api/access/overrides/route"));
const route_19 = __importDefault(require("./api/access/overrides/[overrideId]/route"));
const route_20 = __importDefault(require("./api/p2p/route"));
const route_21 = __importDefault(require("./api/p2p/[p2pId]/route"));
const route_22 = __importDefault(require("./api/audit/route"));
const route_23 = __importDefault(require("./api/reports/reassignments/route"));
const route_24 = __importDefault(require("./api/reports/projects/[projectId]/summary/route"));
const logger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [new winston_1.transports.Console()],
});
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../Uploads')));
// Mount routers
app.use('/api/organizations/me', route_1.default);
app.use('/api/org/teams', route_2.default);
app.use('/api/org/teams/:teamId', route_3.default);
app.use('/api/org/teams/:teamId/members', route_4.default);
app.use('/api/org/teams/:teamId/members/:userId', route_5.default);
app.use('/api/admin/users', route_6.default);
app.use('/api/admin/users/:userId', route_7.default);
app.use('/api/projects', route_8.default);
app.use('/api/projects/:projectId', route_9.default);
app.use('/api/projects/:projectId/members', route_10.default);
app.use('/api/projects/:projectId/members/:userId', route_11.default);
app.use('/api/projects/:projectId/files', route_12.default);
app.use('/api/files/upload-intent', route_13.default);
app.use('/api/files/complete', route_14.default);
app.use('/api/files/:fileId', route_15.default);
app.use('/api/files/:fileId/clearance', route_16.default);
app.use('/api/files/:fileId/download-intent', route_17.default);
app.use('/api/access/overrides', route_18.default);
app.use('/api/access/overrides/:overrideId', route_19.default);
app.use('/api/p2p', route_20.default);
app.use('/api/p2p/:p2pId', route_21.default);
app.use('/api/audit', route_22.default);
app.use('/api/reports/reassignments', route_23.default);
app.use('/api/reports/projects/:projectId/summary', route_24.default);
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    (0, p2pCleanupWorker_1.startP2PCleanupWorker)(3600000);
    (0, overridesExpiryWorker_1.startOverridesExpiryWorker)(3600000);
});
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).json({
        type: '/errors/server-error',
        title: 'Server Error',
        status: 500,
        detail: err.message,
    });
});
