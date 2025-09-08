"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClearanceLevelName = exports.hasSufficientClearance = void 0;
// backend/src/policies/clearance.ts
const logger_1 = require("../lib/logger");
const enum_1 = require("../types/enum");
const hasSufficientClearance = (context, requiredLevel, requestId) => {
    if (context.clearance < requiredLevel) {
        logger_1.logger.warn('Insufficient clearance level', {
            requestId,
            userId: context.userId,
            orgId: context.orgId,
            requiredLevel,
            userClearance: context.clearance,
        });
        return false;
    }
    logger_1.logger.info('Clearance validated', {
        requestId,
        userId: context.userId,
        orgId: context.orgId,
        requiredLevel,
        userClearance: context.clearance,
    });
    return true;
};
exports.hasSufficientClearance = hasSufficientClearance;
const getClearanceLevelName = (level) => {
    const levelEntry = Object.entries(enum_1.SECURITY_LEVELS).find(([, value]) => value === level);
    return levelEntry ? levelEntry[0] : 'UNKNOWN';
};
exports.getClearanceLevelName = getClearanceLevelName;
