
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import AttendanceLog from './components/AttendanceLog';
import ManageUsers from './components/ManageUsers';
import Header from './components/Header';
import Settings from './components/Settings';
import Notebook from './components/Notebook'; // Import the new Notebook component
import type { Page, Syllabus, User, Application, Result, Timetable, Feedback } from './types';
import { Role, ApplicationType, ApplicationStatus } from './types';
import { getSyllabusByBranch, getAuthenticatedUser, getApplicationsByUserId, getResultsByBranch, getTimetableByBranch, submitFeedback, getAllFaculty, setAuthenticatedUser as apiSetAuthenticatedUser } from './services/mockApiService';
import { SyllabusIcon, UploadIcon, ApplicationIcon, ResultsIcon, TimetableIcon, FeedbackIcon, CheckCircleIcon, XCircleIcon, ExportIcon } from './components/Icons';


const SyllabusPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [syllabusData, setSyllabusData] = useState<Syllabus[]>([]);

    useEffect(() => {
        if(user){
            getSyllabusByBranch(user.branch).then(setSyllabusData);
        }
    }, [user]);

    const isFaculty = user?.role === Role.FACULTY || user?.role === Role.HOD || user?.role === Role.ADMIN;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><SyllabusIcon className="w-6 h-6"/> Syllabus Progress - {user?.branch}</h3>
                    {isFaculty && (
                         <button className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            <UploadIcon className="w-5 h-5" />
                            Upload Syllabus
                        </button>
                    )}
                </div>
                <div className="space-y-4">
                    {syllabusData.length > 0 ? syllabusData.map(item => (
                        <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold">{item.subject}</p>
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.percent_completed}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${item.percent_completed}%` }}></div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                               Uploaded by: {item.uploaded_by_name} on {new Date(item.uploaded_at).toLocaleDateString()}
                            </div>
                        </div>
                    )) : <p>No syllabus data available for your branch.</p>}
                </div>
            </div>
        </div>
    );
};

const ApplicationsPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'leave' | 'bonafide'>('leave');

    useEffect(() => {
        if (user) {
            getApplicationsByUserId(user.id).then(setApplications);
        }
    }, [user]);
    
    const getStatusChip = (status: ApplicationStatus) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        if (status === ApplicationStatus.APPROVED) return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        if (status === ApplicationStatus.REJECTED) return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ApplicationIcon className="w-6 h-6"/> Applications</h2>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('leave')} className={`${activeTab === 'leave' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Leave Letter
                        </button>
                        <button onClick={() => setActiveTab('bonafide')} className={`${activeTab === 'bonafide' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Bonafide Certificate
                        </button>
                    </nav>
                </div>
                {activeTab === 'leave' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Submit a Leave Request</h3>
                        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                             <input type="date" className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="Start Date" />
                             <input type="date" className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="End Date" />
                             <button type="submit" className="bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Submit</button>
                        </form>
                    </div>
                )}
                 {activeTab === 'bonafide' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Request a Bonafide Certificate</h3>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                             <input type="text" className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="Purpose (e.g., Passport, Bank Loan)" />
                             <button type="submit" className="bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Request Certificate</button>
                        </form>
                    </div>
                )}

                <h3 className="text-lg font-semibold mb-4">Your Past Applications</h3>
                <ul className="space-y-3">
                    {applications.filter(a => a.type === (activeTab === 'leave' ? ApplicationType.LEAVE : ApplicationType.BONAFIDE)).map(app => (
                        <li key={app.id} className="p-4 border rounded-lg flex justify-between items-center dark:border-slate-700">
                           <div>
                                <p className="font-semibold">{app.payload.reason || app.payload.purpose}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                           </div>
                           <span className={getStatusChip(app.status)}>{app.status}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
};

const SbtetResultsPage: React.FC = () => {
    const [results, setResults] = useState<Result[]>([]);
    const [branch, setBranch] = useState('CS');
    useEffect(() => {
        getResultsByBranch(branch).then(setResults);
    }, [branch]);

    const toppers = [...results].sort((a, b) => b.sgpa - a.sgpa).slice(0, 3);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ResultsIcon className="w-6 h-6"/> SBTET Results</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700">
                        <option value="CS">CS</option><option value="EC">EC</option><option value="MECH">MECH</option><option value="IT">IT</option>
                    </select>
                    <button className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                        <ExportIcon className="w-4 h-4" /> Export Branch Report
                    </button>
                </div>

                <h3 className="text-lg font-semibold mb-2">Branch Toppers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {toppers.map((topper, i) => (
                         <div key={topper.id} className={`p-4 rounded-lg border-2 ${i === 0 ? 'border-amber-400' : 'border-slate-300 dark:border-slate-600'}`}>
                            <p className="font-semibold">{i+1}. {topper.userName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{topper.pin}</p>
                            <p className="text-lg font-bold mt-1 text-indigo-600 dark:text-indigo-400">{topper.sgpa} SGPA</p>
                        </div>
                    ))}
                </div>

                <h3 className="text-lg font-semibold mb-2">All Results</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                         <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">PIN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">SGPA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Backlogs</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {results.map(result => (
                                <tr key={result.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono">{result.pin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{result.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">{result.sgpa.toFixed(2)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap font-semibold ${result.backlogs > 0 ? 'text-red-500' : 'text-green-500'}`}>{result.backlogs}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TimetablePage: React.FC = () => {
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [branch, setBranch] = useState('EC');
    useEffect(() => {
        getTimetableByBranch(branch).then(setTimetable);
    }, [branch]);

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><TimetableIcon className="w-6 h-6"/> Timetables</h2>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700">
                        <option value="CS">CS</option><option value="EC">EC</option><option value="MECH">MECH</option><option value="IT">IT</option>
                    </select>
                </div>
                {timetable ? (
                    <div>
                        <img src={timetable.file_url} alt={`${timetable.branch} timetable`} className="rounded-lg border dark:border-slate-700"/>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Effective from: {new Date(timetable.effective_from).toLocaleDateString()}</p>
                    </div>
                ) : <p>No timetable available for {branch}.</p>}
             </div>
        </div>
    );
};

const FeedbackPage: React.FC<{ user: User | null}> = ({ user }) => {
    const [category, setCategory] = useState<'bug' | 'feature' | 'ux'>('bug');
    const [text, setText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text || !user) return;
        submitFeedback({
            id: '', actor_id: user.id, role: user.role, category, text, created_at: new Date().toISOString()
        }).then(res => {
            if (res.success) {
                setSubmitted(true);
                setText('');
            }
        });
    }

    if (submitted) {
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">We appreciate you taking the time to help us improve Mira.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Submit Another</button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><FeedbackIcon className="w-6 h-6"/> Submit Feedback</h2>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Feedback Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700">
                            <option value="bug">Report a Bug</option>
                            <option value="feature">Suggest a Feature</option>
                            <option value="ux">User Experience Feedback</option>
                        </select>
                    </div>
                    <div className="mb-4">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Please describe your feedback</label>
                         <textarea 
                            value={text} 
                            onChange={e => setText(e.target.value)}
                            rows={6} 
                            placeholder="The more detail, the better!"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        ></textarea>
                    </div>
                    <button type="submit" disabled={!text} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400">Submit Feedback</button>
                </form>
             </div>
        </div>
    );
};


const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
    const [allFaculty, setAllFaculty] = useState<User[]>([]);

    useEffect(() => {
        getAuthenticatedUser().then(setAuthenticatedUser);
        getAllFaculty().then(setAllFaculty);
        
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const handleUserChange = (userId: string) => {
        apiSetAuthenticatedUser(userId).then(setAuthenticatedUser);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard setCurrentPage={setCurrentPage} />;
            case 'reports':
                return <Reports />;
            case 'logs':
                return <AttendanceLog />;
            case 'users':
                return <ManageUsers user={authenticatedUser} />;
            case 'syllabus':
                return <SyllabusPage user={authenticatedUser} />;
            case 'settings':
                return <Settings user={authenticatedUser} />;
            case 'applications':
                return <ApplicationsPage user={authenticatedUser} />;
            case 'sbtet':
                return <SbtetResultsPage />;
            case 'timetables':
                return <TimetablePage />;

            case 'feedback':
                return <FeedbackPage user={authenticatedUser} />;
            case 'notebook':
                return <Notebook />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    toggleTheme={toggleTheme} 
                    currentTheme={theme} 
                    currentUser={authenticatedUser}
                    facultyList={allFaculty}
                    onUserChange={handleUserChange}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
