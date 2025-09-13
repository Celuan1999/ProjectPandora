// backend/src/types/models.ts
export interface Project {
  id: number;
  org_id: number;
  team_id: number;
  title: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: string;
  workOrders?: string[];
  documentation?: string[];
  prototypeMedia?: string[];
  created_at: string[];
}