
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { User, AttendanceRecord } from '../types';
import { AttendanceStatus, Role } from '../types';
import { getUserByDetails, markAttendance, sendEmail, getAttendanceByUserId, getAcademicConstants, checkTodaysAttendance, getUserByPin } from '../services/mockApiService';
import WebcamCapture from './WebcamCapture';
import type { CaptureState } from './WebcamCapture';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, MailIcon, CalendarIcon, LocationIcon } from './Icons';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => ({ 
    year: currentYear - i, 
    code: (currentYear - i) % 100 
}));
const BRANCHES = ['CS', 'EC', 'MECH', 'IT', 'CPS', 'EE', 'Faculty', 'Principal', 'Staff'];
const COLLEGE_CODE = '210';

// --- NEW: Geo-fencing Simulation ---
const COLLEGE_CENTER_LAT = 17.603126;
const COLLEGE_CENTER_LNG = 78.085769;
const CAMPUS_RADIUS_METERS = 110;

/**
 * Generates random coordinates within a specified radius of a center point.
 * This uses a planar approximation, which is accurate for small distances.
 */
const generateRandomCoordsInRadius = (centerLat: number, centerLng: number, radiusInMeters: number): { latitude: number; longitude: number } => {
    const y0 = centerLat;
    const x0 = centerLng;
    // Convert radius from meters to degrees
    const rd = radiusInMeters / 111320.0; // meters in 1 degree latitude

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    
    // Adjust for the earth's curvature at the given latitude
    const new_x = x / Math.cos(y0 * Math.PI / 180);

    const foundLng = new_x + x0;
    const foundLat = y + y0;
    
    return { latitude: foundLat, longitude: foundLng };
};

const PinSelector: React.FC<{ onUserFound: (user: User | null) => void; disabled: boolean }> = ({ onUserFound, disabled }) => {
    const [year, setYear] = useState(YEARS[0].code);
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [roll, setRoll] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isStudentMode = !['Faculty', 'Principal', 'Staff'].includes(branch);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBranch(e.target.value);
        setRoll('');
        onUserFound(null);
    };

    const handleRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
        setRoll(value);
    };
    
    const debouncedFetchUser = useCallback(
        debounce(async (details: { isStudent: boolean; year: number; collegeCode: string; branch: string; roll: string }) => {
            setIsLoading(true);
            let user: User | null = null;
            if (details.isStudent) {
                if (details.roll.length === 3) {
                    user = await getUserByDetails({ year: details.year, collegeCode: details.collegeCode, branch: details.branch, roll: details.roll });
                }
            } else {
                if (details.roll.length > 0) {
                    // Staff PIN is like FACULTY-01, HOD-02. Pad with 0 for single digit IDs.
                    const pin = `${details.branch.toUpperCase()}-${details.roll.padStart(2, '0')}`;
                    user = await getUserByPin(pin);
                }
            }
            onUserFound(user);
            setIsLoading(false);
        }, 300),
        [onUserFound]
    );

    useEffect(() => {
        debouncedFetchUser({ isStudent: isStudentMode, year, collegeCode: COLLEGE_CODE, branch, roll });
    }, [isStudentMode, year, branch, roll, debouncedFetchUser]);

    const inputBaseClasses = "text-lg md:text-xl lg:text-2xl font-semibold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 disabled:opacity-50";
    
    return (
        <div className={`flex items-center border-2 bg-slate-100 dark:bg-slate-700 rounded-2xl p-2 transition-all ${isLoading ? 'border-indigo-500 animate-pulse' : 'border-slate-300 dark:border-slate-600'}`}>
            {isStudentMode ? (
                <>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} disabled={disabled} className={`${inputBaseClasses} appearance-none`}>
                        {YEARS.map(y => <option key={y.year} value={y.code}>{y.code}{COLLEGE_CODE}</option>)}
                    </select>
                    <span className="text-slate-400 mx-2">/</span>
                </>
            ) : (
                <span className={`${inputBaseClasses} text-slate-500 dark:text-slate-400 pl-2`}>210 /</span>
            )}
            <select value={branch} onChange={handleBranchChange} disabled={disabled} className={`${inputBaseClasses} appearance-none`}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <span className="text-slate-400 mx-2">/</span>
            <input 
                type="text" 
                placeholder={isStudentMode ? "001" : "ID"} 
                value={roll} 
                onChange={handleRollChange} 
                disabled={disabled}
                className={`${inputBaseClasses} w-20 tracking-wider`}
            />
        </div>
    );
};

