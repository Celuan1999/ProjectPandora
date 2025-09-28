// src/api/projects/[projectId]/upload-image/route.ts

import { Request, Response } from 'express';
import { uploadProjectImage } from '../../../../services/projectService';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  },
});

export default async function uploadProjectImageHandler(req: Request, res: Response) {
  try {
    // Use multer to handle file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          type: '/errors/invalid-input',
          title: 'Invalid File',
          status: 400,
          detail: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          type: '/errors/invalid-input',
          title: 'Missing File',
          status: 400,
          detail: 'No image file provided'
        });
      }

      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({
          type: '/errors/invalid-input',
          title: 'Invalid Project ID',
          status: 400,
          detail: 'Project ID must be a valid number'
        });
      }

      // Create a File object from the uploaded buffer
      const imageFile = new File([new Uint8Array(req.file.buffer)], req.file.originalname, {
        type: req.file.mimetype
      });

      const result = await uploadProjectImage(projectId, imageFile);
      
      if (result.error) {
        return res.status(result.status).json(result.error);
      }
      
      return res.status(result.status).json({ data: result.data });
    });
  } catch (error) {
    return res.status(500).json({
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
