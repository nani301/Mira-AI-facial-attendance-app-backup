

import React, { useState, useEffect } from 'react';
import type { Application, User } from '../types';
import { Role, ApplicationType, ApplicationStatus } from '../types';
import { submitApplication, getApplicationsByPin, getApplicationsByUserId, getUserByPin } from '../services/mockApiService';
import { ApplicationIcon, UploadIcon, DownloadIcon, ShareIcon } from './Icons';

// --- Shared Components & Utilities ---
const inputClasses = "mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
const buttonClasses = "font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600";

const getStatusChip = (status: ApplicationStatus) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    if (status === ApplicationStatus.APPROVED) return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    if (status === ApplicationStatus.REJECTED) return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
};

// --- Admin View Components ---

const AdminLeaveForm: React.FC<{ onApplicationSubmitted: (app: Application) => void }> = ({ onApplicationSubmitted }) => {
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [imageName, setImageName] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPin = e.target.value.toUpperCase();
        setPin(newPin);
        if (newPin.length > 5) {
            const user = await getUserByPin(newPin);
            setFoundUser(user);
        } else {
            setFoundUser(null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newApp = await submitApplication({
                pin,
                type: ApplicationType.LEAVE,
                payload: {
                    reason,
                    from_date: fromDate,
                    to_date: toDate,
                    image_url: imageName ? `/uploads/mock/${imageName}` : undefined,
                },
            });
            onApplicationSubmitted(newApp);
            setPin(''); setReason(''); setFoundUser(null); setFromDate(''); setToDate(''); setImageName('');
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = pin && reason && fromDate && toDate && foundUser;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Student/Faculty PIN</label>
                <input type="text" placeholder="Enter PIN to identify user" value={pin} onChange={handlePinChange} className={inputClasses} />
                {pin && <p className={`text-xs mt-1 ${foundUser ? 'text-green-600' : 'text-red-600'}`}>{foundUser ? `User Found: ${foundUser.name}` : 'No user found for this PIN.'}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">From Date</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">To Date</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputClasses} required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Reason for Leave</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="e.g., Family function, Medical reason" className={inputClasses} required></textarea>
            </div>
             <div>
                 <label className="block text-sm font-medium">Upload Supporting Document (Optional)</label>
                 <div className="mt-1 flex items-center gap-2">
                    <label className={`${buttonClasses} cursor-pointer inline-flex items-center gap-2 !py-2 !px-3 !font-semibold !text-sm`}>
                        <UploadIcon className="w-5 h-5"/>
                        <span>Choose File</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {imageName && <span className="text-sm text-slate-500">{imageName}</span>}
                </div>
             </div>
            <button type="submit" disabled={!isFormValid || isSubmitting} className={`${buttonClasses} w-full`}>
                {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
        </form>
    );
};

const AdminCertificateForm: React.FC<{ onApplicationSubmitted: (app: Application) => void }> = ({ onApplicationSubmitted }) => {
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('');
    const [appType, setAppType] = useState<ApplicationType.BONAFIDE | ApplicationType.TC>(ApplicationType.BONAFIDE);
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPin = e.target.value.toUpperCase();
        setPin(newPin);
        if (newPin.length > 5) {
            const user = await getUserByPin(newPin);
            setFoundUser(user);
        } else {
            setFoundUser(null);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newApp = await submitApplication({
                pin,
                type: appType,
                payload: { reason },
            });
            onApplicationSubmitted(newApp);
            setPin(''); setReason(''); setFoundUser(null);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = pin && reason && foundUser;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Certificate Type</label>
                <select value={appType} onChange={e => setAppType(e.target.value as any)} className={inputClasses}>
                    <option value={ApplicationType.BONAFIDE}>Bonafide Certificate</option>
                    <option value={ApplicationType.TC}>Transfer Certificate (TC)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Student/Faculty PIN</label>
                <input type="text" placeholder="Enter PIN to identify user" value={pin} onChange={handlePinChange} className={inputClasses} required />
                {pin && <p className={`text-xs mt-1 ${foundUser ? 'text-green-600' : 'text-red-600'}`}>{foundUser ? `User Found: ${foundUser.name}` : 'No user found for this PIN.'}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium">Purpose / Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="e.g., Passport application, Higher studies" className={inputClasses} required></textarea>
            </div>
            <button type="submit" disabled={!isFormValid || isSubmitting} className={`${buttonClasses} w-full`}>
                {isSubmitting ? 'Submitting...' : `Request ${appType}`}
            </button>
        </form>
    );
};


const StatusChecker: React.FC = () => {
    const [pin, setPin] = useState('');
    const [results, setResults] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckStatus = async () => {
        if (!pin) return;
        setIsLoading(true);
        const apps = await getApplicationsByPin(pin);
        setResults(apps);
        setIsLoading(false);
    };
    
    const handleShare = async (app: Application) => {
        const shareText = `Application Status for ${pin}:\nType: ${app.type}\nReason: ${app.payload.reason || app.payload.purpose}\nStatus: ${app.status}`;
        if(navigator.share) {
            try {
                await navigator.share({
                    title: `Application Status: ${app.type}`,
                    text: shareText,
                });
            } catch (error) {
                console.error("Error sharing application", error);
            }
        } else {
            alert("Share feature not available on this browser.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input type="text" value={pin} onChange={e => setPin(e.target.value.toUpperCase())} placeholder="Enter PIN to check status" className={`${inputClasses} mt-0 flex-grow`}/>
                <button onClick={handleCheckStatus} disabled={!pin || isLoading} className={`${buttonClasses}`}>
                    {isLoading ? 'Checking...' : 'Check Status'}
                </button>
            </div>
            {results.length > 0 && (
                 <div className="mt-6">
                    <h4 className="font-semibold">Results for {pin}:</h4>
                    <ul className="space-y-3 mt-2">
                    {results.map(app => (
                        <li key={app.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                           <div className="flex-grow">
                                <p className="font-semibold">{app.type} - {app.payload.reason || app.payload.purpose}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                           </div>
                           <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                <span className={getStatusChip(app.status)}>{app.status}</span>
                                {app.status === ApplicationStatus.APPROVED && (app.type === ApplicationType.BONAFIDE || app.type === ApplicationType.TC) && (
                                    <>
                                        <button onClick={() => alert(`Downloading ${app.type} PDF...`)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <DownloadIcon className="w-4 h-4" /> Download
                                        </button>
                                         <button onClick={() => handleShare(app)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <ShareIcon className="w-4 h-4" /> Share
                                        </button>
                                    </>
                                )}
                           </div>
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
    );
};

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'leave' | 'certificate' | 'status'>('leave');

    const handleApplicationSubmitted = (app: Application) => {
        alert(`Application for ${app.type} submitted successfully for PIN: ${app.pin}!`);
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ApplicationIcon className="w-6 h-6"/> Application Management
            </h2>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('leave')} className={`${activeTab === 'leave' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Leave Requests
                        </button>
                        <button onClick={() => setActiveTab('certificate')} className={`${activeTab === 'certificate' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Certificate Requests
                        </button>
                         <button onClick={() => setActiveTab('status')} className={`${activeTab === 'status' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Check Application Status
                        </button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'leave' && <AdminLeaveForm onApplicationSubmitted={handleApplicationSubmitted} />}
                    {activeTab === 'certificate' && <AdminCertificateForm onApplicationSubmitted={handleApplicationSubmitted} />}
                    {activeTab === 'status' && <StatusChecker />}
                </div>
            </div>
        </div>
    );
};

// --- Student View Components ---

const StudentView: React.FC<{ user: User }> = ({ user }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'leave' | 'bonafide' | 'tc'>('leave');
    
    const fetchApplications = () => {
         getApplicationsByUserId(user.id).then(setApplications);
    }
    
    useEffect(() => {
        fetchApplications();
    }, [user]);
    
    const handleApplicationSubmitted = (app: Application) => {
        alert(`${app.type} application submitted! Your request is now pending.`);
        fetchApplications(); // Refresh list
    };

    const handleShare = async (app: Application) => {
        const shareText = `My Application Status:\nType: ${app.type}\nReason: ${app.payload.reason || app.payload.purpose}\nStatus: ${app.status}`;
        if(navigator.share) {
            try {
                await navigator.share({
                    title: `Application Status: ${app.type}`,
                    text: shareText,
                });
            } catch (error) {
                console.error("Error sharing application", error);
            }
        } else {
            alert("Share feature not available on this browser.");
        }
    };
    
    const StudentLeaveForm: React.FC = () => {
        const [reason, setReason] = useState('');
        const [fromDate, setFromDate] = useState('');
        const [toDate, setToDate] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                const newApp = await submitApplication({
                    pin: user.pin,
                    type: ApplicationType.LEAVE,
                    payload: { reason, from_date: fromDate, to_date: toDate }
                });
                handleApplicationSubmitted(newApp);
                setReason(''); setFromDate(''); setToDate('');
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">From Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">To Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Reason for Leave</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="e.g., Family function" className={inputClasses} required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting || !reason || !fromDate || !toDate} className={`${buttonClasses} w-full`}>
                    {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
            </form>
        );
    };

    const StudentBonafideForm: React.FC = () => {
        const [purpose, setPurpose] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                const newApp = await submitApplication({
                    pin: user.pin,
                    type: ApplicationType.BONAFIDE,
                    payload: { reason: purpose }
                });
                handleApplicationSubmitted(newApp);
                setPurpose('');
            } finally {
                setIsSubmitting(false);
            }
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Purpose for Certificate</label>
                    <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className={inputClasses} placeholder="e.g., Passport, Bank Loan" required/>
                </div>
                <button type="submit" disabled={isSubmitting || !purpose} className={`${buttonClasses} w-full`}>
                    {isSubmitting ? 'Submitting...' : 'Request Bonafide'}
                </button>
            </form>
        );
    };

    const StudentTCForm: React.FC = () => {
        const [reason, setReason] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                const newApp = await submitApplication({
                    pin: user.pin,
                    type: ApplicationType.TC,
                    payload: { reason }
                });
                handleApplicationSubmitted(newApp);
                setReason('');
            } finally {
                setIsSubmitting(false);
            }
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Reason for Leaving</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className={inputClasses} placeholder="e.g., Joining another college" required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting || !reason} className={`${buttonClasses} w-full`}>
                    {isSubmitting ? 'Submitting...' : 'Request Transfer Certificate'}
                </button>
            </form>
        );
    };
    
    const filterType = activeTab === 'leave' ? ApplicationType.LEAVE : activeTab === 'bonafide' ? ApplicationType.BONAFIDE : ApplicationType.TC;
    const filteredApps = applications.filter(a => a.type === filterType);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ApplicationIcon className="w-6 h-6"/> My Applications</h2>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('leave')} className={`${activeTab === 'leave' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Leave Letter
                        </button>
                        <button onClick={() => setActiveTab('bonafide')} className={`${activeTab === 'bonafide' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Bonafide Certificate
                        </button>
                        <button onClick={() => setActiveTab('tc')} className={`${activeTab === 'tc' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Transfer Certificate
                        </button>
                    </nav>
                </div>
                
                <div className="mb-8">
                     <h3 className="text-lg font-semibold mb-2">
                        {activeTab === 'leave' ? 'Submit a Leave Request' : activeTab === 'bonafide' ? 'Request a Bonafide Certificate' : 'Request a Transfer Certificate'}
                    </h3>
                    {activeTab === 'leave' && <StudentLeaveForm />}
                    {activeTab === 'bonafide' && <StudentBonafideForm />}
                    {activeTab === 'tc' && <StudentTCForm />}
                </div>

                <h3 className="text-lg font-semibold mb-4">Your Past Applications</h3>
                <ul className="space-y-3">
                    {filteredApps.map(app => (
                         <li key={app.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                           <div className="flex-grow">
                                <p className="font-semibold">{app.payload.reason || app.payload.purpose}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                           </div>
                           <div className="flex items-center gap-4 mt-2 sm:mt-0">
                               <span className={getStatusChip(app.status)}>{app.status}</span>
                                {app.status === ApplicationStatus.APPROVED && (app.type === ApplicationType.BONAFIDE || app.type === ApplicationType.TC) && (
                                    <>
                                        <button onClick={() => alert(`Downloading ${app.type} PDF...`)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <DownloadIcon className="w-4 h-4" /> Download
                                        </button>
                                        <button onClick={() => handleShare(app)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <ShareIcon className="w-4 h-4" /> Share
                                        </button>
                                    </>
                                )}
                           </div>
                        </li>
                    ))}
                     {filteredApps.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No past {activeTab} applications found.</p>
                     )}
                </ul>
            </div>
        </div>
    );
};


// --- Main Component ---
const ApplicationsPage: React.FC<{ user: User | null }> = ({ user }) => {
    if (!user) {
        return <div className="p-6 text-center">Loading user data...</div>;
    }

    const isStudent = user.role === Role.STUDENT;

    if (isStudent) {
        return <StudentView user={user} />;
    } else {
        // Principal, Faculty, Staff get the admin view
        return <AdminView />;
    }
};

export default ApplicationsPage;
