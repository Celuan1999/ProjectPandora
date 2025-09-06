export interface Project {
  id: string;
  title: string;
  description: string;
  funding: number;
  companyName: string;
  securityLevel: SecurityLevel;
  projectType: ProjectType;
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
  SIGNAL = 'Signal'
}
