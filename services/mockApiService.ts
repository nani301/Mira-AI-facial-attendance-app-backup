
import type { User, AttendanceRecord, Syllabus, Application, Result, Timetable, Feedback } from '../types';
import { Role, AttendanceStatus, ApplicationType, ApplicationStatus } from '../types';

// --- STATIC DATA AS PER REQUIREMENTS ---
const principalData = [
    { id: 'princ_01', name: 'Dr. S. Radhika', branch: 'ADMIN' },
];

const facultyData = [
    { id: 'fac_01', name: 'Vidya Sagar', branch: 'CS' },
    { id: 'fac_02', name: 'T. Manjula', branch: 'EC' },
    { id: 'fac_03', name: 'B. Gopala Rao', branch: 'MECH' },
    { id: 'fac_04', name: 'Uma Shankar', branch: 'IT' },
];

const staffData = [
    { id: 'staff_01', name: 'K. Ramesh', branch: 'Office' },
    { id: 'staff_02', name: 'L. Sunitha', branch: 'Library' },
];

const studentData = [
    { pin: '23210-EC-053', name: 'Esukapalli Nani' }, // Added as requested
    { pin: '23210-EC-004', name: 'BATTA VENU' }, { pin: '23210-EC-012', name: 'BANOTHU NARENDER' },
    { pin: '23210-EC-032', name: 'SHIVOLLA BHANUPRASAD' }, { pin: '23210-EC-034', name: 'ANGADI ANVESH' },
    { pin: '23210-EC-038', name: 'POCHARAM NAGESHWAR' }, { pin: '23210-EC-021', name: 'BEMIDGE PANDU' },
    { pin: '23210-EC-054', name: 'KAMMARI RANJITH KUMAR CHARY' }, { pin: '23210-EC-022', name: 'DOSAVARI ROHITH' },
    { pin: '23210-EC-004', name: 'NAKKA SUSWITH' }, { pin: '23210-EC-026', name: 'LAVURI SANDEEP' },
    { pin: '23210-EC-027', name: 'PALABINDLA MAHESH' }, { pin: '23210-EC-033', name: 'ALLARI SHIVA RAJ' },
    { pin: '23210-EC-058', name: 'GOLLA PANDU' }, { pin: '23210-EC-015', name: 'ABHIJITH SINGADE' },
    { pin: '23210-EC-002', name: 'BAKAM CHANDU' }, { pin: '23210-EC-043', name: 'GADDAMIDI NANDA KISHORE' },
    { pin: '23210-EC-029', name: 'DASARI OM PRAKASH' }, { pin: '23210-EC-032', name: 'TELANG PRUTHVI GOUD' },
    { pin: '23210-EC-005', name: 'KAMMARI UDAY TEJA' }, { pin: '23210-EC-061', name: 'GUNDA SRISHILAM' },
    { pin: '23210-EC-062', name: 'CHAKALI KRISHNA PRASAD' }, { pin: '23210-EC-007', name: 'JANGAM PRIYANKA' },
    { pin: '23210-EC-051', name: 'NARSAGONI ANUSHA' }, { pin: '23210-EC-050', name: 'BAGGU HEMANI' },
    { pin: '23210-EC-010', name: 'KOTHLAPURAM VAISHNAVI' }, { pin: '23210-EC-011', name: 'KUMMARI VARALAXMI' },
    { pin: '23210-EC-017', name: 'CHERUKUPALLY KAVYA' }, { pin: '23210-EC-001', name: 'KUMMARI VAISHNAVI' },
    { pin: '23210-EC-025', name: 'RAMAVATH RANI' }, { pin: '23210-EC-044', name: 'RAGULA BHAVANI' },
    { pin: '23210-EC-046', name: 'JETTY SATHWIKA' }, { pin: '23210-EC-009', name: 'ARROLLA KAVYA' },
    { pin: '23210-EC-052', name: 'CHANDILA POOJA' }, { pin: '23210-EC-038', name: 'GUBBALA BHANUPRAKASH' },
    { pin: '23210-EC-039', name: 'PULI SAI RAJ' }, { pin: '23210-EC-045', name: 'BEGARI SAMPATH' },
    { pin: '23210-EC-055', name: 'DEVUNI ANIL KUMAR' },
    { pin: '23210-EC-056', name: 'KUMMARI ARAVIND' }, { pin: '23210-EC-008', name: 'SUBEDAR ANISH' },
    { pin: '23210-EC-020', name: 'V RADHAKRISHNA' }, { pin: '23210-EC-035', name: 'BANDI RUTHIK' },
    { pin: '23210-EC-037', name: 'DUBBAKA ADITHYA' }, { pin: '23210-EC-041', name: 'RATHOD SANGRAM' },
    { pin: '23210-EC-047', name: 'E NAGESH GOUD' }, { pin: '23210-EC-028', name: 'PUTTI VISHNU VARDHAN' },
    { pin: '23210-EC-003', name: 'TEKMAL MANIPRASAD' }, { pin: '23210-EC-006', name: 'BONGULURU VISHNU' },
    { pin: '23210-EC-042', name: 'M A NADEEM' }, { pin: '23210-EC-013', name: 'MUTHYALA VARUN KUMAR' },
    { pin: '23210-EC-012', name: 'KURWA SHIVA' }, { pin: '23210-EC-019', name: 'MOHAMMAD AMER' },
    { pin: '23210-EC-030', name: 'AKKIREDDYGARI' }, { pin: '23210-EC-036', name: 'PEDDA PATLOLLA RISHIDER' },
];

