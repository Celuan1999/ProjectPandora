import {
  Org,
  Membership,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  CreateTeamResponse,
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

// Organizations API
export const organizationsApi = {
  // GET /organizations/me
  getMe: async (authToken: string, orgId: string): Promise<{ org: Org; membership: Membership }> => {
    const response = await fetch(`${API_BASE_URL}/organizations/me`, {
      method: 'GET',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch organization: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Teams API
export const teamsApi = {
  // POST /org/teams
  createTeam: async (authToken: string, orgId: string, data: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const response = await fetch(`${API_BASE_URL}/org/teams`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.statusText}`);
    }
    
    return response.json();
  },

  // PATCH /org/teams/:id
  updateTeam: async (authToken: string, orgId: string, teamId: string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await fetch(`${API_BASE_URL}/org/teams/${teamId}`, {
      method: 'PATCH',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update team: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /org/teams/:id
  deleteTeam: async (authToken: string, orgId: string, teamId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/org/teams/${teamId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete team: ${response.statusText}`);
    }
    
    return response.json();
  },

  // POST /org/teams/:id/members
  addTeamMember: async (authToken: string, orgId: string, teamId: string, data: AddTeamMemberRequest): Promise<AddResponse> => {
    const response = await fetch(`${API_BASE_URL}/org/teams/${teamId}/members`, {
      method: 'POST',
      headers: getHeaders(authToken, orgId),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add team member: ${response.statusText}`);
    }
    
    return response.json();
  },

  // DELETE /org/teams/:id/members/:userId
  removeTeamMember: async (authToken: string, orgId: string, teamId: string, userId: string): Promise<RemoveResponse> => {
    const response = await fetch(`${API_BASE_URL}/org/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(authToken, orgId),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove team member: ${response.statusText}`);
    }
    
    return response.json();
  },
};
