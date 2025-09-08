"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOrgContext = void 0;
const logger_1 = require("./logger");
const resolveOrgContext = async (req, res, next) => {
    const requestId = req.context?.requestId;
    const orgId = req.headers['x-org-id'];
    if (!orgId) {
        logger_1.logger.warn('Missing organization ID', { requestId });
        return res.status(400).json({ error: 'Organization ID required' });
    }
    req.org = { orgId, role: 'MEMBER', clearance: 1 }; // Placeholder: Fetch from Supabase
    next();
};
exports.resolveOrgContext = resolveOrgContext;
