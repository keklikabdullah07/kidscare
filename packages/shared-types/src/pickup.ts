export type PickupContact = {
  id: string;
  tenantId: string;
  studentId: string;
  fullName: string;
  relation: string;
  phone: string;
  identityNote?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PickupAuthorizationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

export type PickupAuthorization = {
  id: string;
  tenantId: string;
  studentId: string;
  pickupContactId?: string | null;
  requestedById: string;
  reviewedById?: string | null;
  status: PickupAuthorizationStatus;
  validFrom?: string | null;
  validUntil?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PickupVerificationMethod =
  | 'ID_CHECK'
  | 'PHONE_CONFIRM'
  | 'PASSWORD'
  | 'KNOWN_FACE'
  | 'OTHER';

export type PickupEvent = {
  id: string;
  tenantId: string;
  studentId: string;
  pickupContactId?: string | null;
  authorizationId?: string | null;
  pickupPersonName: string;
  pickupPersonPhone?: string | null;
  verificationMethod: PickupVerificationMethod;
  verifiedByUserId: string;
  occurredAt: string;
  note?: string | null;
};