// Simple debounce utility
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
}

type TimelineEvent = {
    label: string;
    pick_second: number;
    start_s: number;
    end_s: number;
};

const generateDemoTimeline = (): { timeline: TimelineEvent[] } => {
    const timeline: TimelineEvent[] = [
        // Align face for 3 seconds
        { label: 'aligning_face', pick_second: 0, start_s: 0.1, end_s: 3.0 },
        // Blink prompt for 2 seconds
        { label: 'green_outline_and_blink', pick_second: 0, start_s: 3.0, end_s: 5.0 },
        // Report generation starts at 7.5 seconds (leaving a 2.5-second gap for "processing")
        { label: 'attendance_report', pick_second: 0, start_s: 7.5, end_s: 8.0 }
    ];
    return { timeline };
};


type AttendanceLogProps = {
    onAttendanceMarked: () => void;
};

const AttendanceLog: React.FC<AttendanceLogProps> = ({ onAttendanceMarked }) => {
    const [step, setStep] = useState<'capture' | 'result'>('capture');
    const [validatedUser, setValidatedUser] = useState<User | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [lastAttendance, setLastAttendance] = useState<{ coords: { latitude: number; longitude: number }; timestamp: Date } | null>(null);
    const [pinSelectorKey, setPinSelectorKey] = useState(Date.now());
    const [cameraStatus, setCameraStatus] = useState<CaptureState>('AWAITING_CAMERA');
    const [hasCameraDevice, setHasCameraDevice] = useState<boolean | null>(null);

    // State for the mock attendance demo
    const [demoMessage, setDemoMessage] = useState('');
    const [outlineColor, setOutlineColor] = useState<'red' | 'green'>('red');
    const [showBlinkPrompt, setShowBlinkPrompt] = useState(false);
    const [demoTimeline, setDemoTimeline] = useState<TimelineEvent[] | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);


    useEffect(() => {
        const checkForCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const hasVideo = devices.some(device => device.kind === 'videoinput');
                    setHasCameraDevice(hasVideo);
                } catch (err) {
                    console.error("Could not enumerate devices:", err);
                    setHasCameraDevice(false);
                }
            } else {
                setHasCameraDevice(false);
            }
        };
        checkForCamera();
    }, []);

    const handleUserFound = (user: User | null) => {
        setValidatedUser(user);
    };
    
    const onCaptureSuccess = useCallback(async () => {
        if (!validatedUser) return;
    
        const simulatedCoords = generateRandomCoordsInRadius(COLLEGE_CENTER_LAT, COLLEGE_CENTER_LNG, CAMPUS_RADIUS_METERS);
        const result = await markAttendance(validatedUser.id, { lat: simulatedCoords.latitude, lng: simulatedCoords.longitude });
    
        if (result.success) {
            // Successfully marked for the first time today.
            setLastAttendance({
                coords: simulatedCoords,
                timestamp: new Date()
            });
            
            // Send email and update dashboard
            sendEmail({
                to: validatedUser.email,
                cc: validatedUser.parent_email,
                subject: `Attendance Confirmation for ${validatedUser.name}`
            });
            onAttendanceMarked();
        } else {
            // Failed to mark, most likely because attendance was already recorded.
            // We will fetch the existing record and show the result page.
            const existingRecord = await checkTodaysAttendance(validatedUser.id);
            if (existingRecord?.checkInTime && existingRecord?.coordinate) {
                const [lat, lng] = existingRecord.coordinate.split(', ').map(Number);
                setLastAttendance({
                    coords: { latitude: lat, longitude: lng },
                    timestamp: new Date(`${existingRecord.date}T${existingRecord.checkInTime}`)
                });
            } else {
                // This is an unexpected error.
                alert("An error occurred. The user might be already marked present but their location data is missing, or another issue occurred.");
                setIsVerifying(false);
                setIsCameraOpen(false);
                setValidatedUser(null);
                setPinSelectorKey(Date.now());
                return;
            }
        }
    
        // For both cases (newly marked or already marked), transition to the result view.
        setIsVerifying(false);
        setIsCameraOpen(false);
        setStep('result');
    
    }, [validatedUser, onAttendanceMarked]);
    
    const handleCameraStateChange = useCallback((state: CaptureState, error?: string | null) => {
        setCameraStatus(state);
        if (state === 'NO_CAMERA') {
            setIsVerifying(false);
            setDemoMessage('');
        }
    }, []);

    const handleMarkAttendanceClick = async () => {
        if (!validatedUser) return;

        // Pre-verification check: see if the user has already marked attendance today
        const existingRecord = await checkTodaysAttendance(validatedUser.id);
        if (existingRecord && existingRecord.checkInTime) {
            // If already marked, go directly to the result view instead of showing an alert.
            // This assumes that if a checkInTime exists, coordinates will also exist from the markAttendance function.
            if (existingRecord.coordinate) {
                const [lat, lng] = existingRecord.coordinate.split(', ').map(Number);
                const coords = { latitude: lat, longitude: lng };
                const timestamp = new Date(`${existingRecord.date}T${existingRecord.checkInTime}`);
                
                setLastAttendance({ coords, timestamp });
                setStep('result');
                return;
            }
        }

        const { timeline } = generateDemoTimeline();
        setDemoTimeline(timeline);
        setIsVerifying(true);
        setIsCameraOpen(true);
        setDemoMessage('Starting camera...');
        setStartTime(null);
    };

    useEffect(() => {
        // Don't run the timer if the process isn't active
        if (!isVerifying || !demoTimeline) {
            return;
        }

        // Once the camera is streaming, record the start time for the 10s sequence
        if (cameraStatus === 'STREAMING' && startTime === null) {
            setStartTime(Date.now());
            return; // Return to re-trigger effect with the new startTime
        }
        
        // Wait until the start time has been recorded
        if (startTime === null) {
            return;
        }

        const interval = setInterval(() => {
            const elapsedSeconds = (Date.now() - startTime) / 1000;

            const alignEvent = demoTimeline[0];
            const blinkEvent = demoTimeline[1];
            const reportEvent = demoTimeline[2];

            // Check events in reverse order to handle transitions correctly
            if (elapsedSeconds >= reportEvent.start_s) {
                onCaptureSuccess(); // This will clear the interval via isVerifying=false
                return;
            }

            if (elapsedSeconds >= blinkEvent.end_s) {
                // Processing phase (after blink, before report)
                setDemoMessage('Processing...');
                setOutlineColor('green');
                setShowBlinkPrompt(false);
            } else if (elapsedSeconds >= blinkEvent.start_s) {
                // Blink phase
                setDemoMessage('');
                setOutlineColor('green');
                setShowBlinkPrompt(true);
            } else if (elapsedSeconds >= alignEvent.start_s) {
                // Align phase
                setDemoMessage('Align your face...');
                setOutlineColor('red');
                setShowBlinkPrompt(false);
            }
        }, 100); // Check progress every 100ms

        return () => clearInterval(interval);

    }, [isVerifying, cameraStatus, demoTimeline, startTime, onCaptureSuccess]);

    
    const getButtonState = () => {
        if (hasCameraDevice === false) {
            return { text: "No Camera Detected", disabled: true };
        }
        if (!validatedUser) {
            return { text: "Mark Attendance", disabled: true };
        }
        if (isVerifying) {
            return { text: demoMessage || 'Processing...', disabled: true };
        }
        return { text: "Mark Attendance", disabled: false };
    };
    const buttonState = getButtonState();

    const handleRetake = () => {
        setStep('capture');
        setValidatedUser(null);
        setIsVerifying(false);
        setIsCameraOpen(false);
        setLastAttendance(null);
        setDemoMessage('');
        setDemoTimeline(null); // Reset timeline
        setStartTime(null);
        setPinSelectorKey(Date.now()); // Reset PinSelector
    };

    const renderCaptureView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold mb-4">User Identification</h3>
                    <PinSelector key={pinSelectorKey} onUserFound={handleUserFound} disabled={isVerifying}/>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Select Role &amp; type ID. Name appears on the right.</p>
                </div>
                <button 
                    onClick={handleMarkAttendanceClick}
                    disabled={buttonState.disabled}
                    className="w-full text-xl font-bold py-4 rounded-2xl transition-all duration-300 ease-in-out shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {buttonState.text}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                {validatedUser ? (
                    <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{validatedUser.name}</h2>
                ) : (
                    <p className="text-2xl text-slate-400 dark:text-slate-500 font-semibold">—</p>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex items-center justify-center relative aspect-square md:aspect-auto">
                 <div className={`absolute inset-2 rounded-full border-8 transition-all duration-500 ${outlineColor === 'green' ? 'border-green-500' : 'border-red-500'} ${isCameraOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                 <div className="w-64 h-64">
                    <WebcamCapture 
                        isCameraOpen={isCameraOpen}
                        onCameraStateChange={handleCameraStateChange}
                    />
                 </div>
                 {isVerifying && cameraStatus === 'STREAMING' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                        <div className="text-white text-center p-4">
                            {showBlinkPrompt ? (
                                <div className="bg-white/90 text-slate-800 rounded-lg p-4 shadow-2xl animate-pulse">
                                    <p className="font-bold text-xl">Blink your eyes</p>
                                    <p className="text-sm">to mark attendance</p>
                                </div>
                            ) : demoMessage ? (
                                <>
                                    <p className="font-bold text-lg">{demoMessage}</p>
                                    <div className="w-12 h-12 border-2 border-dashed rounded-full animate-spin border-white mx-auto mt-2"></div>
                                </>
                            ) : null}
                        </div>
                    </div>
                 )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold mb-2">
                    {isVerifying ? "Tips for Success" : "Instructions"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                    {isVerifying ? 
                        "Keep your face steady within the circle. Ensure you are in a well-lit area for best results." :
                        "After identifying the user, click 'Mark Attendance'. The camera will activate for facial verification."
                    }
                </p>
            </div>
        </div>
    );
    
    if (step === 'result' && validatedUser && lastAttendance) {
        return <ResultView user={validatedUser} attendanceInfo={lastAttendance} onRetake={handleRetake} />;
    }

    return renderCaptureView();
};

const formatTimestamp = (date: Date): string => {
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${time} | ${day} ${month} ${year}`;
};


const AttendanceTrendArrow: React.FC<{ percentage: number; trend: 'up' | 'down' }> = ({ percentage, trend }) => {
    const isUp = trend === 'up';
    const color = isUp ? 'text-green-500' : 'text-red-500';
    const arrowPath = isUp ? 'm12 4-8 8h16z' : 'm12 20 8-8H4z';

    return (
        <div className={`relative flex flex-col items-center -mb-2 ${color}`}>
            <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
             <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d={arrowPath} />
            </svg>
        </div>
    );
};

const OverallAttendanceBar: React.FC<{ present: number; absent: number; total: number }> = ({ present, absent, total }) => {
    const presentPercent = total > 0 ? (present / total) * 100 : 0;
    const absentPercent = total > 0 ? (absent / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-green-600 dark:text-green-400">Present: {presentPercent.toFixed(1)}% ({present} days)</span>
                <span className="text-red-600 dark:text-red-400">Absent: {absentPercent.toFixed(1)}% ({absent} days)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3.5 relative overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${presentPercent}%` }}></div>
            </div>
             <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">Based on {total} Total Working Days</p>
        </div>
    );
};


const ResultView: React.FC<{ user: User; attendanceInfo: { coords: { latitude: number; longitude: number; }; timestamp: Date; }; onRetake: () => void }> = ({ user, attendanceInfo, onRetake }) => {
    
    const [userRecords, setUserRecords] = useState<AttendanceRecord[]>([]);
    const [academicConstants, setAcademicConstants] = useState({ totalWorkingDays: 120, requiredAttendancePercentage: 75 });
    
    const isStudent = user.role === Role.STUDENT;

    useEffect(() => {
        getAttendanceByUserId(user.id).then(setUserRecords);
        if (isStudent) {
            getAcademicConstants().then(setAcademicConstants);
        }
    }, [user.id, isStudent]);
    
    const overallStats = useMemo(() => {
        const presentDays = userRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
        const absentDays = userRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
        
        const totalWorkingDays = academicConstants.totalWorkingDays;
        const percentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

        const requiredDays = totalWorkingDays * (academicConstants.requiredAttendancePercentage / 100);
        const maxAbsentDays = totalWorkingDays - requiredDays;
        const leftoverDays = Math.max(0, Math.floor(maxAbsentDays - absentDays));

        return { 
            present: presentDays, 
            absent: absentDays, 
            total: totalWorkingDays, 
            percentage, 
            leftoverDays 
        };
    }, [userRecords, academicConstants]);
    
    const stockMarketTrendData = useMemo(() => {
        let score = 75; // Starting score
        const trend = Array.from({ length: 30 }, (_, i) => {
            const isPresent = Math.random() > 0.4; // 60% chance of being present
            score += isPresent ? 1.2 : -1.8;
            score = Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
            return { day: i + 1, score: parseFloat(score.toFixed(1)) };
        });
        return trend;
    }, [user.id]);

    const femaleStaffNames = [
        'P. JANAKI DEVI', 'Dr. S.N PADMAVATHI', 'VANGALA INDIRA PRIYA DARSINI', 'B. SREE LAKSHMI',
        'NAMBURU GOWTAMI', 'T.MANJULA', 'WASEEM RUKSANA', 'AFROZE JABEEN', 'C.SATYAVATHI',
        'MANDALA LAXMI DEVI', 'G.V.BABITHA', 'NAYAKOTI SUPRIYA'
    ];
    const salutation = femaleStaffNames.includes(user.name) ? 'Madam' : 'Sir';

     return (
        <div className="space-y-6 animate-fade-in">
            {isStudent ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center lg:col-span-1">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold">Attendance Marked</h2>
                        <p className="text-slate-500 dark:text-slate-400">Successfully for <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span></p>
                        <p className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mt-2">{formatTimestamp(attendanceInfo.timestamp)}</p>
                        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                            <p className="font-semibold flex items-center justify-center gap-2"><LocationIcon className="w-4 h-4" /> Geo-fencing Success</p>
                            <p className="text-xs">Coordinates matched successfully. You are inside campus area.</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg lg:col-span-2">
                        <h3 className="font-bold mb-2">Analytics Overview</h3>
                        <div className="space-y-4">
                            <AttendanceTrendArrow percentage={overallStats.percentage} trend={'up'} />
                            <OverallAttendanceBar present={overallStats.present} absent={overallStats.absent} total={overallStats.total}/>
                            
                            <p className="text-sm font-semibold pt-2">Attendance Trend (Last 30 Days)</p>
                            <div className="h-32 -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stockMarketTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                        <XAxis dataKey="day" fontSize={10} />
                                        <YAxis domain={[0, 100]} fontSize={10} unit="%"/>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={false} name="Attendance Score"/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><MailIcon className="w-5 h-5"/>Notifications</h3>
                        <p className="text-sm">Successfully sent email to you and your parents with time and coordinates.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded">
                            {attendanceInfo.timestamp.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute:'2-digit' })}
                            <br/>
                            {attendanceInfo.coords.latitude.toFixed(6)}° N, {attendanceInfo.coords.longitude.toFixed(6)}° E
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-semibold uppercase text-slate-400">Attendance Codes</h4>
                            <ul className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                                <li><b>P</b> = No. of days Present</li>
                                <li><b>A</b> = No. of days Absent</li>
                                <li><b>LD</b> = Leftover Days to reach percentage for semester exam</li>
                                <li><b>WD</b> = Total Working Days</li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg lg:col-span-2">
                        <MonthlyAttendanceGrid isStudent={isStudent} allRecords={userRecords} analytics={{ P: overallStats.present, A: overallStats.absent, LD: overallStats.leftoverDays, WD: overallStats.total }} />
                    </div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold">Attendance Marked</h2>
                            <p className="text-slate-500 dark:text-slate-400">Successfully for <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span></p>
                            <p className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mt-2">{formatTimestamp(attendanceInfo.timestamp)}</p>
                            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                                <p className="font-semibold flex items-center justify-center gap-2"><LocationIcon className="w-4 h-4" /> Geo-fencing Success</p>
                                <p className="text-xs">Coordinates matched successfully. You are inside campus area.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                            <h3 className="font-bold mb-2 flex items-center gap-2"><MailIcon className="w-5 h-5"/>Notifications</h3>
                            <p className="text-sm">Successfully sent an attendance confirmation to your registered email, {salutation}.</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded">
                                {attendanceInfo.timestamp.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute:'2-digit' })}
                                <br/>
                                {attendanceInfo.coords.latitude.toFixed(6)}° N, {attendanceInfo.coords.longitude.toFixed(6)}° E
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                        <MonthlyAttendanceGrid isStudent={isStudent} allRecords={userRecords} analytics={{ P: 0, A: 0, LD: 0, WD: 0 }} />
                    </div>
                </div>
            )}
           
            <button onClick={onRetake} className="w-full font-bold py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Mark for Another User</button>
        </div>
     );
};


const MonthlyAttendanceGrid: React.FC<{isStudent: boolean, allRecords: AttendanceRecord[], analytics: {P: number, A: number, LD: number, WD: number} }> = ({ isStudent, allRecords, analytics }) => {
    const [date, setDate] = useState(new Date());

    const recordMap = useMemo(() => {
        const map = new Map<string, AttendanceStatus>();
        allRecords.forEach(r => map.set(r.date, r.status));
        return map;
    }, [allRecords]);

    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const changeMonth = (offset: number) => {
        setDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold flex items-center gap-2"><CalendarIcon className="w-5 h-5"/>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div>
                    <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>
            {isStudent && (
                 <div className="flex justify-around text-xs font-semibold text-center mb-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <span><span className="font-bold text-green-500">P:</span> {analytics.P}</span>
                    <span><span className="font-bold text-red-500">A:</span> {analytics.A}</span>
                    <span><span className="font-bold text-blue-500">LD:</span> {analytics.LD}</span>
                    <span><span className="font-bold text-slate-500">WD:</span> {analytics.WD}</span>
                </div>
            )}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold text-slate-500">{day}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const currentDate = new Date(year, month, day + 1);
                    const dateString = formatDate(currentDate);
                    const status = recordMap.get(dateString);
                    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

                    let cellClass = 'bg-slate-100 dark:bg-slate-700';
                    if (isWeekend) {
                        cellClass = 'bg-slate-200 dark:bg-slate-600/50 text-slate-400';
                    } else {
                         switch (status) {
                            case AttendanceStatus.PRESENT:
                            case AttendanceStatus.LATE:
                                cellClass = 'ring-2 ring-green-500 text-slate-800 dark:text-slate-100';
                                break;
                            case AttendanceStatus.ABSENT:
                                // No special styling for absent days to make them look "empty" as per user request.
                                // It will use the default cell class defined above.
                                break;
                        }
                    }

                    return (
                        <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${cellClass}`}>
                            {day + 1}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttendanceLog;
