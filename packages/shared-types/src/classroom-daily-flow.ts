import type { Attendance } from './attendance';
import type { Classroom } from './classroom';
import type { DailyReport } from './daily-report';
import type { StudentSummary } from './student';

export type ClassroomDailyFlowStudent = {
  student: StudentSummary;
  attendance: Attendance | null;
  dailyReport: DailyReport | null;
};

export type ClassroomDailyFlow = {
  classroom: Pick<Classroom, 'id' | 'name' | 'ageGroup'>;
  date: string;
  students: ClassroomDailyFlowStudent[];
};
