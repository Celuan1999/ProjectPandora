// backend/src/types/models.ts
export interface Project {
  id: string;
  org_id: string;
  team_id: string;
  title: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: string;
  workOrders?: string[];
  documentation?: string[];
  prototypeMedia?: string[];
}