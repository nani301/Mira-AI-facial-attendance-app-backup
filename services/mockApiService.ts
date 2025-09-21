

import type { User, AttendanceRecord, Syllabus, Application, Result, Timetable, Feedback, SubjectResult } from '../types';
import { Role, AttendanceStatus, ApplicationType, ApplicationStatus } from '../types';

// --- STATIC DATA AS PER REQUIREMENTS ---
const allStaffAndFaculty = [
    // Principal
    { id: 'princ_01', name: 'P. JANAKI DEVI', role: Role.PRINCIPAL, branch: 'ADMIN' },
    // HODs
    { id: 'hod_01', name: 'Dr. S.N PADMAVATHI', role: Role.HOD, branch: 'CS' },
    { id: 'hod_02', name: 'Dr. CH. VIDYA SAGAR', role: Role.HOD, branch: 'EC' },
    { id: 'hod_03', name: 'VANGALA INDIRA PRIYA DARSINI', role: Role.HOD, branch: 'MECH' },
    // Faculty
    { id: 'fac_01', name: 'ARCOT VIDYASAGAR', role: Role.FACULTY, branch: 'EC' }, // Matched from A.VIDYASAGAR
    { id: 'fac_02', name: 'J.ANAND KUMAR', role: Role.FACULTY, branch: 'EC' },
    { id: 'fac_03', name: 'B. SREE LAKSHMI', role: Role.FACULTY, branch: 'MECH' },
    { id: 'fac_04', name: 'BIDARUKOTA SHAKTHI KIRAN', role: Role.FACULTY, branch: 'IT' },
    { id: 'fac_05', name: 'HARESH NANDA', role: Role.FACULTY, branch: 'CS' },
    { id: 'fac_06', name: 'NAMBURU GOWTAMI', role: Role.FACULTY, branch: 'EC' },
    { id: 'fac_07', name: 'B.GOPALA RAO', role: Role.FACULTY, branch: 'EC' }, // Matched
    { id: 'fac_08', name: 'G.SADANANDAM', role: Role.FACULTY, branch: 'IT' },
    { id: 'fac_09', name: 'T.MANJULA', role: Role.FACULTY, branch: 'EC' }, // Matched
    { id: 'fac_10', name: 'UMASHANKAR', role: Role.FACULTY, branch: 'EC' }, // Matched
    { id: 'fac_11', name: 'DONDILETI SRINIVASA REDDY', role: Role.FACULTY, branch: 'CS' },
    { id: 'fac_12', name: 'WASEEM RUKSANA', role: Role.FACULTY, branch: 'EC' },
    { id: 'fac_13', name: 'G.RAJSHEKHARA REDDY', role: Role.FACULTY, branch: 'MECH' },
    // Staff
    { id: 'staff_01', name: 'G.VENKAT REDDY', role: Role.STAFF, branch: 'Library' }, // Librarian
    { id: 'staff_02', name: 'D. SUBRAMANYAM', role: Role.STAFF, branch: 'Labs' }, // Senior Instructor
    { id: 'staff_03', name: 'B. SRINIVAS GOUD', role: Role.STAFF, branch: 'Labs' }, // Lab Attender
    { id: 'staff_04', name: 'AFROZE JABEEN', role: Role.STAFF, branch: 'Office' }, // Admin Officer
    { id: 'staff_05', name: 'C.SATYAVATHI', role: Role.STAFF, branch: 'Office' }, // Office Superintendent
    { id: 'staff_06', name: 'MANDALA LAXMI DEVI', role: Role.STAFF, branch: 'Office' }, // Senior Assistant
    { id: 'staff_07', name: 'G.V.BABITHA', role: Role.STAFF, branch: 'Office' }, // Senior Assistant
    { id: 'staff_08', name: 'MATHANGI JAGDESHWAR RAO', role: Role.STAFF, branch: 'Office' }, // Junior Assistant
    { id: 'staff_09', name: 'K. SAILU', role: Role.STAFF, branch: 'Office' }, // Junior Assistant
    { id: 'staff_10', name: 'NAYAKOTI SUPRIYA', role: Role.STAFF, branch: 'Office' }, // Junior Assistant
    { id: 'staff_11', name: 'YERRAGOLLA NARSIMLU', role: Role.STAFF, branch: 'Office' }, // Office Subordinate
];