let users: User[] = [
    ...principalData.map(p => ({
        ...p,
        role: Role.PRINCIPAL,
        pin: `PRINCIPAL-01`,
        year: 0,
        college_code: '210',
        email: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mira.edu`,
        email_verified: true,
        parent_email_verified: false,
        imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=b6e3f4`,
    })),
    ...facultyData.map(f => ({
        ...f,
        role: Role.FACULTY,
        pin: `FAC-${f.id.split('_')[1]}`,
        year: 0,
        college_code: '210',
        email: `${f.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mira.edu`,
        email_verified: true,
        parent_email_verified: false,
        imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(f.name)}&backgroundColor=c0aede`,
    })),
     ...staffData.map((s, i) => ({
        ...s,
        id: `staff_${(i+1).toString().padStart(2, '0')}`,
        role: Role.STAFF,
        pin: `STAFF-0${i+1}`,
        year: 0,
        college_code: '210',
        email: `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mira.edu`,
        email_verified: true,
        parent_email_verified: false,
        imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=ffd5a1`,
    })),
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
    for (let i = 0; i < 30; i++) { // Generate for a month
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        if (Math.random() > 0.25) { // 75% chance present
            const late = Math.random() > 0.8;
            attendanceRecords.push({
                id: `att_${user.id}_${formatDate(date)}`,
                userId: user.id, userName: user.name, userPin: user.pin, date: formatDate(date),
                checkInTime: late ? `09:${Math.floor(Math.random()*30)+15}` : `08:${Math.floor(Math.random()*25)+30}`,
                checkOutTime: `17:${Math.floor(Math.random()*30)}`,
                status: late ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
            });
        }
    }
});
// Add mock attendance for faculty on the current date
users.filter(u => u.role === Role.FACULTY).forEach(faculty => {
    if (Math.random() > 0.1) { // 90% chance present
        attendanceRecords.unshift({
            id: `att_${faculty.id}_${formatDate(today)}`,
            userId: faculty.id, userName: faculty.name, userPin: faculty.pin, date: formatDate(today),
            checkInTime: `08:${Math.floor(Math.random()*25)+30}`, checkOutTime: null, status: AttendanceStatus.PRESENT,
        });
    }
});


const syllabusData: Syllabus[] = [
    { id: 'syl_cs_01', branch: 'CS', subject: 'Data Structures', file_url: '#', percent_completed: 90, uploaded_by: 'fac_01', uploaded_by_name: 'Vidya Sagar', uploaded_at: '2023-10-21T10:00:00Z' },
    { id: 'syl_it_01', branch: 'IT', subject: 'Web Technologies', file_url: '#', percent_completed: 75, uploaded_by: 'fac_04', uploaded_by_name: 'Uma Shankar', uploaded_at: '2023-10-20T14:00:00Z' },
    { id: 'syl_ec_01', branch: 'EC', subject: 'Analog Circuits', file_url: '#', percent_completed: 80, uploaded_by: 'fac_02', uploaded_by_name: 'T. Manjula', uploaded_at: '2023-10-22T11:00:00Z' },
    { id: 'syl_ec_02', branch: 'EC', subject: 'Microprocessors', file_url: '#', percent_completed: 65, uploaded_by: 'fac_02', uploaded_by_name: 'T. Manjula', uploaded_at: '2023-10-23T12:00:00Z' },
];

