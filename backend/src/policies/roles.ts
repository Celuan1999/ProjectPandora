// backend/src/policies/roles.ts
import { logger } from '../lib/logger';
import { ROLES } from '../types/enum';

// Derive Role type from ROLES enum
export type Role = typeof ROLES[keyof typeof ROLES];

export { ROLES };

export const hasRole = (
  context: { userId: string; orgId: string; role: Role },
  requiredRole: Role,
  requestId: string
): boolean => {
  if (context.role !== requiredRole) {
    logger.warn('Insufficient role', {
      requestId,
      userId: context.userId,
      orgId: context.orgId,
      requiredRole,
      userRole: context.role,
    });
    return false;
  }
  logger.info('Role validated', {
    requestId,
    userId: context.userId,
    orgId: context.orgId,
    requiredRole,
    userRole: context.role,
  });
  return true;
};