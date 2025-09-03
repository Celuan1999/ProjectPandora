// src/jobs/overridesExpiryWorker.ts

// Mock database (replace with your ORM, e.g., Prisma)
const db = {
  expireOverrides: async (): Promise<number> => {
    // Placeholder: Delete overrides where expiresAt < now
    console.log('Expired overrides');
    return 42; // Mock number of expired overrides
  },
};

/**
 * Expires outdated access overrides
 * @returns Number of expired overrides
 */
async function expireOverrides(): Promise<number> {
  try {
    console.log('Starting overrides expiry job...');
    const count = await db.expireOverrides();
    console.log(`Overrides expiry completed. Expired ${count} overrides.`);
    return count;
  } catch (error) {
    console.error(`Overrides expiry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return 0;
  }
}

/**
 * Runs the overrides expiry job on a schedule
 * @param intervalMs Interval in milliseconds (e.g., 3600000 for 1 hour)
 */
export function startOverridesExpiryWorker(intervalMs: number = 3600000): void {
  console.log(`Starting overrides expiry worker with interval ${intervalMs}ms`);
  expireOverrides(); // Run immediately
  setInterval(expireOverrides, intervalMs);
}

// Example usage (call this in your main application or job scheduler):
// startOverridesExpiryWorker(3600000); // Run every hour