let applications: Application[] = [
    { id: 'app_01', user_id: users.find(u => u.pin === '23210-EC-053')!.id, pin: '23210-EC-053', type: ApplicationType.LEAVE, status: ApplicationStatus.APPROVED, payload: { reason: 'Family function' }, created_at: '2023-10-08T09:00:00Z' },
    { id: 'app_02', user_id: users.find(u => u.pin === '23210-EC-053')!.id, pin: '23210-EC-053', type: ApplicationType.BONAFIDE, status: ApplicationStatus.REJECTED, payload: { reason: 'Bus Pass Application' }, created_at: '2023-10-15T11:00:00Z' },
];

const results: Result[] = [];
users.filter(u => u.role === Role.STUDENT).forEach(u => {
    results.push({
        id: `res_${u.id}`, pin: u.pin, userName: u.name, branch: u.branch, semester: 3,
        sgpa: parseFloat((Math.random() * (9.8 - 7.5) + 7.5).toFixed(2)),
        backlogs: Math.random() > 0.9 ? 1 : 0
    });
});

const timetables: Timetable[] = [
    { id: 'tt_ec', branch: 'EC', file_url: 'https://i.imgur.com/example-timetable.png', effective_from: '2023-10-01T00:00:00Z', uploaded_by: 'fac_02' },
];

const feedbacks: Feedback[] = [];

// --- API FUNCTIONS ---

// This variable will hold the ID of the currently "logged in" faculty member.
let currentAuthenticatedUserId = 'princ_01'; // Default to Principal to test admin features

const simulateDelay = <T,>(data: T, ms=300): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms));
};

export const getAllFaculty = (): Promise<User[]> => {
    // Now includes Principal
    return simulateDelay(users.filter(u => u.role === Role.FACULTY || u.role === Role.PRINCIPAL));
};

export const setAuthenticatedUser = (userId: string): Promise<User> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }
    currentAuthenticatedUserId = userId;
    return simulateDelay(user);
};

export const getAuthenticatedUser = (): Promise<User> => {
    const user = users.find(u => u.id === currentAuthenticatedUserId);
    if (!user) {
        // Fallback
        return simulateDelay(users.find(u => u.role === Role.PRINCIPAL)!);
    }
    return simulateDelay(user);
};

export const getUsers = (): Promise<User[]> => {
    return simulateDelay(users);
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = { ...user, id: `usr_${Date.now()}` };
    users = [newUser, ...users];
    return simulateDelay(newUser);
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    let updatedUser: User | null = null;
    users = users.map(u => {
        if (u.id === userId) {
            updatedUser = { ...u, ...updates };
            return updatedUser;
        }
        return u;
    });
    if (updatedUser) {
        return simulateDelay(updatedUser);
    }
    throw new Error('User not found');
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    return simulateDelay({ success: users.length < initialLength });
};


export const getUsersByBranch = (branch: string): Promise<User[]> => {
    return simulateDelay(users.filter(u => u.branch === branch && u.role === Role.STUDENT));
};

export const getAttendanceRecords = (): Promise<AttendanceRecord[]> => {
    return simulateDelay(attendanceRecords);
};

export const getAttendanceByDateAndBranch = (date: string, branch: string): Promise<AttendanceRecord[]> => {
    // Special case for faculty view
    if (branch === 'FACULTY') {
        const facultyUserIds = new Set(users.filter(u => u.role === Role.FACULTY || u.role === Role.PRINCIPAL).map(u => u.id));
        return simulateDelay(attendanceRecords.filter(r => r.date === date && facultyUserIds.has(r.userId)));
    }
    return simulateDelay(attendanceRecords.filter(r => r.date === date && users.find(u => u.id === r.userId)?.branch === branch));
};

export const getSyllabusByBranch = (branch: string): Promise<Syllabus[]> => {
    return simulateDelay(syllabusData.filter(s => s.branch === branch));
};

