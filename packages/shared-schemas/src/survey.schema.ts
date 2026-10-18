import { z } from 'zod';

export const surveyStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'CLOSED']);

export const surveyQuestionTypeSchema = z.enum([
  'RATING_1_5',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'OPEN_TEXT',
]);

export const surveyTargetTypeSchema = z.enum([
  'ALL_DAYCARE',
  'CLASSROOM',
  'SPECIFIC_STUDENTS',
  'TEACHERS_ONLY',
]);

export const createSurveyQuestionSchema = z
  .object({
    questionText: z.string().min(1, 'Soru metni boş bırakılamaz').max(500),
    questionType: surveyQuestionTypeSchema,
    options: z.array(z.string().min(1).max(200)).optional(),
    isRequired: z.boolean().optional(),
    orderIndex: z.number().int().optional(),
  })
  .strict();

export const createSurveySchema = z
  .object({
    title: z.string().min(1, 'Anket başlığı boş bırakılamaz').max(200),
    description: z.string().max(2000).optional(),
    targetType: surveyTargetTypeSchema,
    targetClassroomId: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    expiresAt: z.string().optional(),
    status: surveyStatusSchema.optional(),
    questions: z.array(createSurveyQuestionSchema).min(1, 'En az bir soru eklenmelidir'),
  })
  .strict();

export const submitSurveyAnswerSchema = z
  .object({
    questionId: z.string().min(1),
    ratingValue: z.number().int().min(1).max(5).optional(),
    selectedOptions: z.array(z.string()).optional(),
    textResponse: z.string().max(1000).optional(),
  })
  .strict();

export const submitSurveyResponseSchema = z
  .object({
    studentId: z.string().optional(),
    answers: z.array(submitSurveyAnswerSchema).min(1, 'En az bir soru yanıtlanmalıdır'),
  })
  .strict();

export const updateSurveyStatusSchema = z
  .object({
    status: surveyStatusSchema,
  })
  .strict();

export type CreateSurveyQuestionInput = z.infer<typeof createSurveyQuestionSchema>;
export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type SubmitSurveyAnswerInput = z.infer<typeof submitSurveyAnswerSchema>;
export type SubmitSurveyResponseInput = z.infer<typeof submitSurveyResponseSchema>;
export type UpdateSurveyStatusInput = z.infer<typeof updateSurveyStatusSchema>;
