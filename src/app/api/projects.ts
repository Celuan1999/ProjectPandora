import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
  CreateProjectResponse,
  ProjectsListResponse,
  ProjectsQueryParams,
  RemoveResponse,
  AddResponse
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

// Projects API
export const projectsApi = {
  // POST /projects
  createProject: async (authToken: string, orgId: string, data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }
    
    return response.json();
  },

  // PATCH /projects/:id
  updateProject: async (authToken: string, orgId: string, projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PATCH',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /projects/:id
  deleteProject: async (authToken: string, orgId: string, projectId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /api/projects
  getProjects: async (authToken: string, orgId: string): Promise<{ data: Project[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET /projects/:id
  getProject: async (authToken: string, orgId: string, projectId: string): Promise<{ data: Project }> => {
    const response = await fetch(`${API_BASE_URL}/api/project/${projectId}`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
    
    return response.json();
  },

  // POST /projects/:id/members
  addProjectMember: async (authToken: string, orgId: string, projectId: string, data: AddProjectMemberRequest): Promise<AddResponse> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add project member: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /projects/:id/members/:userId
  removeProjectMember: async (authToken: string, orgId: string, projectId: string, userId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove project member: ${response.statusText}`);
    }
    
    return response.json();
  },
};
