export type DevelopmentDomain =
  'DIL' | 'MOTOR' | 'SOSYAL_DUYGUSAL' | 'BILISSEL' | 'OZ_BAKIM' | 'SANAT';

export interface DevelopmentObservationDto {
  id: string;
  tenantId: string;
  studentId: string;
  teacherId: string;
  domain: DevelopmentDomain;
  skillName: string;
  observation: string;
  observedAt: string;
  isParentVisible: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    email: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  portfolioItems?: PortfolioItemDto[];
}

export interface CreateDevelopmentObservationDto {
  studentId: string;
  domain: DevelopmentDomain;
  skillName: string;
  observation: string;
  observedAt?: string;
  isParentVisible?: boolean;
}

export interface PortfolioItemDto {
  id: string;
  tenantId: string;
  studentId: string;
  observationId?: string | null;
  title: string;
  description?: string | null;
  mediaUrl: string;
  isParentVisible: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreatePortfolioItemDto {
  studentId: string;
  observationId?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  isParentVisible?: boolean;
}

export interface HomeActivitySuggestionDto {
  id: string;
  tenantId: string;
  domain: DevelopmentDomain;
  ageGroup?: string | null;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateHomeActivitySuggestionDto {
  domain: DevelopmentDomain;
  ageGroup?: string;
  title: string;
  description: string;
}
