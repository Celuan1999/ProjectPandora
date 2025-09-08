"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.getUserOrgContext = void 0;
// backend/src/lib/supabaseServer.ts
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("./logger");
const roles_1 = require("../policies/roles");
const enum_1 = require("../types/enum");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
exports.supabase = supabase;
const getUserOrgContext = async (userId, orgId, requestId) => {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('org_id, role, clearance')
            .eq('user_id', userId)
            .eq('org_id', orgId)
            .single();
        if (error || !data) {
            logger_1.logger.warn('Failed to fetch user organization context', {
                requestId,
                userId,
                orgId,
                error: error?.message,
            });
            return null;
        }
        const validRoles = Object.values(roles_1.ROLES);
        const validClearances = Object.values(enum_1.SECURITY_LEVELS);
        if (!validRoles.includes(data.role) || !validClearances.includes(data.clearance)) { // Updated for enum
            logger_1.logger.warn('Invalid role or clearance', {
                requestId,
                userId,
                orgId,
                role: data.role,
                clearance: data.clearance,
            });
            return null;
        }
        const result = {
            orgId: data.org_id,
            role: data.role,
            clearance: data.clearance,
        };
        logger_1.logger.info('User organization context fetched', {
            requestId,
            userId,
            orgId,
            role: result.role,
            clearance: result.clearance,
        });
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error fetching user organization context', {
            requestId,
            userId,
            orgId,
            error: error.message,
        });
        return null;
    }
};
exports.getUserOrgContext = getUserOrgContext;
