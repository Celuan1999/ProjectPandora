"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
// backend/src/lib/auth.ts
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = require("./crypto");
const logger_1 = require("./logger");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const requireAuth = async (req, res, next) => {
    const requestId = (0, crypto_1.generateRequestId)();
    req.context = { requestId };
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        logger_1.logger.warn('Missing authorization token', { requestId });
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            logger_1.logger.warn('Invalid or expired token', { requestId });
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }
        req.user = { userId: user.id, email: user.email };
        logger_1.logger.info('User authenticated', { requestId, userId: user.id });
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error', { requestId, error: error.message });
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.requireAuth = requireAuth;
