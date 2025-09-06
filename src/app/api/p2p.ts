import {
  CreateP2PRequest,
  CreateP2PResponse,
  P2PGetResponse,
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

// P2P (Peer-to-Peer) Messaging API
export const p2pApi = {
  // POST /p2p
  createMessage: async (authToken: string, orgId: string, data: CreateP2PRequest): Promise<CreateP2PResponse> => {
    const response = await fetch(`${API_BASE_URL}/p2p`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create P2P message: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /p2p/:id
  getMessage: async (authToken: string, orgId: string, p2pId: string): Promise<P2PGetResponse> => {
    const response = await fetch(`${API_BASE_URL}/p2p/${p2pId}`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get P2P message: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /p2p/:id
  deleteMessage: async (authToken: string, orgId: string, p2pId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/p2p/${p2pId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete P2P message: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Download attachment from P2P message (no auth header needed)
  downloadAttachment: async (downloadUrl: string): Promise<Blob> => {
    const response = await fetch(downloadUrl, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }
    
    return response.blob();
  },
};
