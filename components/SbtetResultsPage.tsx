import React, { useState, useEffect, useMemo } from 'react';
import type { User, Result, Syllabus, AcademicHistory, SemesterResult } from '../types';
import { Role } from '../types';
import { getSbtetResults, getSyllabus, getAcademicHistoryByPin } from '../services/mockApiService';
import { ResultsIcon, ShareIcon, DownloadIcon, ChevronLeftIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';


// --- Admin Overview Components (Existing Functionality) ---

const MedalIcon: React.FC<{ place: number, className?: string }> = ({ place, className }) => {
    const colors: { [key: number]: string } = { 1: 'text-amber-400', 2: 'text-slate-400', 3: 'text-amber-600' };
    const color = colors[place] || 'text-slate-500';
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${className} ${color}`}>
            <path fillRule="evenodd" d="M15.8 5.8a1 1 0 00-1.6 1.2A4 4 0 0113 12a4 4 0 01-1.2-7.8 1 1 0 00-1.6-1.2A6 6 0 004 12a6 6 0 0012 0 6 6 0 00-2.2-4.2z" clipRule="evenodd" />
        </svg>
    );
};

const TopperList: React.FC<{ results: Result[], branch: string }> = ({ results, branch }) => {
    const toppers = useMemo(() => {
        return results
            .filter(r => r.branch === branch)
            .sort((a, b) => b.sgpa - a.sgpa)
            .slice(0, 3);
    }, [results, branch]);

    if (toppers.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400">No results to display for this branch.</p>;
    }

    return (
        <div className="space-y-3">
            {toppers.map((topper, index) => (
                <div key={topper.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <MedalIcon place={index + 1} className="w-8 h-8 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{topper.userName}</p>
                        <p className="text-sm font-mono text-slate-500 dark:text-slate-400">{topper.pin} | <span className="font-sans font-semibold text-indigo-500">SGPA: {topper.sgpa.toFixed(2)}</span></p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ResultsTable: React.FC<{ results: Result[], onRowClick: (pin: string) => void }> = ({ results, onRowClick }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">SGPA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Backlogs</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {results.map(res => (
                    <tr key={res.id} onClick={() => onRowClick(res.pin)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-4 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{res.userName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{res.pin}</p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">{res.sgpa.toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{res.backlogs}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- NEW: Consolidated Academic History View ---

const AcademicHistoryView: React.FC<{ data: AcademicHistory }> = ({ data }) => {
    const [openSemester, setOpenSemester] = useState<number | null>(data.semesters[data.semesters.length -1]?.semester || null);

    const handleDownloadPdf = () => {
        window.print();
    };

    const trendData = data.semesters.map(s => ({ name: `Sem ${s.semester}`, SGPA: s.sgpa }));

    return (
        <div className="bg-white dark:bg-slate-800 p-2 sm:p-4 md:p-6 rounded-lg shadow-md printable-area">
             <style>{`
                @media print {
                    body {
                        background-color: #fff !important;
                    }
                    .printable-area {
                        padding: 0 !important;
                        box-shadow: none !important;
                        color: #000 !important;
                    }
                    .dark .printable-area * {
                        color: #000 !important;
                        background-color: #fff !important;
                        border-color: #ccc !important;
                    }
                }
            `}</style>
            {/* Header */}
            <div className="text-center border-b-2 border-slate-400 dark:border-slate-500 pb-2 mb-4">
                <h3 className="text-xl sm:text-2xl font-bold">GOVERNMENT POLYTECHNIC SANGAREDDY</h3>
                <p className="font-semibold">Consolidated Statement of Marks</p>
            </div>
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <p><strong>Student Name:</strong> {data.studentName}</p>
                    <p><strong>Branch:</strong> {data.branch}</p>
                </div>
                <div className="text-right">
                    <p><strong>PIN:</strong> {data.pin}</p>
                    <p>Academic History</p>
                </div>
            </div>

            {/* Academic Summary */}
            <div className="border border-slate-300 dark:border-slate-600 rounded-lg mb-6">
                 <div className="p-2 bg-slate-100 dark:bg-slate-700 font-bold text-center">Academic Summary</div>
                 <div className="grid grid-cols-2 md:grid-cols-4">
                    <div className="p-2 border-r border-slate-300 dark:border-slate-600"><strong>Overall CGPA</strong> <span className="float-right">{data.overallCGPA.toFixed(2)}</span></div>
                    <div className="p-2 md:border-r border-slate-300 dark:border-slate-600"><strong>Total Credits</strong> <span className="float-right">{data.totalCredits}</span></div>
                    <div className="p-2 border-r border-slate-300 dark:border-slate-600"><strong>Total Backlogs</strong> <span className="float-right">{data.totalBacklogs}</span></div>
                    <div className="p-2"></div>
                </div>
            </div>

            {/* SGPA Trend Chart */}
            <div className="mb-6 no-print">
                <h4 className="font-bold text-lg mb-2">SGPA Trend</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 10]} fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Bar dataKey="SGPA" fill="#4f46e5" barSize={30}>
                             {trendData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.SGPA < 7 ? "#ef4444" : entry.SGPA < 8.5 ? "#f59e0b" : "#22c55e"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Semesters Accordion */}
            <div className="space-y-2">
                {data.semesters.map(sem => (
                    <div key={sem.semester}>
                        <button 
                            onClick={() => setOpenSemester(openSemester === sem.semester ? null : sem.semester)}
                            className="w-full text-left p-2 bg-slate-100 dark:bg-slate-700 font-bold flex justify-between items-center rounded"
                        >
                            <span>Semester {sem.semester} (SGPA: {sem.sgpa.toFixed(2)}, Status: {sem.status})</span>
                            <span className={`transform transition-transform ${openSemester === sem.semester ? 'rotate-180' : ''}`}>&#9660;</span>
                        </button>
                        {openSemester === sem.semester && (
                            <div className="overflow-x-auto p-1 animate-fade-in-up">
                                <table className="w-full text-sm border-collapse border border-slate-300 dark:border-slate-600">
                                    <thead className="bg-indigo-500 text-white">
                                        <tr>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600">Sub Code</th>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600 text-left">Subject Name</th>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600">Internal</th>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600">External</th>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600">Total</th>
                                            <th className="p-2 border border-slate-300 dark:border-slate-600">Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sem.subjects.map(sub => (
                                            <tr key={sub.subCode} className={`border-b border-slate-200 dark:border-slate-700 ${sub.total < 35 ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600 font-mono text-center">{sub.subCode}</td>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600">{sub.subjectName}</td>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600 text-center">{sub.internal}</td>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600 text-center">{sub.external}</td>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600 text-center font-bold">{sub.total}</td>
                                                <td className="p-2 border border-slate-300 dark:border-slate-600 text-center">{sub.credits}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                <p>Generated on: {new Date().toLocaleDateString('en-GB')}</p>
                 <button onClick={handleDownloadPdf} className="no-print flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    <DownloadIcon className="w-4 h-4" /> Download PDF
                </button>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const SbtetResultsPage: React.FC<{ user: User | null }> = ({ user }) => {
    // State for Admin overview
    const [overviewResults, setOverviewResults] = useState<Result[]>([]);
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [selectedBranch, setSelectedBranch] = useState(user?.role === Role.HOD ? user.branch : 'EC');
    
    // State for new Detail view
    const [view, setView] = useState<'overview' | 'detail'>('overview');
    const [academicHistory, setAcademicHistory] = useState<AcademicHistory | null>(null);
    const [searchedPin, setSearchedPin] = useState('');
    const [pinError, setPinError] = useState('');
    
    const [loading, setLoading] = useState(true);
    const branches = useMemo(() => [...new Set(overviewResults.map(r => r.branch))], [overviewResults]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            if (user.role === Role.STUDENT) {
                const history = await getAcademicHistoryByPin(user.pin);
                setAcademicHistory(history);
                setView('detail');
            } else {
                // Admins see overview first
                const [resultsData, syllabusData] = await Promise.all([
                    getSbtetResults(user),
                    getSyllabus()
                ]);
                setOverviewResults(resultsData);
                setSyllabi(syllabusData);
                setView('overview');
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handlePinSearch = async () => {
        if (!searchedPin) return;
        setLoading(true);
        setPinError('');
        const history = await getAcademicHistoryByPin(searchedPin.toUpperCase());
        if (history) {
            setAcademicHistory(history);
            setView('detail');
        } else {
            setPinError(`No academic history found for PIN: ${searchedPin}`);
        }
        setLoading(false);
    };
    
    if (loading || !user) {
        return <div className="p-6 text-center">Loading results...</div>;
    }
    
    if (view === 'detail' && academicHistory) {
         return (
             <div className="space-y-4">
                 {user.role !== Role.STUDENT && (
                     <button onClick={() => { setView('overview'); setAcademicHistory(null); setSearchedPin(''); setPinError(''); }} className="no-print font-bold py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-2">
                        <ChevronLeftIcon className="w-5 h-5"/> Back to Branch Overview
                    </button>
                 )}
                 <AcademicHistoryView data={academicHistory} />
             </div>
         );
    }

    // Admin Overview (existing functionality)
    const filteredResults = overviewResults.filter(r => r.branch === selectedBranch);
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <ResultsIcon className="w-6 h-6"/> SBTET Results Overview
                </h2>
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={searchedPin}
                        onChange={e => setSearchedPin(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handlePinSearch()}
                        placeholder="Enter PIN for detailed report..."
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                    />
                    <button onClick={handlePinSearch} className="font-semibold py-2 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Search</button>
                </div>
                 {user.role === Role.PRINCIPAL && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="branch-select" className="text-sm font-medium">Branch:</label>
                        <select
                            id="branch-select"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        >
                           {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                )}
            </div>
            {pinError && <p className="text-center text-red-500">{pinError}</p>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-2">Branch Toppers</h3>
                        <TopperList results={overviewResults} branch={selectedBranch} />
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Branch Results: {selectedBranch}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Click on a student to view their detailed academic history.</p>
                    <ResultsTable results={filteredResults} onRowClick={(pin) => { setSearchedPin(pin); handlePinSearch(); }} />
                </div>
            </div>
        </div>
    );
};

export default SbtetResultsPage;