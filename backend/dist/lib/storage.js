"use strict";
// src/lib/storage.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFile = storeFile;
exports.getFile = getFile;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Define the uploads directory (create it if it doesn't exist)
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
fs_1.promises.mkdir(UPLOADS_DIR, { recursive: true }).catch((err) => {
    console.error(`Failed to create uploads directory: ${err.message}`);
});
/**
 * Generates a local file path for uploading a file
 * @param options Project ID and file name
 * @returns Local file path
 */
async function storeFile({ projectId, fileName }) {
    try {
        const uniqueFileName = `${(0, uuid_1.v4)()}-${fileName}`;
        const filePath = path_1.default.join(UPLOADS_DIR, projectId, uniqueFileName);
        await fs_1.promises.mkdir(path_1.default.dirname(filePath), { recursive: true }); // Ensure project directory exists
        return filePath;
    }
    catch (error) {
        throw new Error(`Failed to generate file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Retrieves a local file path for downloading a file
 * @param options Project ID and file name
 * @returns Local file path
 */
async function getFile({ projectId, fileName }) {
    try {
        const filePath = path_1.default.join(UPLOADS_DIR, projectId, fileName);
        await fs_1.promises.access(filePath); // Check if file exists
        return filePath;
    }
    catch (error) {
        throw new Error(`Failed to retrieve file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
