// src/lib/userUtils.ts

import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export interface UserClearanceResult {
  clearance: number | null;
  error?: string;
}

/**
 * Fetches a user's clearance level from the users table (simplified version)
 * @param userId - The user ID to fetch clearance for
 * @returns Promise with clearance level (0-4) or null if not found
 */
export async function getUserClearanceSimple(userId: string): Promise<UserClearanceResult> {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('clearance')
      .eq('userId', userId)
      .single();

    if (error || !userData) {
      logger.warn('User clearance not found', { userId, error: error?.message });
      return { clearance: null, error: error?.message || 'User not found' };
    }

    return { clearance: userData.clearance };
  } catch (error) {
    logger.error('Failed to fetch user clearance', { userId, error: error instanceof Error ? error.message : 'Unknown error' });
    return { clearance: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
