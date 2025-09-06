// backend/src/services/users.ts
import { supabase } from '../../lib/supabaseServer';
import { logger } from '../../lib/logger';
import { ROLES, Role } from '../../policies/roles';
import { SECURITY_LEVELS } from '../../types/enum';

interface UserRoleInput {
  userId: string;
  orgId: string;
  role: Role;
  clearance: number;
}

interface UserDetails {
  id: string;
  email: string;
  role: Role;
  clearance: number;
}

export const updateUserRole = async (
  adminCtx: { userId: string; orgId: string; role: Role; clearance: number },
  input: UserRoleInput,
  requestId: string
): Promise<boolean> => {
  if (adminCtx.role !== ROLES.ADMIN || adminCtx.clearance < SECURITY_LEVELS.CONFIDENTIAL) { // Updated: LEVEL_2 -> CONFIDENTIAL
    logger.warn('Unauthorized role update attempt', {
      requestId,
      adminId: adminCtx.userId,
      targetUserId: input.userId,
      orgId: input.orgId,
    });
    return false;
  }

  const validRoles = Object.values(ROLES);
  const validClearances = Object.values(SECURITY_LEVELS);
  if (!validRoles.includes(input.role) || !validClearances.includes(input.clearance)) { // Kept Object.values for enum
    logger.warn('Invalid role or clearance', {
      requestId,
      adminId: adminCtx.userId,
      targetUserId: input.userId,
      orgId: input.orgId,
      role: input.role,
      clearance: input.clearance,
    });
    return false;
  }

  logger.info('Updating user role', {
    requestId,
    adminId: adminCtx.userId,
    targetUserId: input.userId,
    orgId: input.orgId,
    role: input.role,
    clearance: input.clearance,
  });

  const { error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: input.userId,
      org_id: input.orgId,
      role: input.role,
      clearance: input.clearance,
    });

  if (error) {
    logger.error('Failed to update user role', {
      requestId,
      adminId: adminCtx.userId,
      targetUserId: input.userId,
      orgId: input.orgId,
      error: error.message,
    });
    return false;
  }

  logger.info('User role updated', {
    requestId,
    adminId: adminCtx.userId,
    targetUserId: input.userId,
    orgId: input.orgId,
    role: input.role,
    clearance: input.clearance,
  });
  return true;
};

export const getUserDetails = async (
  userCtx: { userId: string; orgId: string; role: Role; clearance: number },
  targetUserId: string,
  orgId: string,
  requestId: string
): Promise<UserDetails | null> => {
  if (userCtx.role !== ROLES.ADMIN || userCtx.clearance < SECURITY_LEVELS.CONFIDENTIAL) {
    logger.warn('Unauthorized user details request', {
      requestId,
      userId: userCtx.userId,
      targetUserId,
      orgId,
    });
    return null;
  }

  logger.info('Fetching user details', { requestId, userId: userCtx.userId, targetUserId, orgId });
  const { data: userRoleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, clearance')
    .eq('user_id', targetUserId)
    .eq('org_id', orgId)
    .single();

  if (roleError || !userRoleData) {
    logger.warn('User role not found', { requestId, userId: userCtx.userId, targetUserId, orgId, error: roleError?.message });
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(targetUserId);
  if (userError || !userData?.user) {
    logger.warn('User not found in Supabase auth', { requestId, userId: userCtx.userId, targetUserId, orgId, error: userError?.message });
    return null;
  }

  logger.info('User details fetched', { requestId, userId: userCtx.userId, targetUserId, orgId });
  return {
    id: targetUserId,
    email: userData.user.email!,
    role: userRoleData.role,
    clearance: userRoleData.clearance,
  };
};