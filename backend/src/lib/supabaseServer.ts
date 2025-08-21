// backend/src/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { ROLES, Role } from '../policies/roles';
import { SECURITY_LEVELS } from '../types/enum';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

interface UserOrgContext {
  orgId: string;
  role: Role;
  clearance: number;
}

export const getUserOrgContext = async (
  userId: string,
  orgId: string,
  requestId: string
): Promise<UserOrgContext | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('org_id, role, clearance')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      logger.warn('Failed to fetch user organization context', {
        requestId,
        userId,
        orgId,
        error: error?.message,
      });
      return null;
    }

    const validRoles = Object.values(ROLES);
    const validClearances = Object.values(SECURITY_LEVELS);
    if (!validRoles.includes(data.role) || !validClearances.includes(data.clearance)) { // Updated for enum
      logger.warn('Invalid role or clearance', {
        requestId,
        userId,
        orgId,
        role: data.role,
        clearance: data.clearance,
      });
      return null;
    }

    const result: UserOrgContext = {
      orgId: data.org_id,
      role: data.role,
      clearance: data.clearance,
    };

    logger.info('User organization context fetched', {
      requestId,
      userId,
      orgId,
      role: result.role,
      clearance: result.clearance,
    });

    return result;
  } catch (error) {
    logger.error('Error fetching user organization context', {
      requestId,
      userId,
      orgId,
      error: (error as Error).message,
    });
    return null;
  }
};

export { supabase };