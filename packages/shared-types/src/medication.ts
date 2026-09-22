export type StandaloneMedicationStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'GIVEN'
  | 'SKIPPED'
  | 'REJECTED';

export type MedicationRecord = {
  id: string;
  tenantId: string;
  studentId: string;
  medicationName: string;
  dosage: string;
  instructions?: string | null;
  scheduledAt?: string | null;
  givenAt?: string | null;
  status: StandaloneMedicationStatus;
  requestedById: string;
  approvedById?: string | null;
  administeredById?: string | null;
  parentApprovalNote?: string | null;
  rejectionReason?: string | null;
  skipReason?: string | null;
  createdAt: string;
  updatedAt: string;
};
