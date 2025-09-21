
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
    { id: 'syl_it_01', branch: 'IT', subject: 'Web Technologies', file_url: '#', percent_completed: 75, uploaded_by: 'fac_04', uploaded_by_name: 'Uma Shankar', uploaded_at: '2023-10-20T14:30:00Z' },
];

let applications: Application[] = [
    { id: 'app_01', user_id: users.find(u => u.pin === '23210-EC-004')?.id || '', pin: '23210-EC-004', type: ApplicationType.LEAVE, status: ApplicationStatus.PENDING, payload: { reason: 'Family function', from_date: '2023-11-05', to_date: '2023-11-06'}, created_at: '2023-11-01T09:00:00Z' },
    { id: 'app_02', user_id: users.find(u => u.pin === '23210-EC-010')?.id || '', pin: '23210-EC-010', type: ApplicationType.BONAFIDE, status: ApplicationStatus.APPROVED, payload: { reason: 'Passport application' }, created_at: '2023-10-28T11:00:00Z', decided_at: '2023-10-29T15:00:00Z' },
];

const resultsData: Result[] = [];
const timetables: Timetable[] = [];
const feedback: Feedback[] = [];

// --- API SIMULATION ---
const simulateDelay = <T>(data: T, delay = 300): Promise<T> => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// --- AUTH ---
let authenticatedUserId = 'fac_01';
export const getAuthenticatedUser = () => simulateDelay(users.find(u => u.id === authenticatedUserId));
export const setAuthenticatedUser = (userId: string) => {
    authenticatedUserId = userId;
    return simulateDelay(users.find(u => u.id === userId));
}
export const getAllFaculty = () => simulateDelay(users.filter(u => u.role === Role.FACULTY));

// --- DASHBOARD ---
export const getDashboardStats = (date: string) => {
    const dailyRecords = attendanceRecords.filter(r => r.date === date && r.userPin.startsWith('23')); // Only students
    const totalStudents = users.filter(u => u.role === Role.STUDENT).length;
    return simulateDelay({
        present: dailyRecords.length,
        absent: totalStudents - dailyRecords.length,
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
        if (isFaculty) return user.role === Role.FACULTY || user.role === Role.PRINCIPAL;
        return user.branch === branch;
    });
    return simulateDelay(records);
}

// --- ATTENDANCE LOG ---
export const getUserByDetails = ({ year, collegeCode, branch, roll }: { year: number, collegeCode: string, branch: string, roll: string}) => {
    const pin = `${year}${collegeCode}-${branch}-${roll.padStart(3, '0')}`;
    return simulateDelay(users.find(u => u.pin === pin));
};

export const markAttendance = (userId: string, coords: {lat: number, lng: number}) => {
    const date = formatDate(new Date());
    const existing = attendanceRecords.find(r => r.userId === userId && r.date === date);
    const user = users.find(u => u.id === userId);
    if (existing || !user) return simulateDelay({ success: false });

    attendanceRecords.unshift({
        id: `att_${userId}_${date}`,
        userId, userName: user.name, userPin: user.pin, date,
        checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        checkOutTime: null, status: AttendanceStatus.PRESENT,
        coordinate: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    });
    return simulateDelay({ success: true });
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
    return simulateDelay(user);
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
