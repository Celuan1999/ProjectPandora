// src/lib/workers.ts

import { createClient } from '@supabase/supabase-js';
import { cancel } from '../services/p2pService';
import { expireOverrides } from '../services/overrideService';
import { logger } from './logger';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function startP2PCleanupWorker(intervalMs: number): Promise<void> {
  setInterval(async () => {
    try {
      const { data: expiredP2Ps, error } = await supabase
        .from('p2p')
        .select('id')
        .lte('expiresAt', new Date().toISOString())
        .not('expiresAt', 'is', null);
      if (error) {
        logger.error(`P2P cleanup query failed: ${error.message}`);
        return;
      }
      for (const p2p of expiredP2Ps || []) {
        const result = await cancel(p2p.id);
        if (result.error) {
          logger.error(`P2P cleanup failed for ID ${p2p.id}: ${result.error.detail}`);
        } else {
          logger.info(`P2P ${p2p.id} cancelled`);
        }
      }
      logger.info('P2P cleanup completed');
    } catch (error) {
      logger.error(`P2P cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, intervalMs);
}

export async function startOverridesExpiryWorker(intervalMs: number): Promise<void> {
  setInterval(async () => {
    try {
      const result = await expireOverrides();
      if (result.error) {
        logger.error(`Override expiry failed: ${result.error.detail}`);
      } else {
        logger.info('Override expiry completed');
      }
    } catch (error) {
      logger.error(`Override expiry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, intervalMs);
}