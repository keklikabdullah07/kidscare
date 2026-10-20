-- ===== Enums =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BroadcastTargetType') THEN
    CREATE TYPE "BroadcastTargetType" AS ENUM ('ALL_DAYCARE', 'CLASSROOM', 'SPECIFIC_STUDENTS', 'TEACHERS_ONLY');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BroadcastPriority') THEN
    CREATE TYPE "BroadcastPriority" AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SurveyStatus') THEN
    CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SurveyQuestionType') THEN
    CREATE TYPE "SurveyQuestionType" AS ENUM ('RATING_1_5', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'OPEN_TEXT');
  END IF;
END $$;

-- ===== broadcast_logs =====
CREATE TABLE IF NOT EXISTS "broadcast_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "targetType" "BroadcastTargetType" NOT NULL DEFAULT 'ALL_DAYCARE',
    "targetId" TEXT,
    "targetName" TEXT,
    "priority" "BroadcastPriority" NOT NULL DEFAULT 'NORMAL',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "channels" TEXT[] DEFAULT ARRAY['IN_APP', 'PUSH']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "broadcast_logs_tenantId_createdAt_idx" ON "broadcast_logs"("tenantId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_logs_tenantId_fkey') THEN
    ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_logs_senderId_fkey') THEN
    ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ===== surveys =====
CREATE TABLE IF NOT EXISTS "surveys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SurveyStatus" NOT NULL DEFAULT 'ACTIVE',
    "target_type" "BroadcastTargetType" NOT NULL DEFAULT 'ALL_DAYCARE',
    "target_classroom_id" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "survey_questions" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "question_text" TEXT NOT NULL,
    "question_type" "SurveyQuestionType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "survey_responses" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "student_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "survey_answers" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "rating_value" INTEGER,
    "selected_options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "text_response" TEXT,

    CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "surveys_tenant_id_status_idx" ON "surveys"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "survey_questions_survey_id_order_index_idx" ON "survey_questions"("survey_id", "order_index");
CREATE INDEX IF NOT EXISTS "survey_responses_survey_id_idx" ON "survey_responses"("survey_id");
CREATE UNIQUE INDEX IF NOT EXISTS "survey_responses_survey_id_respondent_id_key" ON "survey_responses"("survey_id", "respondent_id");
CREATE INDEX IF NOT EXISTS "survey_answers_response_id_idx" ON "survey_answers"("response_id");
CREATE INDEX IF NOT EXISTS "survey_answers_question_id_idx" ON "survey_answers"("question_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'surveys_tenant_id_fkey') THEN
    ALTER TABLE "surveys" ADD CONSTRAINT "surveys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'surveys_created_by_id_fkey') THEN
    ALTER TABLE "surveys" ADD CONSTRAINT "surveys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'surveys_target_classroom_id_fkey') THEN
    ALTER TABLE "surveys" ADD CONSTRAINT "surveys_target_classroom_id_fkey" FOREIGN KEY ("target_classroom_id") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_questions_survey_id_fkey') THEN
    ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_responses_survey_id_fkey') THEN
    ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_responses_respondent_id_fkey') THEN
    ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_responses_student_id_fkey') THEN
    ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_answers_response_id_fkey') THEN
    ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "survey_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'survey_answers_question_id_fkey') THEN
    ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ===== Grants and RLS =====
DO $$
BEGIN
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "surveys" TO kidscare_app;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_questions" TO kidscare_app;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_responses" TO kidscare_app;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_answers" TO kidscare_app;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "broadcast_logs" TO kidscare_app;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

ALTER TABLE "surveys" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "surveys";
CREATE POLICY tenant_isolation ON "surveys"
  USING ("tenant_id" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "broadcast_logs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "broadcast_logs";
CREATE POLICY tenant_isolation ON "broadcast_logs"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
