export interface ActivityPost {
  id: string;
  tenantId: string;
  authorId: string;
  title: string;
  description: string | null;
  classroom: string | null;
  activityDate: string; // ISO string
  tags: string[];
  mediaUrls: string[];
  taggedStudentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityPostDto {
  title: string;
  description?: string | undefined;
  classroom?: string | undefined;
  activityDate?: string | undefined;
  tags?: string[] | undefined;
  mediaUrls: string[];
  taggedStudentIds?: string[] | undefined;
}

export interface ActivityFilterQuery {
  classroom?: string | undefined;
  studentId?: string | undefined;
  tag?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
