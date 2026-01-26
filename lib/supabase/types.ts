export type UserRole = 'Student' | 'ARIES_Member' | 'Admin';
export type ProjectStatus = 'Open' | 'Launched' | 'Completed' | 'Terminated';
export type ParticipantRole = 'Mentor' | 'Mentee';
export type ParticipantStatus = 'Active' | 'Dropped' | 'Discharged';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  branch: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  prerequisites: string;
  learning_objectives: string;
  max_students: number;
  status: ProjectStatus;
  codebase_link: string | null;
  doc_link: string | null;
  ending_remarks: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectParticipant {
  id: string;
  project_id: string;
  user_id: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  prerequisites_met: boolean | null;
  prerequisites_notes: string | null;
  consent_to_share: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  student_id: string;
  mentor_id: string;
  review_text: string;
  created_at: string;
}

export interface ProjectWithCreator extends Project {
  creator: Profile;
}

export interface ProjectParticipantWithUser extends ProjectParticipant {
  user: Profile;
}

export interface ProjectWithParticipants extends Project {
  participants: ProjectParticipantWithUser[];
  creator: Profile;
}
