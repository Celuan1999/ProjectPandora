"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.updateUserRole = void 0;
// backend/src/services/users.ts
const supabaseServer_1 = require("../../lib/supabaseServer");
const logger_1 = require("../../lib/logger");
const roles_1 = require("../../policies/roles");
const enum_1 = require("../../types/enum");
const updateUserRole = async (adminCtx, input, requestId) => {
    if (adminCtx.role !== roles_1.ROLES.ADMIN || adminCtx.clearance < enum_1.SECURITY_LEVELS.CONFIDENTIAL) { // Updated: LEVEL_2 -> CONFIDENTIAL
        logger_1.logger.warn('Unauthorized role update attempt', {
            requestId,
            adminId: adminCtx.userId,
            targetUserId: input.userId,
            orgId: input.orgId,
        });
        return false;
    }
    const validRoles = Object.values(roles_1.ROLES);
    const validClearances = Object.values(enum_1.SECURITY_LEVELS);
    if (!validRoles.includes(input.role) || !validClearances.includes(input.clearance)) { // Kept Object.values for enum
        logger_1.logger.warn('Invalid role or clearance', {
            requestId,
            adminId: adminCtx.userId,
            targetUserId: input.userId,
            orgId: input.orgId,
            role: input.role,
            clearance: input.clearance,
        });
        return false;
    }
    logger_1.logger.info('Updating user role', {
        requestId,
        adminId: adminCtx.userId,
        targetUserId: input.userId,
        orgId: input.orgId,
        role: input.role,
        clearance: input.clearance,
    });
    const { error } = await supabaseServer_1.supabase
        .from('user_roles')
        .upsert({
        user_id: input.userId,
        org_id: input.orgId,
        role: input.role,
        clearance: input.clearance,
    });
    if (error) {
        logger_1.logger.error('Failed to update user role', {
            requestId,
            adminId: adminCtx.userId,
            targetUserId: input.userId,
            orgId: input.orgId,
            error: error.message,
        });
        return false;
    }
    logger_1.logger.info('User role updated', {
        requestId,
        adminId: adminCtx.userId,
        targetUserId: input.userId,
        orgId: input.orgId,
        role: input.role,
        clearance: input.clearance,
    });
    return true;
};
exports.updateUserRole = updateUserRole;
const getUserDetails = async (userCtx, targetUserId, orgId, requestId) => {
    if (userCtx.role !== roles_1.ROLES.ADMIN || userCtx.clearance < enum_1.SECURITY_LEVELS.CONFIDENTIAL) {
        logger_1.logger.warn('Unauthorized user details request', {
            requestId,
            userId: userCtx.userId,
            targetUserId,
            orgId,
        });
        return null;
    }
    logger_1.logger.info('Fetching user details', { requestId, userId: userCtx.userId, targetUserId, orgId });
    const { data: userRoleData, error: roleError } = await supabaseServer_1.supabase
        .from('user_roles')
        .select('role, clearance')
        .eq('user_id', targetUserId)
        .eq('org_id', orgId)
        .single();
    if (roleError || !userRoleData) {
        logger_1.logger.warn('User role not found', { requestId, userId: userCtx.userId, targetUserId, orgId, error: roleError?.message });
        return null;
    }
    const { data: userData, error: userError } = await supabaseServer_1.supabase.auth.admin.getUserById(targetUserId);
    if (userError || !userData?.user) {
        logger_1.logger.warn('User not found in Supabase auth', { requestId, userId: userCtx.userId, targetUserId, orgId, error: userError?.message });
        return null;
    }
    logger_1.logger.info('User details fetched', { requestId, userId: userCtx.userId, targetUserId, orgId });
    return {
        id: targetUserId,
        email: userData.user.email,
        role: userRoleData.role,
        clearance: userRoleData.clearance,
    };
};
exports.getUserDetails = getUserDetails;
