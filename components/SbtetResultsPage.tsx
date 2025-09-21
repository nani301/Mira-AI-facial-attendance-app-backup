
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Result, Syllabus } from '../types';
import { Role } from '../types';
import { getSbtetResults, getSyllabus } from '../services/mockApiService';
import { ResultsIcon, ShareIcon, DownloadIcon } from './Icons';

const MedalIcon: React.FC<{ place: number, className?: string }> = ({ place, className }) => {
    const colors = { 1: 'text-amber-400', 2: 'text-slate-400', 3: 'text-amber-600' };
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

const ResultsTable: React.FC<{ results: Result[] }> = ({ results }) => (
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
                    <tr key={res.id}>
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

const SubjectPerformanceCard: React.FC<{ subjectCode: string, subjectName: string, allBranchResults: Result[] }> = ({ subjectCode, subjectName, allBranchResults }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const stats = useMemo(() => {
        let passedCount = 0;
        const failedStudents: string[] = [];
        const passedStudents: { name: string; pin: string, marks: number }[] = [];

        allBranchResults.forEach(studentResult => {
            const subject = studentResult.subjects.find(s => s.subjectCode === subjectCode);
            if (subject) {
                if (subject.passed) {
                    passedCount++;
                    passedStudents.push({ name: studentResult.userName, pin: studentResult.pin, marks: subject.marks });
                } else {
                    failedStudents.push(studentResult.pin);
                }
            }
        });

        const totalStudents = passedStudents.length + failedStudents.length;
        const passPercentage = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
        const top3 = passedStudents.sort((a, b) => b.marks - a.marks).slice(0, 3);
        
        return { totalStudents, passedCount, passPercentage, failedStudents, top3 };
    }, [subjectCode, allBranchResults]);

    if (stats.totalStudents === 0) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{subjectCode}: {subjectName}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stats.passedCount} / {stats.totalStudents} students passed</p>
                </div>
                 <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold"
                     style={{ background: `conic-gradient(#10b981 ${stats.passPercentage}%, #ef4444 ${stats.passPercentage}%)`}}>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                        {stats.passPercentage.toFixed(0)}%
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in-up">
                    <div>
                        <h5 className="text-sm font-semibold text-green-600 dark:text-green-400">Top 3 Performers</h5>
                        <ul className="text-xs list-decimal list-inside mt-1 text-slate-600 dark:text-slate-300">
                           {stats.top3.map(s => <li key={s.pin}>{s.name} ({s.pin}) - <span className="font-bold">{s.marks}</span> marks</li>)}
                        </ul>
                    </div>
                     <div>
                        <h5 className="text-sm font-semibold text-red-600 dark:text-red-400">Failed Student PINs ({stats.failedStudents.length})</h5>
                        {stats.failedStudents.length > 0 ? (
                           <p className="text-xs font-mono mt-1 text-slate-500 dark:text-slate-400 break-words">{stats.failedStudents.join(', ')}</p>
                        ) : (
                           <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">No students failed in this subject. Great job!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SbtetResultsPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [results, setResults] = useState<Result[]>([]);
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBranch, setSelectedBranch] = useState(user?.role === Role.HOD ? user.branch : 'EC');

    const branches = useMemo(() => [...new Set(results.map(r => r.branch))], [results]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const [resultsData, syllabusData] = await Promise.all([
                    getSbtetResults(user),
                    getSyllabus()
                ]);
                setResults(resultsData);
                setSyllabi(syllabusData);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    const handleDownload = (format: 'csv' | 'pdf') => {
        alert(`Downloading ${format} for ${selectedBranch}... (Simulated)`);
    };

    const handleShare = async () => {
        const branchResults = results.filter(r => r.branch === selectedBranch);
        const topper = branchResults.sort((a, b) => b.sgpa - a.sgpa)[0];
        const shareText = `SBTET Results for ${selectedBranch} branch:\n- Total Students: ${branchResults.length}\n- Branch Topper: ${topper ? `${topper.userName} with ${topper.sgpa.toFixed(2)} SGPA` : 'N/A'}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `SBTET Results - ${selectedBranch}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Share functionality is not supported on your browser.');
        }
    };

    if (loading || !user) {
        return <div className="p-6 text-center">Loading results...</div>;
    }
    
    const renderContent = () => {
        const filteredResults = results.filter(r => r.branch === selectedBranch);

        // Principal View
        if (user.role === Role.PRINCIPAL) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-bold mb-2">Branch Toppers</h3>
                            <TopperList results={results} branch={selectedBranch} />
                        </div>
                    </div>
                     <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">Branch Results: {selectedBranch}</h3>
                        <ResultsTable results={filteredResults} />
                    </div>
                </div>
            );
        }

        // HOD View
        if (user.role === Role.HOD) {
            const branchSyllabus = syllabi.filter(s => s.branch === user.branch);
            const branchSubjects = [...new Map(branchSyllabus.map(s => [s.subject.split(' ')[0], s.subject])).values()];
            return (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                           <h3 className="text-lg font-bold mb-2">Branch Toppers ({user.branch})</h3>
                           <TopperList results={results} branch={user.branch} />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                           <h3 className="text-lg font-bold mb-4">Subject-wise Performance</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                               {branchSubjects.map(subjectStr => {
                                   const code = subjectStr.split(' ')[0];
                                   const name = subjectStr.substring(code.length + 1);
                                   return <SubjectPerformanceCard key={code} subjectCode={code} subjectName={name} allBranchResults={results} />
                               })}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">All Results for {user.branch}</h3>
                        <ResultsTable results={results} />
                    </div>
                </div>
            );
        }

        // Faculty View
        if (user.role === Role.FACULTY) {
            const facultySubjects = syllabi.filter(s => s.uploaded_by === user.id);
            return (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Performance in Your Subjects</h3>
                    <div className="space-y-4">
                       {facultySubjects.map(syllabus => {
                            const code = syllabus.subject.split(' ')[0];
                            const name = syllabus.subject.substring(code.length + 1);
                            return <SubjectPerformanceCard key={syllabus.id} subjectCode={code} subjectName={name} allBranchResults={results} />
                       })}
                       {facultySubjects.length === 0 && <p className="text-slate-500">No subjects assigned to you in the syllabus data.</p>}
                    </div>
                </div>
            );
        }

        // Student View
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Your Result</h3>
                {results.length > 0 ? <ResultsTable results={results} /> : <p>Your result is not yet available.</p>}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <ResultsIcon className="w-6 h-6"/>
                    SBTET Results
                </h2>
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
                 {(user.role === Role.PRINCIPAL || user.role === Role.HOD) && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload('csv')} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <DownloadIcon className="w-4 h-4" /> Download CSV
                        </button>
                        <button onClick={() => handleDownload('pdf')} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <DownloadIcon className="w-4 h-4" /> Download PDF
                        </button>
                         <button onClick={handleShare} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <ShareIcon className="w-4 h-4" /> Share
                        </button>
                    </div>
                )}
            </div>
            {renderContent()}
        </div>
    );
};

export default SbtetResultsPage;