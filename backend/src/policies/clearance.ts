// backend/src/policies/clearance.ts
import { logger } from '../lib/logger';
import { SECURITY_LEVELS } from '../types/enum';

interface ClearanceContext {
  userId: string;
  orgId: string;
  clearance: number;
}

export const hasSufficientClearance = (
  context: ClearanceContext,
  requiredLevel: number,
  requestId: string
): boolean => {
  if (context.clearance < requiredLevel) {
    logger.warn('Insufficient clearance level', {
      requestId,
      userId: context.userId,
      orgId: context.orgId,
      requiredLevel,
      userClearance: context.clearance,
    });
    return false;
  }
  logger.info('Clearance validated', {
    requestId,
    userId: context.userId,
    orgId: context.orgId,
    requiredLevel,
    userClearance: context.clearance,
  });
  return true;
};

export const getClearanceLevelName = (level: number): string => {
  const levelEntry = Object.entries(SECURITY_LEVELS).find(
    ([, value]) => value === level
  );
  return levelEntry ? levelEntry[0] : 'UNKNOWN';
};