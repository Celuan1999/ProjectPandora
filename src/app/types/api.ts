// Core types for API requests and responses

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum ClearanceLevel {
  UNCLASSIFIED = 'UNCLASSIFIED',
  CLASSIFIED = 'CLASSIFIED',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET',
  P2P = 'P2P'
}

// Organization & Teams Types
export interface Org {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  clearance: ClearanceLevel;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  clearance: ClearanceLevel;
  teamIds: string[];
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

// Project Types
export interface Project {
  id: number;
  teamId: number;
  name: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: number;
  created_at: string;
  updated_at?: string;
  project_type?: string;
  security_level?: string;
}

// File Types
export interface FileItem {
  id: string;
  projectId: string;
  filename: string;
  mimetype: string;
  size: number;
  clearance_level: ClearanceLevel;
  storageKey: string;
  checksum?: string;
  status: 'UPLOADING' | 'SCANNING' | 'READY' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

// Access Override Types
export interface AccessOverride {
  id: string;
  resource_type: 'project' | 'file';
  resource_id: string;
  subject_user_id: string;
  effect: 'ALLOW' | 'DENY';
  starts_at?: string;
  ends_at?: string;
  createdAt: string;
  updatedAt: string;
}

// P2P Types
export interface P2PMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  text?: string;
  attachment_file_id?: string;
  expires_at?: string;
  state: 'PENDING' | 'DELIVERED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

// Audit Types
export interface AuditEvent {
  id: string;
  eventType: string;
  userId: string;
  resourceType: 'project' | 'file' | 'user' | 'team';
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
}

// Request Types
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
  role_on_team?: string;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  role: Role;
  clearance: ClearanceLevel;
  teamIds?: string[];
}

export interface UpdateUserRequest {
  role?: Role;
  clearance?: ClearanceLevel;
  teamChanges?: {
    add?: string[];
    remove?: string[];
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  teamId?: number;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: number;
  project_type?: string;
  security_level?: string;
}

export interface UpdateProjectRequest {
  teamId?: string;
  title?: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  role_on_project?: string;
}

export interface FileUploadIntentRequest {
  projectId: string;
  filename: string;
  mimetype: string;
  size: number;
  clearance_level: ClearanceLevel;
}

export interface FileCompleteRequest {
  fileId: string;
  checksum?: string;
}

export interface UpdateFileRequest {
  filename?: string;
}

export interface UpdateFileClearanceRequest {
  new_clearance: ClearanceLevel;
}

export interface CreateAccessOverrideRequest {
  resource_type: 'project' | 'file';
  resource_id: string;
  subject_user_id: string;
  effect: 'ALLOW' | 'DENY';
  starts_at?: string;
  ends_at?: string;
}

export interface CreateP2PRequest {
  recipient_id: string;
  text?: string;
  attachment_file_id?: string;
  expires_at?: string;
}

// Response Types
export interface CreateTeamResponse {
  teamId: string;
  name: string;
}

export interface CreateUserResponse {
  userId: string;
  orgId: string;
  role: Role;
  clearance: ClearanceLevel;
}

export interface CreateProjectResponse {
  projectId: string;
}

export interface FileUploadIntentResponse {
  fileId: string;
  uploadUrl: string;
  storageKey: string;
}

export interface FileCompleteResponse {
  status: 'SCANNING';
}

export interface FileDownloadIntentResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface CreateP2PResponse {
  p2pId: string;
  state: 'PENDING';
}

export interface P2PGetResponse {
  id: string;
  text?: string | null;
  attachment?: {
    downloadUrl: string;
    expiresAt: string;
  } | null;
}

export interface ProjectsListResponse {
  items: Project[];
  nextCursor?: string;
}

export interface FilesListResponse {
  items: FileItem[];
  nextCursor?: string;
}

export interface AuditListResponse {
  items: AuditEvent[];
  nextCursor?: string;
}

export interface ProjectSummaryResponse {
  countsByClearance: Record<ClearanceLevel, number>;
  recentEvents: AuditEvent[];
}

export interface RemoveResponse {
  removed: boolean;
}

export interface AddResponse {
  added: boolean;
}

// Query Parameters
export interface ProjectsQueryParams {
  teamId?: string;
  ownerId?: string;
  q?: string;
  deadlineStart?: string;
  deadlineEnd?: string;
  cursor?: string;
  limit?: number;
}

export interface FilesQueryParams {
  q?: string;
  mime?: string;
  cursor?: string;
  limit?: number;
}

export interface AuditQueryParams {
  projectId?: string;
  fileId?: string;
  userId?: string;
  type?: string;
  since?: string;
  until?: string;
  cursor?: string;
  limit?: number;
}

export interface ReassignmentsQueryParams {
  since?: string;
  cursor?: string;
  limit?: number;
}