const studentData = [
    { pin: '23210-EC-001', name: 'KUMMARI VAISHNAVI' },
    { pin: '23210-EC-002', name: 'BAKAM CHANDU' },
    { pin: '23210-EC-003', name: 'TEKMAL MANIPRASAD' },
    { pin: '23210-EC-004', name: 'BATTA VENU' },
    { pin: '23210-EC-005', name: 'KAMMARI UDAY TEJA' },
    { pin: '23210-EC-006', name: 'BONGULURU VISHNU VARDHAN' },
    { pin: '23210-EC-007', name: 'JANGAM PRIYANKA' },
    { pin: '23210-EC-008', name: 'SUBEDAR ANISH' },
    { pin: '23210-EC-009', name: 'ARROLLA KAVYA' },
    { pin: '23210-EC-010', name: 'BANOTHU NARENDER' },
    { pin: '23210-EC-011', name: 'KUMMARI VARALAXMI' },
    { pin: '23210-EC-012', name: 'SHIVOLLA BHANUPRASAD' },
    { pin: '23210-EC-013', name: 'MUTHYALA VARUN KUMAR' },
    { pin: '23210-EC-014', name: 'ANGADI ANVESH' },
    { pin: '23210-EC-015', name: 'ABHIJITH SINGADE' },
    { pin: '23210-EC-017', name: 'CHERUKUPALLY KAVYA' },
    { pin: '23210-EC-018', name: 'KURWA SHIVA' },
    { pin: '23210-EC-019', name: 'MOHAMMAD AMER QUERESHI' },
    { pin: '23210-EC-020', name: 'VEENAVANKA RADHAKRISHNA' },
    { pin: '23210-EC-021', name: 'BEMIDGE PANDU' },
    { pin: '23210-EC-022', name: 'DOSAVARI ROHITH' },
    { pin: '23210-EC-024', name: 'NAKKA SUSWITH' },
    { pin: '23210-EC-025', name: 'RAMAVATH RANI' },
    { pin: '23210-EC-026', name: 'LAVURI SANDEEP' },
    { pin: '23210-EC-027', name: 'PALABINDELA MAHESH' },
    { pin: '23210-EC-028', name: 'PUTTI VISHNU VARDHAN' },
    { pin: '23210-EC-029', name: 'DASARI OM PRAKASH' },
    { pin: '23210-EC-030', name: 'AKKIREDDYGARI JASHWANTHREDDY' },
    { pin: '23210-EC-032', name: 'TELANG PRUTHVI GOUD' },
    { pin: '23210-EC-033', name: 'ALLARI SHIVA RAJ' },
    { pin: '23210-EC-035', name: 'BANDI RUTHIK' },
    { pin: '23210-EC-036', name: 'PEDDA PATLLOLLA RISHIDER REDDY' },
    { pin: '23210-EC-037', name: 'DUBBAKA ADITHYA' },
    { pin: '23210-EC-038', name: 'G.BHANU PRAKASH ' },
    { pin: '23210-EC-039', name: 'PULI SAI RAJ' },
    { pin: '23210-EC-041', name: 'RATHOD SANGRAM' },
    { pin: '23210-EC-042', name: 'MA NADEEM' },
    { pin: '23210-EC-043', name: 'GADDAMIDI NANDA KISHORE' },
    { pin: '23210-EC-044', name: 'RAGULA BHAVANI' },
    { pin: '23210-EC-045', name: 'BEGARI SAMPATH' },
    { pin: '23210-EC-046', name: 'JETTY SATHWIKA' },
    { pin: '23210-EC-047', name: 'E NAGESH GOUD' },
    { pin: '23210-EC-048', name: 'KOTHLAPURAM VAISHNAVI' },
    { pin: '23210-EC-050', name: 'BAGGU HEMANI' },
    { pin: '23210-EC-051', name: 'NARSAGONI ANUSHA' },
    { pin: '23210-EC-052', name: 'CHANDILA POOJA' },
    { pin: '23210-EC-053', name: 'ESUKAPALLI NANI' },
    { pin: '23210-EC-054', name: 'KAMMARI RANJITH KUMAR CHARY' },
    { pin: '23210-EC-055', name: 'DEVUNI ANIL KUMAR' },
    { pin: '23210-EC-056', name: 'KUMMARI ARAVIND' },
    { pin: '23210-EC-058', name: 'GOLLA PANDU' },
    { pin: '23210-EC-060', name: 'POCHARAM NAGESHWAR' },
    { pin: '23210-EC-061', name: 'GUNDA SRISHILAM' },
    { pin: '23210-EC-062', name: 'CHAKALI KRISHNA PRASAD' },
    { pin: '23210-CS-001', name: 'ADAPA NIKHIL' },
    { pin: '23210-CS-002', name: 'ARELLY VAMSHI' },
    { pin: '23210-CS-003', name: 'BATHINI SHIVANI' },
    { pin: '23210-CS-004', name: 'BOBBILI SHIVAKUMAR' },
    { pin: '23210-CS-005', name: 'CHINTHAKINDI SHIREESHA' },
];

