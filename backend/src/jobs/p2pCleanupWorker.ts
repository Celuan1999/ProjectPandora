// src/jobs/p2pCleanupWorker.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

// Type guard for validation
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

// Mock database (replace with your ORM, e.g., Prisma)
const db = {
  getExpiredP2PShares: async (): Promise<{ id: string }[]> => {
    // Placeholder: Fetch P2P shares where expiresAt < now
    return [{ id: '123e4567-e89b-12d3-a456-426614174000' }]; // Mock data
  },
  cancelP2P: async (id: string): Promise<boolean> => {
    console.log(`Cancelled P2P share: ${id}`);
    return true;
  },
};

// Schema for validating P2P share IDs
const p2pIdSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Cleans up expired P2P shares
 */
async function cleanupP2PShares(): Promise<void> {
  try {
    console.log('Starting P2P cleanup job...');
    const expiredShares = await db.getExpiredP2PShares();
    
    for (const share of expiredShares) {
      const validation = parse(p2pIdSchema, share);
      if (!isValid(validation)) {
        console.error(`Invalid P2P share ID: ${JSON.stringify(share)}`);
        continue;
      }

      const { id } = validation.data;
      const success = await db.cancelP2P(id);
      if (success) {
        console.log(`Successfully cancelled P2P share: ${id}`);
      } else {
        console.error(`Failed to cancel P2P share: ${id}`);
      }
    }
    console.log(`P2P cleanup completed. Processed ${expiredShares.length} shares.`);
  } catch (error) {
    console.error(`P2P cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Runs the P2P cleanup job on a schedule
 * @param intervalMs Interval in milliseconds (e.g., 3600000 for 1 hour)
 */
export function startP2PCleanupWorker(intervalMs: number = 3600000): void {
  console.log(`Starting P2P cleanup worker with interval ${intervalMs}ms`);
  cleanupP2PShares(); // Run immediately
  setInterval(cleanupP2PShares, intervalMs);
}

// Example usage (call this in your main application or job scheduler):
// startP2PCleanupWorker(3600000); // Run every hour