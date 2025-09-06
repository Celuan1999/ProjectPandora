import {
  AuditEvent,
  AuditListResponse,
  ProjectSummaryResponse,
  AuditQueryParams,
  ReassignmentsQueryParams
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
const buildQueryString = (params: AuditQueryParams | ReassignmentsQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Audit & Reports API
export const auditApi = {
  // GET /audit
  getAuditEvents: async (authToken: string, orgId: string, queryParams: AuditQueryParams = {}): Promise<AuditListResponse> => {
    const queryString = buildQueryString(queryParams);
    const response = await fetch(`${API_BASE_URL}/audit${queryString}`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audit events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /reports/reassignments
  getReassignments: async (authToken: string, orgId: string, queryParams: ReassignmentsQueryParams = {}): Promise<AuditListResponse> => {
    const queryString = buildQueryString(queryParams);
    const response = await fetch(`${API_BASE_URL}/reports/reassignments${queryString}`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reassignments: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /reports/projects/:id/summary
  getProjectSummary: async (authToken: string, orgId: string, projectId: string): Promise<ProjectSummaryResponse> => {
    const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/summary`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project summary: ${response.statusText}`);
    }
    
    return response.json();
  },
};
