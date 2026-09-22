import { z } from 'zod';
export const classroomCreateSchema = z
    .object({
    name: z.string().trim().min(1).max(100),
    ageGroup: z.string().trim().max(100).optional(),
})
    .strict();
export const classroomUpdateSchema = z
    .object({
    name: z.string().trim().min(1).max(100).optional(),
    ageGroup: z.string().trim().max(100).nullable().optional(),
    isActive: z.boolean().optional(),
})
    .strict();
export const classroomTeacherAssignmentSchema = z
    .object({
    teacherId: z.string().min(1),
})
    .strict();
