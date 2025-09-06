// src/lib/storage.ts

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the uploads directory (create it if it doesn't exist)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch((err) => {
  console.error(`Failed to create uploads directory: ${err.message}`);
});

interface StorageOptions {
  projectId: string;
  fileName: string;
}

/**
 * Generates a local file path for uploading a file
 * @param options Project ID and file name
 * @returns Local file path
 */
export async function storeFile({ projectId, fileName }: StorageOptions): Promise<string> {
  try {
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const filePath = path.join(UPLOADS_DIR, projectId, uniqueFileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure project directory exists
    return filePath;
  } catch (error) {
    throw new Error(`Failed to generate file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves a local file path for downloading a file
 * @param options Project ID and file name
 * @returns Local file path
 */
export async function getFile({ projectId, fileName }: StorageOptions): Promise<string> {
  try {
    const filePath = path.join(UPLOADS_DIR, projectId, fileName);
    await fs.access(filePath); // Check if file exists
    return filePath;
  } catch (error) {
    throw new Error(`Failed to retrieve file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}