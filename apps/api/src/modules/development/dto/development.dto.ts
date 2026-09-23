import { z } from 'zod';

export const developmentDomainSchema = z.enum([
  'DIL',
  'MOTOR',
  'SOSYAL_DUYGUSAL',
  'BILISSEL',
  'OZ_BAKIM',
  'SANAT',
]);

export const createDevelopmentObservationSchema = z.object({
  studentId: z.string().min(1, 'Öğrenci seçilmelidir'),
  domain: developmentDomainSchema,
  skillName: z.string().min(1, 'Kazanım / Beceri adı zorunludur'),
  observation: z.string().min(1, 'Gözlem notu zorunludur'),
  observedAt: z.string().datetime().optional(),
  isParentVisible: z.boolean().optional().default(true),
});

export const createPortfolioItemSchema = z.object({
  studentId: z.string().min(1, 'Öğrenci seçilmelidir'),
  observationId: z.string().optional(),
  title: z.string().min(1, 'Çalışma başlığı zorunludur'),
  description: z.string().optional(),
  mediaUrl: z.string().url('Geçerli bir medya URL girilmelidir'),
  isParentVisible: z.boolean().optional().default(true),
});

export const createHomeActivitySuggestionSchema = z.object({
  domain: developmentDomainSchema,
  ageGroup: z.string().optional(),
  title: z.string().min(1, 'Etkinlik başlığı zorunludur'),
  description: z.string().min(1, 'Etkinlik açıklaması zorunludur'),
});
