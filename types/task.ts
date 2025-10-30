// src/types/task.ts
export enum TaskType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  FORM = 'FORM',
  PICK_ONE = 'PICK_ONE',
  CHECKLIST = 'CHECKLIST',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Task {
  id: string;
  challengeId: string;
  tabName: string;
  title: string;
  description: string;
  taskType: TaskType;
  dueDate?: string;
  isRequired: boolean;
  completionRule: string;
  options?: TaskOptions;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskOptions {
  questions?: QuizQuestion[];
  items?: string[];
  choices?: string[];
  fields?: FormField[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea';
  required: boolean;
}

export interface TaskWithSubmission extends Task {
  submission: {
    id: string;
    status: SubmissionStatus;
    submittedAt: string;
    content?: any;
    fileUrls?: string[];
  } | null;
}

export interface Submission {
  id: string;
  taskId: string;
  teenId: string;
  content: any;
  fileUrls: string[];
  status: SubmissionStatus;
  score?: number;
  reviewerId?: string;
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface SubmitTaskData {
  taskId: string;
  content: any;
  files?: FileUpload[];
}

export interface FileUpload {
  uri: string;
  type: string;
  name: string;
}

export interface TaskDetailResponse {
  task: Task;
  submission: Submission | null;
}