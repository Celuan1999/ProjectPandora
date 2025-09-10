"use strict";
// src/lib/workers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.startP2PCleanupWorker = startP2PCleanupWorker;
exports.startOverridesExpiryWorker = startOverridesExpiryWorker;
const supabase_js_1 = require("@supabase/supabase-js");
const p2pService_1 = require("../services/p2pService");
const overrideService_1 = require("../services/overrideService");
const logger_1 = require("./logger");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function startP2PCleanupWorker(intervalMs) {
    setInterval(async () => {
        try {
            const { data: expiredP2Ps, error } = await supabase
                .from('p2p')
                .select('id')
                .lte('expiresAt', new Date().toISOString())
                .not('expiresAt', 'is', null);
            if (error) {
                logger_1.logger.error(`P2P cleanup query failed: ${error.message}`);
                return;
            }
            for (const p2p of expiredP2Ps || []) {
                const result = await (0, p2pService_1.cancel)(p2p.id);
                if (result.error) {
                    logger_1.logger.error(`P2P cleanup failed for ID ${p2p.id}: ${result.error.detail}`);
                }
                else {
                    logger_1.logger.info(`P2P ${p2p.id} cancelled`);
                }
            }
            logger_1.logger.info('P2P cleanup completed');
        }
        catch (error) {
            logger_1.logger.error(`P2P cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, intervalMs);
}
async function startOverridesExpiryWorker(intervalMs) {
    setInterval(async () => {
        try {
            const result = await (0, overrideService_1.expireOverrides)();
            if (result.error) {
                logger_1.logger.error(`Override expiry failed: ${result.error.detail}`);
            }
            else {
                logger_1.logger.info('Override expiry completed');
            }
        }
        catch (error) {
            logger_1.logger.error(`Override expiry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, intervalMs);
}