let users: User[] = [
    ...allStaffAndFaculty.map(p => {
        const pin = `${p.role.toUpperCase()}-${p.id.split('_')[1]}`;
        const backgroundColor = 
            p.role === Role.PRINCIPAL ? 'b6e3f4' : 
            p.role === Role.HOD ? 'a78bfa' : 
            p.role === Role.FACULTY ? 'c0aede' : 'ffd5a1';
        return {
            ...p,
            pin: pin,
            year: 0,
            college_code: '210',
            email: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mira.edu`,
            email_verified: true,
            parent_email_verified: false,
            imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=${backgroundColor}`,
        };
    }),
    ...studentData.map((s, i) => {
        const pinParts = s.pin.split('-'); // e.g., ['23210', 'EC', '004']
        return {
            id: `stu_${i.toString().padStart(3, '0')}`,
            name: s.name,
            role: Role.STUDENT,
            pin: s.pin,
            branch: pinParts[1], // Correctly get branch 'EC'
            year: parseInt(pinParts[0].substring(0, 2)), // Get year '23'
            college_code: pinParts[0].substring(2,5), // Get college '210'
            email: `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mira.edu`,
            email_verified: Math.random() > 0.3,
            parent_email: `parent.${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@email.com`,
            parent_email_verified: Math.random() > 0.5,
            imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(s.name)}`,
        };
    })
];


// --- MOCK DATA GENERATION (for other features) ---

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const attendanceRecords: AttendanceRecord[] = [];
users.filter(u => u.role === Role.STUDENT).forEach(user => {
    // Each student gets a personalized, semi-random attendance probability
    const attendanceProbability = 0.6 + Math.random() * 0.35; // Attendance between 60% and 95%
    for (let i = 0; i < 90; i++) { // Generate for the last 3 months
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (date.getDay() === 0) continue; // No school on Sundays

        const id = `att_${user.id}_${formatDate(date)}`;
        
        if (Math.random() < attendanceProbability) { // Student is present
            const late = Math.random() > 0.9; // 10% chance of being late
            attendanceRecords.push({
                id, userId: user.id, userName: user.name, userPin: user.pin, date: formatDate(date),
                checkInTime: late ? `09:${Math.floor(Math.random()*30)+15}` : `08:${Math.floor(Math.random()*25)+30}`,
                checkOutTime: `17:${Math.floor(Math.random()*30)}`,
                status: late ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
            });
        } else { // Student is absent
             attendanceRecords.push({
                id, userId: user.id, userName: user.name, userPin: user.pin, date: formatDate(date),
                checkInTime: null, checkOutTime: null, status: AttendanceStatus.ABSENT,
            });
        }
    }
});
// Add mock attendance for faculty on the current date
users.filter(u => u.role === Role.FACULTY || u.role === Role.HOD).forEach(faculty => {
    if (Math.random() > 0.1) { // 90% chance present
        attendanceRecords.unshift({
            id: `att_${faculty.id}_${formatDate(today)}`,
            userId: faculty.id, userName: faculty.name, userPin: faculty.pin, date: formatDate(today),
            checkInTime: `08:${Math.floor(Math.random()*25)+30}`, checkOutTime: null, status: AttendanceStatus.PRESENT,
        });
    }
});


const syllabusData: Syllabus[] = [
    { id: 'syl_me_501', branch: 'EC', subject: 'ME-501 Industrial Management & Enterpreneurship', file_url: '#', percent_completed: 85, uploaded_by: 'fac_09', uploaded_by_name: 'T.MANJULA', uploaded_at: '2025-09-15T10:00:00Z' },
    { id: 'syl_ec_502', branch: 'EC', subject: 'EC-502 Industrial Electronics', file_url: '#', percent_completed: 92, uploaded_by: 'fac_01', uploaded_by_name: 'ARCOT VIDYASAGAR', uploaded_at: '2025-09-20T11:00:00Z' },
    { id: 'syl_ec_503', branch: 'EC', subject: 'EC-503 Data Communication and Computer Networks', file_url: '#', percent_completed: 78, uploaded_by: 'fac_09', uploaded_by_name: 'T.MANJULA', uploaded_at: '2025-09-18T14:00:00Z' },
    { id: 'syl_ec_574', branch: 'EC', subject: 'EC-574 Mobile & Optical Fibre Communication', file_url: '#', percent_completed: 65, uploaded_by: 'fac_07', uploaded_by_name: 'B.GOPALA RAO', uploaded_at: '2025-09-12T09:30:00Z' },
    { id: 'syl_ec_585', branch: 'EC', subject: 'EC-585 Digital Circuit Design using Verilog VHDL', file_url: '#', percent_completed: 95, uploaded_by: 'fac_10', uploaded_by_name: 'UMASHANKAR', uploaded_at: '2025-09-22T16:00:00Z' },
    { id: 'syl_cs_517', branch: 'EC', subject: 'CS-517 Computer Hardware & Networking Lab', file_url: '#', percent_completed: 100, uploaded_by: 'fac_09', uploaded_by_name: 'T.MANJULA', uploaded_at: '2025-09-25T13:00:00Z' },
    { id: 'syl_ec_506', branch: 'EC', subject: 'EC-506 Industrial Electronics Lab', file_url: '#', percent_completed: 88, uploaded_by: 'fac_01', uploaded_by_name: 'ARCOT VIDYASAGAR', uploaded_at: '2025-09-21T15:00:00Z' },
    { id: 'syl_ec_508', branch: 'EC', subject: 'EC-508 LabView', file_url: '#', percent_completed: 70, uploaded_by: 'fac_07', uploaded_by_name: 'B.GOPALA RAO', uploaded_at: '2025-09-19T12:00:00Z' },
    { id: 'syl_ec_509', branch: 'EC', subject: 'EC-509 Digital Circuit Design using Verilog HDL', file_url: '#', percent_completed: 45, uploaded_by: 'fac_10', uploaded_by_name: 'UMASHANKAR', uploaded_at: '2025-09-24T10:00:00Z' },
    { id: 'syl_cs_01', branch: 'CS', subject: 'Data Structures', file_url: '#', percent_completed: 90, uploaded_by: 'hod_01', uploaded_by_name: 'Dr. S.N PADMAVATHI', uploaded_at: '2023-10-21T10:00:00Z' },
    { id: 'syl_it_01', branch: 'IT', subject: 'Web Technologies', file_url: '#', percent_completed: 75, uploaded_by: 'fac_04', uploaded_by_name: 'BIDARUKOTA SHAKTHI KIRAN', uploaded_at: '2023-10-20T14:30:00Z' },
];

let applications: Application[] = [
    { id: 'app_01', user_id: users.find(u => u.pin === '23210-EC-004')?.id || '', pin: '23210-EC-004', type: ApplicationType.LEAVE, status: ApplicationStatus.PENDING, payload: { reason: 'Family function', from_date: '2023-11-05', to_date: '2023-11-06'}, created_at: '2023-11-01T09:00:00Z' },
    { id: 'app_02', user_id: users.find(u => u.pin === '23210-EC-010')?.id || '', pin: '23210-EC-010', type: ApplicationType.BONAFIDE, status: ApplicationStatus.APPROVED, payload: { reason: 'Passport application' }, created_at: '2023-10-28T11:00:00Z', decided_at: '2023-10-29T15:00:00Z' },
];

const generateStudentResult = (student: User, subjects: { code: string, name: string }[]): Result => {
    let backlogs = 0;
    let totalGradePoints = 0;
    const subjectResults: SubjectResult[] = subjects.map(s => {
        const marks = 25 + Math.floor(Math.random() * 76); // Marks between 25 and 100
        const passed = marks >= 35;
        if (!passed) {
            backlogs++;
            totalGradePoints += 0;
        } else {
            totalGradePoints += Math.floor(marks / 10);
        }
        return { subjectCode: s.code, subjectName: s.name, marks, passed };
    });
    const sgpa = parseFloat((totalGradePoints / subjects.length).toFixed(2));
    return {
        id: `res_${student.id}`, pin: student.pin, userName: student.name,
        branch: student.branch, semester: 5, sgpa: Math.max(0, sgpa),
        backlogs, subjects: subjectResults
    };
};

const ecSubjects = [
    { code: 'ME-501', name: "Industrial Management & Enterpreneurship" }, { code: 'EC-502', name: "Industrial Electronics" },
    { code: 'EC-503', name: "Data Communication and Computer Networks" }, { code: 'EC-574', name: "Mobile & Optical Fibre Communication" },
    { code: 'EC-585', name: "Digital Circuit Design using Verilog VHDL" }
];
const csSubjects = [
    { code: 'CS-501', name: "Operating Systems" }, { code: 'CS-502', name: "Database Management" },
    { code: 'CS-503', name: "Software Engineering" }, { code: 'CS-504', name: "Web Technologies" }
];

const resultsData: Result[] = users
    .filter(u => u.role === Role.STUDENT)
    .map(student => {
        if (student.branch === 'EC') return generateStudentResult(student, ecSubjects);
        if (student.branch === 'CS') return generateStudentResult(student, csSubjects);
        return null;
    }).filter((r): r is Result => r !== null);


const timetables: Timetable[] = [];
const feedback: Feedback[] = [];

// --- Academic Constants ---
const ACADEMIC_CONSTANTS = {
    totalWorkingDays: 120,
    requiredAttendancePercentage: 75,
};

// --- API SIMULATION ---
const simulateDelay = <T>(data: T, delay = 300): Promise<T> => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// --- CONSTANTS API ---
export const getAcademicConstants = () => simulateDelay(ACADEMIC_CONSTANTS);

// --- AUTH ---
let authenticatedUserId = 'hod_02'; // Default to Dr. CH. VIDYA SAGAR
export const getAuthenticatedUser = () => simulateDelay(users.find(u => u.id === authenticatedUserId) || null);
export const setAuthenticatedUser = (userId: string) => {
    authenticatedUserId = userId;
    return simulateDelay(users.find(u => u.id === userId) || null);
}
export const getAllFaculty = () => simulateDelay(users.filter(u => u.role === Role.FACULTY || u.role === Role.HOD || u.role === Role.PRINCIPAL));

// --- DASHBOARD ---
export const getDashboardStats = (date: string) => {
    const dailyRecords = attendanceRecords.filter(r => r.date === date && r.userPin.startsWith('23')); // Only students
    const totalStudents = users.filter(u => u.role === Role.STUDENT).length;
    return simulateDelay({
        present: dailyRecords.filter(r => r.status !== AttendanceStatus.ABSENT).length,
        absent: totalStudents - dailyRecords.filter(r => r.status !== AttendanceStatus.ABSENT).length,
        total: totalStudents,
    });
};

// --- REPORTS ---
export const getAttendanceByDateAndBranch = (date: string, branch: string) => {
    const isFaculty = branch === 'FACULTY';
    const records = attendanceRecords.filter(r => {
        if (r.date !== date) return false;
        const user = users.find(u => u.id === r.userId);
        if (!user) return false;
        if (isFaculty) return user.role === Role.FACULTY || user.role === Role.PRINCIPAL || user.role === Role.HOD;
        return user.branch === branch;
    });
    return simulateDelay(records);
}

// --- ATTENDANCE LOG ---
export const getUserByDetails = ({ year, collegeCode, branch, roll }: { year: number, collegeCode: string, branch: string, roll: string}) => {
    const pin = `${year}${collegeCode}-${branch}-${roll.padStart(3, '0')}`;
    return simulateDelay(users.find(u => u.pin === pin) || null);
};

export const markAttendance = (userId: string, coords: {lat: number, lng: number}) => {
    const date = formatDate(new Date());
    const existing = attendanceRecords.find(r => r.userId === userId && r.date === date);
    const user = users.find(u => u.id === userId);
    
    // Check if attendance was already marked as present or late today
    if (existing && existing.status !== AttendanceStatus.ABSENT) {
        return simulateDelay({ success: false, message: `Attendance already marked today at ${existing.checkInTime}.` });
    }
    
    if (!user) return simulateDelay({ success: false, message: "User not found." });

    // If an "absent" record exists, update it. Otherwise, create a new record.
    if (existing && existing.status === AttendanceStatus.ABSENT) {
        existing.status = AttendanceStatus.PRESENT;
        existing.checkInTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        existing.coordinate = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    } else {
        attendanceRecords.unshift({
            id: `att_${userId}_${date}`,
            userId, userName: user.name, userPin: user.pin, date,
            checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            checkOutTime: null, status: AttendanceStatus.PRESENT,
            coordinate: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
        });
    }

    return simulateDelay({ success: true });
};

export const checkTodaysAttendance = (userId: string) => {
    const date = formatDate(new Date());
    const existing = attendanceRecords.find(r => r.userId === userId && r.date === date && r.status !== AttendanceStatus.ABSENT);
    return simulateDelay(existing || null);
};


export const sendEmail = (payload: {to: string, cc?: string, subject: string}) => {
    console.log("Simulating email send:", payload);
    return simulateDelay({ success: true });
};
export const getAttendanceByUserId = (userId: string) => {
    return simulateDelay(attendanceRecords.filter(r => r.userId === userId));
}

// --- MANAGE USERS ---
export const getUsers = () => simulateDelay(users);
export const addUser = (user: User) => {
    users.push(user);
    return simulateDelay(user);
}
export const updateUser = (userId: string, updates: Partial<User>) => {
    let user = users.find(u => u.id === userId);
    if(user) {
        Object.assign(user, updates);
    }
    return simulateDelay(user || null);
}
export const deleteUser = (userId: string) => {
    users = users.filter(u => u.id !== userId);
    return simulateDelay({ success: true });
}

// --- SETTINGS ---
export const sendOtp = (email: string) => {
    console.log(`Sending OTP to ${email}. (Simulated)`);
    return simulateDelay({ success: true, otp: "123456" }); // For demo
}
export const verifyOtp = (email: string, otp: string) => {
    return simulateDelay({ success: otp === "123456" });
}
export const updateUserProfile = (userId: string, updates: Partial<User>) => {
    return updateUser(userId, updates);
}

// --- SYLLABUS ---
export const getSyllabusData = () => simulateDelay(syllabusData);

// --- APPLICATIONS ---
export const submitApplication = (appData: {pin: string, type: ApplicationType, payload: any}): Promise<Application> => {
     const user = users.find(u => u.pin === appData.pin);
     if (!user) {
         return Promise.reject(new Error("User with that PIN not found."));
     }
     const newApp: Application = {
        id: `app_${Date.now()}`,
        user_id: user.id,
        pin: appData.pin,
        type: appData.type,
        status: ApplicationStatus.PENDING,
        payload: appData.payload,
        created_at: new Date().toISOString(),
     };
     applications.unshift(newApp);
     return simulateDelay(newApp);
};
export const getApplicationsByPin = (pin: string) => {
    return simulateDelay(applications.filter(a => a.pin === pin));
};
export const getApplicationsByUserId = (userId: string) => {
    return simulateDelay(applications.filter(a => a.user_id === userId));
};
export const getUserByPin = (pin: string) => {
    return simulateDelay(users.find(u => u.pin === pin) || null);
};

// --- SBTET RESULTS ---
export const getSbtetResults = (user: User | null): Promise<Result[]> => {
    if (!user) return simulateDelay([]);

    if (user.role === Role.PRINCIPAL) {
        return simulateDelay(resultsData);
    }
    if (user.role === Role.HOD) {
        return simulateDelay(resultsData.filter(r => r.branch === user.branch));
    }
    if (user.role === Role.FACULTY) {
        // Faculty sees results for their entire branch to analyze their subjects' performance
        return simulateDelay(resultsData.filter(r => r.branch === user.branch));
    }
    if (user.role === Role.STUDENT) {
        return simulateDelay(resultsData.filter(r => r.pin === user.pin));
    }
    return simulateDelay([]);
};
export const getSyllabus = () => simulateDelay(syllabusData);