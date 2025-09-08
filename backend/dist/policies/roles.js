"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.ROLES = void 0;
// backend/src/policies/roles.ts
const logger_1 = require("../lib/logger");
const enum_1 = require("../types/enum");
Object.defineProperty(exports, "ROLES", { enumerable: true, get: function () { return enum_1.ROLES; } });
const hasRole = (context, requiredRole, requestId) => {
    if (context.role !== requiredRole) {
        logger_1.logger.warn('Insufficient role', {
            requestId,
            userId: context.userId,
            orgId: context.orgId,
            requiredRole,
            userRole: context.role,
        });
        return false;
    }
    logger_1.logger.info('Role validated', {
        requestId,
        userId: context.userId,
        orgId: context.orgId,
        requiredRole,
        userRole: context.role,
    });
    return true;
};
exports.hasRole = hasRole;
