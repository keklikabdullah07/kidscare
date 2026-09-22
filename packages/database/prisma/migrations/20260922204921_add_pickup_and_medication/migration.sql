-- CreateEnum
CREATE TYPE "PickupAuthorizationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PickupVerificationMethod" AS ENUM ('ID_CHECK', 'PHONE_CONFIRM', 'PASSWORD', 'KNOWN_FACE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('REQUESTED', 'APPROVED', 'SCHEDULED', 'GIVEN', 'SKIPPED', 'REJECTED');

-- CreateTable
CREATE TABLE "pickup_contacts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "identityNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_authorizations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "pickupContactId" TEXT,
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "status" "PickupAuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "pickupContactId" TEXT,
    "authorizationId" TEXT,
    "pickupPersonName" TEXT NOT NULL,
    "pickupPersonPhone" TEXT,
    "verificationMethod" "PickupVerificationMethod" NOT NULL,
    "verifiedByUserId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "pickup_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "instructions" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "givenAt" TIMESTAMP(3),
    "status" "MedicationStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "administeredById" TEXT,
    "parentApprovalNote" TEXT,
    "rejectionReason" TEXT,
    "skipReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pickup_contacts_tenantId_studentId_idx" ON "pickup_contacts"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "pickup_contacts_tenantId_isActive_idx" ON "pickup_contacts"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "pickup_authorizations_tenantId_studentId_status_idx" ON "pickup_authorizations"("tenantId", "studentId", "status");

-- CreateIndex
CREATE INDEX "pickup_authorizations_tenantId_status_idx" ON "pickup_authorizations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "pickup_authorizations_tenantId_validUntil_idx" ON "pickup_authorizations"("tenantId", "validUntil");

-- CreateIndex
CREATE INDEX "pickup_events_tenantId_studentId_occurredAt_idx" ON "pickup_events"("tenantId", "studentId", "occurredAt");

-- CreateIndex
CREATE INDEX "pickup_events_tenantId_occurredAt_idx" ON "pickup_events"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "medication_records_tenantId_studentId_scheduledAt_idx" ON "medication_records"("tenantId", "studentId", "scheduledAt");

-- CreateIndex
CREATE INDEX "medication_records_tenantId_status_idx" ON "medication_records"("tenantId", "status");

-- CreateIndex
CREATE INDEX "medication_records_tenantId_scheduledAt_idx" ON "medication_records"("tenantId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "pickup_contacts" ADD CONSTRAINT "pickup_contacts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_contacts" ADD CONSTRAINT "pickup_contacts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_authorizations" ADD CONSTRAINT "pickup_authorizations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_authorizations" ADD CONSTRAINT "pickup_authorizations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_authorizations" ADD CONSTRAINT "pickup_authorizations_pickupContactId_fkey" FOREIGN KEY ("pickupContactId") REFERENCES "pickup_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_authorizations" ADD CONSTRAINT "pickup_authorizations_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_authorizations" ADD CONSTRAINT "pickup_authorizations_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_events" ADD CONSTRAINT "pickup_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_events" ADD CONSTRAINT "pickup_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_events" ADD CONSTRAINT "pickup_events_pickupContactId_fkey" FOREIGN KEY ("pickupContactId") REFERENCES "pickup_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_events" ADD CONSTRAINT "pickup_events_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "pickup_authorizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_events" ADD CONSTRAINT "pickup_events_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_records" ADD CONSTRAINT "medication_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_records" ADD CONSTRAINT "medication_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_records" ADD CONSTRAINT "medication_records_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_records" ADD CONSTRAINT "medication_records_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_records" ADD CONSTRAINT "medication_records_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