export const getDashboardStats = (todayDate: string): Promise<{ present: number; absent: number; total: number }> => {
    const todayRecords = attendanceRecords.filter(r => r.date === todayDate);
    const present = todayRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
    const totalStudents = users.filter(u => u.role === Role.STUDENT).length;
    return simulateDelay({ present, absent: totalStudents - present, total: totalStudents });
};

export const getApplicationsByUserId = (userId: string): Promise<Application[]> => {
    return simulateDelay(applications.filter(a => a.user_id === userId));
}
export const getResultsByBranch = (branch: string): Promise<Result[]> => {
    return simulateDelay(results.filter(r => r.branch === branch));
}
export const getTimetableByBranch = (branch: string): Promise<Timetable | null> => {
    return simulateDelay(timetables.find(t => t.branch === branch) || null);
}
export const submitFeedback = async (feedback: Feedback): Promise<{success: boolean}> => {
    feedbacks.push({ ...feedback, id: `fb_${Date.now()}` });
    return simulateDelay({ success: true });
}

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
    return updateUser(userId, updates);
};

export const sendOtp = async (email: string): Promise<{ success: boolean }> => {
    console.log(`Sending OTP to ${email}... (mock)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
};

export const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean }> => {
    console.log(`Verifying OTP ${otp} for ${email}... (mock)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const isValid = /^\d{6}$/.test(otp);
    return { success: isValid };
};

// --- NEW FUNCTIONS FOR REDESIGNED ATTENDANCE FLOW ---

export const getUserByDetails = (details: { year: number; collegeCode: string; branch: string; roll: string }): Promise<User | null> => {
    const { year, collegeCode, branch, roll } = details;
    if (!year || !collegeCode || !branch || !roll) return simulateDelay(null);

    const user = users.find(u =>
        u.role === Role.STUDENT &&
        u.year === year &&
        u.college_code === collegeCode &&
        u.branch.toUpperCase() === branch.toUpperCase() &&
        u.pin.endsWith(`-${roll}`)
    );

    return simulateDelay(user || null, 250);
};

export const getUserByPin = (pin: string): Promise<User | null> => {
    // Now also handles non-student PINs
    const user = users.find(u => u.pin.toUpperCase() === pin.toUpperCase());
    return simulateDelay(user || null);
};

export const getAttendanceByUserId = (userId: string): Promise<AttendanceRecord[]> => {
    return simulateDelay(attendanceRecords.filter(r => r.userId === userId));
};

export const markAttendance = (userId: string, coords?: { lat: number, lng: number }): Promise<AttendanceRecord> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found for attendance marking");
    }
    const today = new Date();
    const dateStr = formatDate(today);

    // Prevent re-marking attendance
    const existingRecord = attendanceRecords.find(r => r.userId === userId && r.date === dateStr);
    if (existingRecord) {
        console.log("Attendance already marked for today.");
        return simulateDelay(existingRecord);
    }
    
    const newRecord: AttendanceRecord = {
        id: `att_${userId}_${dateStr}`,
        userId: userId,
        userName: user.name,
        userPin: user.pin,
        date: dateStr,
        checkInTime: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        checkOutTime: null,
        status: AttendanceStatus.PRESENT,
        coordinate: coords ? `${coords.lat.toFixed(6)}°N ${coords.lng.toFixed(6)}°E` : "geoperms_denied",
        emailSent: false, // Will be set to true by the email service
    };
    attendanceRecords.unshift(newRecord);
    return simulateDelay(newRecord);
};

export const sendEmail = (payload: {to: string, cc?: string, subject: string}): Promise<{ queued: boolean }> => {
    console.log("Mock Email Sent:", payload);
    return simulateDelay({ queued: true });
};


// --- NEW FUNCTIONS FOR APPLICATIONS ---
export const submitApplication = async (appData: Omit<Application, 'id' | 'created_at' | 'status' | 'user_id'>): Promise<Application> => {
    const user = await getUserByPin(appData.pin);
    if (!user) throw new Error("User not found for this PIN");

    const newApp: Application = {
        ...appData,
        id: `app_${Date.now()}`,
        user_id: user.id,
        created_at: new Date().toISOString(),
        status: ApplicationStatus.PENDING,
    };
    applications.unshift(newApp);
    return simulateDelay(newApp, 500);
};

export const getApplicationsByPin = (pin: string): Promise<Application[]> => {
    return simulateDelay(applications.filter(a => a.pin.toUpperCase() === pin.toUpperCase()));
};