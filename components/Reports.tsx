

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAttendanceByDateAndBranch, getUsers } from '../services/mockApiService';
import type { AttendanceRecord, User } from '../types';
import { AttendanceStatus, Role } from '../types';
import { ExportIcon, ShareIcon, SparklesIcon, XCircleIcon } from './Icons';
import { generateReportSummary } from '../services/geminiService';

// Normalizes PIN input (e.g., "23101cs001" -> "23-101-CS-001")
const normalizePin = (pin: string): string => {    
    const compact = pin.toUpperCase().replace(/-/g, '');
    const regex = /^(?<year>\d{2})(?<college>\d{3})(?<branch>EC|EE|CS|MECH|CE|IT|AI|DS)(?<roll>\d{3})$/;
    const match = compact.match(regex);
    if (!match?.groups) return pin;
    const { year, college, branch, roll } = match.groups;
    return `${year}-${college}-${branch}-${roll}`;
};

const PinInput: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const [displayValue, setDisplayValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // For students, normalize the PIN. For others, just use the input.
        const normalized = placeholder?.includes('Student') ? normalizePin(input) : input;
        setDisplayValue(input);
        onChange(normalized);
    };

    return (
        <input
            type="text"
            placeholder={placeholder || "Search..."}
            value={displayValue}
            onChange={handleChange}
            className="w-full sm:w-1/3 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
        />
    );
};

