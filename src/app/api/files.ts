import {
  FileItem,
  FileUploadIntentRequest,
  FileCompleteRequest,
  UpdateFileRequest,
  UpdateFileClearanceRequest,
  FileUploadIntentResponse,
  FileCompleteResponse,
  FileDownloadIntentResponse,
  FilesListResponse,
  FilesQueryParams,
  RemoveResponse
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Helper function to get headers with auth and org context
const getHeaders = (authToken?: string, orgId?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth header
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Add org context header
  if (orgId) {
    headers['x-org-id'] = orgId;
  }
  
  return headers;
};

// Helper function to build query string
const buildQueryString = (params: FilesQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Files API
export const filesApi = {
  // GET /projects/:id/files
  getProjectFiles: async (authToken: string, orgId: string, projectId: string, queryParams: FilesQueryParams = {}): Promise<FilesListResponse> => {
    const queryString = buildQueryString(queryParams);
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files${queryString}`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }
    
    return response.json();
  },

  // POST /files/upload-intent
  createUploadIntent: async (authToken: string, orgId: string, data: FileUploadIntentRequest): Promise<FileUploadIntentResponse> => {
    const response = await fetch(`${API_BASE_URL}/files/upload-intent`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create upload intent: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Upload file directly to the upload URL (no auth header needed)
  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  },

  // POST /files/complete
  completeUpload: async (authToken: string, orgId: string, data: FileCompleteRequest): Promise<FileCompleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/files/complete`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to complete upload: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /files/:id/download-intent
  getDownloadIntent: async (authToken: string, orgId: string, fileId: string): Promise<FileDownloadIntentResponse> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download-intent`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get download intent: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Download file directly from the download URL (no auth header needed)
  downloadFile: async (downloadUrl: string): Promise<Blob> => {
    const response = await fetch(downloadUrl, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    return response.blob();
  },

  // PATCH /files/:id
  updateFile: async (authToken: string, orgId: string, fileId: string, data: UpdateFileRequest): Promise<FileItem> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'PATCH',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /files/:id
  deleteFile: async (authToken: string, orgId: string, fileId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    
    return response.json();
  },

  // PATCH /files/:id/clearance
  updateFileClearance: async (authToken: string, orgId: string, fileId: string, data: UpdateFileClearanceRequest): Promise<FileItem> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/clearance`, {
      method: 'PATCH',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update file clearance: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Complete file upload flow
  uploadFileComplete: async (
    authToken: string,
    orgId: string,
    file: File,
    projectId: string,
    clearanceLevel: string
  ): Promise<FileCompleteResponse> => {
    // Step 1: Create upload intent
    const uploadIntent = await filesApi.createUploadIntent(authToken, orgId, {
      projectId,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      clearance_level: clearanceLevel as any,
    });

    // Step 2: Upload file to the provided URL
    await filesApi.uploadFile(uploadIntent.uploadUrl, file);

    // Step 3: Complete the upload
    return filesApi.completeUpload(authToken, orgId, {
      fileId: uploadIntent.fileId,
    });
  },
};
