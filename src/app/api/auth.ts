import { CreateUserRequest, CreateUserResponse, OrgUser } from '../types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function createNewUser(userId: string, email: string): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`, // Using userId as auth token
      'x-org-id': 'default-org', // Default organization ID
    },
    body: JSON.stringify({
      email,
      id: userId,
      role: 'USER' as const,
      clearance: 'UNCLASSIFIED' as const,
    } as CreateUserRequest),
  })

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchUserById(userId: string): Promise<OrgUser> {
  const response = await fetch(`${API_BASE_URL}/api/admin/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchUsers(authToken: string, orgId: string): Promise<{ data: OrgUser[] }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-org-id': orgId,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}