const StudentGrid: React.FC<{ users: User[], attendance: AttendanceRecord[], onSelectUser: (user: User) => void }> = ({ users, attendance, onSelectUser }) => {
    const presentPins = new Set(attendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).map(r => r.userPin));
    
    return (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2">
            {users.map(user => {
                const isPresent = presentPins.has(user.pin);
                return (
                    <div 
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={`p-2 rounded text-center text-xs font-mono cursor-pointer transition-transform hover:scale-110
                            ${isPresent ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        title={user.name}
                    >
                        {user.pin.split('-')[3] || user.pin}
                    </div>
                );
            })}
        </div>
    );
};

const FacultyList: React.FC<{ users: User[], attendance: AttendanceRecord[], onSelectUser: (user: User) => void }> = ({ users, attendance, onSelectUser }) => {
    const presentUserIds = new Set(attendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).map(r => r.userId));

    return (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map(user => {
                        const isPresent = presentUserIds.has(user.id);
                        return (
                             <tr key={user.id} onClick={() => onSelectUser(user)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrl} alt={user.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.pin}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPresent ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                        {isPresent ? 'Present' : 'Absent'}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};


const Reports: React.FC = () => {
    const [viewMode, setViewMode] = useState('CS'); // Branch code or 'FACULTY'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    useEffect(() => {
        getUsers().then(setAllUsers);
    }, []);
    
    useEffect(() => {
        getAttendanceByDateAndBranch(date, viewMode).then(setAttendance);
        // Reset AI summary when filters change
        setAiSummary(null);
        setSummaryError(null);
    }, [viewMode, date]);

    const { usersForView, filteredUsers, isFacultyView } = useMemo(() => {
        const facultyView = viewMode === 'FACULTY';
        const users = allUsers.filter(u => {
            if (facultyView) return u.role === Role.FACULTY || u.role === Role.PRINCIPAL || u.role === Role.HOD;
            return u.role === Role.STUDENT && u.branch === viewMode;
        });
        
        const filtered = !searchTerm ? users : users.filter(u => 
            u.pin.toUpperCase().includes(searchTerm.toUpperCase()) || 
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return { usersForView: users, filteredUsers: filtered, isFacultyView: facultyView };
    }, [allUsers, viewMode, searchTerm]);

    const stats = useMemo(() => {
        const present = attendance.length;
        const total = usersForView.length;
        const absent = total - present;
        return { present, absent, total };
    }, [attendance, usersForView]);

    const pieData = [
        { name: 'Present', value: stats.present },
        { name: 'Absent', value: stats.absent },
    ].filter(item => item.value > 0);

    const COLORS = ['#10B981', '#EF4444'];
    
    const handleShare = async () => {
        const shareText = `Attendance Report for ${viewMode} on ${date}:\nPresent: ${stats.present}\nAbsent: ${stats.absent}\nTotal: ${stats.total}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Attendance Report - ${viewMode}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Share functionality is not supported on your browser.');
        }
        setIsExportOpen(false);
    };

    const handleDownloadCsv = () => {
        if (attendance.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ["PIN", "Name", "Status", "Check-in Time"];
        const csvRows = [
            headers.join(','),
            ...attendance.map(row => 
                [
                    `"${row.userPin}"`,
                    `"${row.userName}"`,
                    `"${row.status}"`,
                    `"${row.checkInTime || 'N/A'}"`
                ].join(',')
            )
        ];
    
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `attendance_report_${viewMode}_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsExportOpen(false);
    };
    
    const handleDownloadPdf = () => {
        window.print();
        setIsExportOpen(false);
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setSummaryError(null);
        setAiSummary(null);
        try {
            const summary = await generateReportSummary(attendance);
            setAiSummary(summary);
        } catch (err: any) {
            setSummaryError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md printable-area">
                <div className="flex justify-between items-start mb-4 no-print">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Daily Attendance Report</h3>
                    <div className="relative">
                         <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                            <ExportIcon className="w-4 h-4" /> Export
                        </button>
                        {isExportOpen && (
                            <div onMouseLeave={() => setIsExportOpen(false)} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadCsv(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <ExportIcon className="w-4 h-4" /> Download CSV
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadPdf(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                     <ExportIcon className="w-4 h-4" /> Download PDF
                                </a>
                                 <a href="#" onClick={(e) => { e.preventDefault(); handleShare(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <ShareIcon className="w-4 h-4" /> Share
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 no-print">
                     <PinInput 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder={isFacultyView ? "Search Faculty Name/PIN" : "Search Student PIN"}
                    />
                    <div className="flex gap-4">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        >
                            <option value="CS">CS</option>
                            <option value="EC">EC</option>
                            <option value="MECH">MECH</option>
                            <option value="IT">IT</option>
                            <option value="FACULTY">Faculty</option>
                        </select>
                         <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        />
                    </div>
                </div>
                
                <div className="my-6 p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50 dark:bg-slate-900/50 no-print">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-indigo-500" />
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">AI-Powered Summary</h4>
                        </div>
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={isGeneratingSummary || attendance.length === 0}
                            className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 flex items-center gap-2 text-sm"
                        >
                            {isGeneratingSummary ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                "Generate Summary"
                            )}
                        </button>
                    </div>
                    {isGeneratingSummary && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">Mira AI is analyzing the attendance data. This may take a moment...</p>}
                    {summaryError && (
                         <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                            <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                            <div>
                                <p className="font-semibold">Error Generating Summary</p>
                                <p>{summaryError}</p>
                            </div>
                         </div>
                    )}
                    {aiSummary && (
                        <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                            {aiSummary.split('\n').filter(line => line.trim() !== '').map((line, i) => {
                                const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                                if (isListItem) {
                                    return (
                                        <div key={i} className="flex items-start">
                                            <span className="mr-2 mt-1">•</span>
                                            <span>{line.substring(line.indexOf(' ') + 1)}</span>
                                        </div>
                                    );
                                }
                                return <p key={i}>{line}</p>;
                            })}
                        </div>
                    )}
                </div>

                {isFacultyView ? (
                    <FacultyList users={filteredUsers} attendance={attendance} onSelectUser={(user) => alert(`Selected Faculty: ${user.name} (${user.pin})`)} />
                ) : (
                    <StudentGrid users={filteredUsers} attendance={attendance} onSelectUser={(user) => alert(`Selected Student: ${user.name} (${user.pin})`)} />
                )}

                 <p className="text-right mt-4 font-semibold">{stats.present}/{stats.total} Present</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 no-print">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Daily Attendance Trend (Last 7 Days)</h3>
                    {/* Bar chart data would be fetched here */}
                    <p className="text-slate-500 dark:text-slate-400">Bar chart showing daily trend will be here.</p>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Today's Status ({viewMode})</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                // FIX: The 'percent' property from recharts can be undefined, a different type, or NaN.
                                // Explicitly convert to a number and use a fallback to ensure a valid numeric value for the arithmetic operation.
                                label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;