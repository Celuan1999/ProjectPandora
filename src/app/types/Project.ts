export interface Project {
  id: string;
  title: string;
  description: string;
  funding: number;
  companyName: string;
  securityLevel: string;
  projectType: string; // Now supports any string value, including dynamic types
  imageUrl?: string;
  startDate: string;
  expectedDate: string;
  actualDate: string;
  progressData: ProgressDataPoint[];
  workOrders: WorkOrder[];
}

export interface ProgressDataPoint {
  date: string;
  progress: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  assignee: {
    name: string;
    role: string;
    avatar?: string;
  };
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export enum SecurityLevel {
  PUBLIC = 'Public',
  INTERNAL = 'Internal',
  CONFIDENTIAL = 'Confidential',
  SECRET = 'Secret',
  TOP_SECRET = 'Top Secret'
}

export enum ProjectType {
  ENGINEERING = 'Engineering',
  SOFTWARE = 'Software',
  SECURITY = 'Security',
  ROBOTICS = 'Robotics',
  AI = 'AI',
  SIGNAL = 'Signal',
}

// Helper function to get all project types including any dynamic ones
export function getAllProjectTypes(knownTypes: string[] = []): string[] {
  const enumTypes = Object.values(ProjectType);
  const uniqueTypes = new Set([...enumTypes, ...knownTypes]);
  return Array.from(uniqueTypes).sort();
}

// Helper function to check if a project type is valid
export function isValidProjectType(type: string): boolean {
  return Object.values(ProjectType).includes(type as ProjectType) || type.length > 0;
}
