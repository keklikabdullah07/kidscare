export interface DailyMenu {
  id: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  breakfast: string[];
  lunch: string[];
  snack: string[];
  allergens: string[];
  calories?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMenuCreateInput {
  date: string; // YYYY-MM-DD
  breakfast?: string[] | undefined;
  lunch?: string[] | undefined;
  snack?: string[] | undefined;
  allergens?: string[] | undefined;
  calories?: number | null | undefined;
  notes?: string | null | undefined;
}

export interface DailyMenuUpdateInput {
  breakfast?: string[] | undefined;
  lunch?: string[] | undefined;
  snack?: string[] | undefined;
  allergens?: string[] | undefined;
  calories?: number | null | undefined;
  notes?: string | null | undefined;
}

export interface AllergenWarningSummary {
  studentId: string;
  studentName: string;
  matchedAllergens: string[];
}
