export type Page = 'dashboard' | 'reports' | 'logs' | 'users' | 'syllabus' | 'settings' | 'applications' | 'sbtet' | 'timetables' | 'feedback' | 'notebook' | 'reminders' | 'requests' | 'qr-scanner';

export enum Role {
    ADMIN = 'Admin',
    PRINCIPAL = 'Principal',
    HOD = 'HOD',
    FACULTY = 'Faculty',
    STAFF = 'Staff',
    STUDENT = 'Student',
}

export interface User {
    id: string; // uuid
    name: string;
    role: Role;
    pin: string; // e.g., 23-101-CS-001
    branch: string; // e.g., CS
    year: number; // e.g., 23
    college_code: string; // e.g., 101
    email: string;
    email_verified: boolean;
    parent_email?: string;
    parent_email_verified: boolean;
    imageUrl?: string;
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    LATE = 'Late',
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    userPin: string;
    date: string; // YYYY-MM-DD
    checkInTime: string | null; // HH:mm
    checkOutTime: string | null;
    status: AttendanceStatus;
    coordinate?: string;
    emailSent?: boolean;
}

export interface Syllabus {
    id: string; // uuid
    branch: string;
    subject: string;
    file_url: string;
    percent_completed: number;
    uploaded_by: string; // uuid of faculty
    uploaded_by_name: string;
    uploaded_at: string; // ISO 8601
}

export enum ApplicationType {
    LEAVE = 'Leave',
    BONAFIDE = 'Bonafide',
    TC = 'TC',
}

export enum ApplicationStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface Application {
    id: string;
    user_id: string;
    pin: string; // Added for easier lookup from admin panel
    type: ApplicationType;
    status: ApplicationStatus;
    payload: {
        reason?: string; // for leave, bonafide, tc
        purpose?: string; // for bonafide
        from_date?: string;
        to_date?: string;
        image_url?: string; // for leave letter attachment
    };
    created_at: string;
    decided_at?: string;
    processed_by_name?: string;
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  marks: number;
  passed: boolean;
}

export interface Result {
    id: string;
    pin: string;
    userName: string;
    branch: string;
    semester: number;
    sgpa: number;
    backlogs: number;
    subjects: SubjectResult[];
}

// --- NEW: Types for Consolidated Academic History ---
export interface SubjectMark {
    subCode: string;
    subjectName: string;
    internal: number;
    external: number;
    total: number;
    credits: number;
}

export interface SemesterResult {
    semester: number;
    sgpa: number;
    status: 'Pass' | 'Fail';
    subjects: SubjectMark[];
}

export interface AcademicHistory {
    studentName: string;
    pin: string;
    branch: string;
    // Summary
    overallCGPA: number;
    totalCredits: number;
    totalBacklogs: number;
    // Details
    semesters: SemesterResult[];
}


export interface Timetable {
    id: string;
    branch: string;
    file_url: string;
    effective_from: string;
    uploaded_by: string;
}

export interface Feedback {
    id: string;
    user_id: string; // The user who submitted it
    user_name: string; // Denormalized for easy display
    user_role: Role; // Denormalized for easy display
    category: 'Suggestion' | 'Bug Report' | 'Other';
    message: string;
    is_anonymous: boolean;
    created_at: string; // ISO 8601
}

export interface PptSlide {
    title: string;
    points: string[];
    notes?: string;
}

export interface PptContent {
    title: string;
    slides: PptSlide[];
}

export interface QuizQuestion {
    type: 'multiple-choice' | 'short-answer';
    question: string;
    options?: string[];
    answer: string;
}

export interface QuizContent {
    questions: QuizQuestion[];
}

export interface Reminder {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    created_by: string; // user id of principal
}