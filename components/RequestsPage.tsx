import React, { useState, useEffect, useMemo } from 'react';
import type { User, Application } from '../types';
import { ApplicationStatus } from '../types';
import { getAllApplications, updateApplicationStatus } from '../services/mockApiService';
import { CheckBadgeIcon, CheckCircleIcon, XCircleIcon, SearchIcon } from './Icons';

const getStatusChip = (status: ApplicationStatus) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    if (status === ApplicationStatus.APPROVED) return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    if (status === ApplicationStatus.REJECTED) return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
};

const ApplicationCard: React.FC<{ 
    app: Application & { userName: string }, 
    onApprove: (id: string) => void, 
    onReject: (id: string) => void,
    isPending: boolean
}> = ({ app, onApprove, onReject, isPending }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{app.userName} <span className="font-normal text-sm text-slate-500">({app.pin})</span></p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{app.type} Request</p>
            </div>
            <span className={getStatusChip(app.status)}>{app.status}</span>
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <p><strong>Reason:</strong> {app.payload.reason || app.payload.purpose}</p>
            {app.payload.from_date && <p><strong>Dates:</strong> {app.payload.from_date} to {app.payload.to_date}</p>}
            <p className="text-xs text-slate-400 mt-1">Applied: {new Date(app.created_at).toLocaleString()}</p>
        </div>
        {isPending && (
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => onReject(app.id)} className="font-bold py-2 px-4 rounded-lg transition-colors bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Reject</button>
                <button onClick={() => onApprove(app.id)} className="font-bold py-2 px-4 rounded-lg transition-colors bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
            </div>
        )}
        {!isPending && app.decided_at && (
             <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                Processed by {app.processed_by_name} on {new Date(app.decided_at).toLocaleDateString()}
             </p>
        )}
    </div>
);

const RequestsPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [applications, setApplications] = useState<(Application & { userName: string })[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchApplications = () => {
        getAllApplications().then(setApplications);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const { pending, processed, todaysActivity } = useMemo(() => {
        const filteredApplications = applications.filter(app => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const nameMatch = app.userName.toLowerCase().includes(term);
            const pinMatch = app.pin.toLowerCase().includes(term);
            const typeMatch = app.type.toLowerCase().includes(term);

            return nameMatch || pinMatch || typeMatch;
        });

        const p: (Application & { userName: string })[] = [];
        const d: (Application & { userName: string })[] = [];
        
        filteredApplications.forEach(app => {
            if (app.status === ApplicationStatus.PENDING) {
                p.push(app);
            } else {
                d.push(app);
            }
        });
        
        const todayStr = new Date().toISOString().split('T')[0];
        const activity = applications
            .filter(app => app.status !== ApplicationStatus.PENDING && app.decided_at && app.decided_at.startsWith(todayStr))
            .sort((a,b) => new Date(b.decided_at!).getTime() - new Date(a.decided_at!).getTime());

        return { 
            pending: p.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), 
            processed: d.sort((a, b) => new Date(b.decided_at!).getTime() - new Date(a.decided_at!).getTime()), 
            todaysActivity: activity 
        };
    }, [applications, searchTerm]);

    const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
        if (!user) return;
        await updateApplicationStatus(appId, newStatus, user);
        fetchApplications();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckBadgeIcon className="w-6 h-6"/> Approve Requests
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <div className="relative mb-4">
                        <input 
                            type="text"
                            placeholder="Search by name, PIN, or type (e.g., Leave)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    
                    <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Pending ({pending.length})
                            </button>
                            <button onClick={() => setActiveTab('processed')} className={`${activeTab === 'processed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Processed
                            </button>
                        </nav>
                    </div>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {activeTab === 'pending' && pending.map(app => 
                            <ApplicationCard key={app.id} app={app} onApprove={(id) => handleUpdateStatus(id, ApplicationStatus.APPROVED)} onReject={(id) => handleUpdateStatus(id, ApplicationStatus.REJECTED)} isPending={true} />
                        )}
                         {activeTab === 'processed' && processed.map(app => 
                            <ApplicationCard key={app.id} app={app} onApprove={() => {}} onReject={() => {}} isPending={false} />
                        )}
                        {activeTab === 'pending' && pending.length === 0 && <p className="text-center text-slate-500 py-8">No pending applications found.</p>}
                        {activeTab === 'processed' && processed.length === 0 && <p className="text-center text-slate-500 py-8">No processed applications found.</p>}
                    </div>
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-fit">
                     <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Today's Activity</h3>
                     <ul className="space-y-3">
                        {todaysActivity.map(app => (
                            <li key={app.id} className="flex items-start gap-3 text-sm">
                                {app.status === ApplicationStatus.APPROVED 
                                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    : <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                }
                                <div>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        <span className="font-bold">{app.status}</span> a {app.type} request for <span className="font-semibold text-slate-800 dark:text-slate-100">{app.userName}</span>.
                                    </p>
                                    <p className="text-xs text-slate-400">{new Date(app.decided_at!).toLocaleTimeString()}</p>
                                </div>
                            </li>
                        ))}
                        {todaysActivity.length === 0 && <p className="text-sm text-center text-slate-500 py-4">No requests processed today.</p>}
                     </ul>
                </div>
            </div>
        </div>
    );
};

export default RequestsPage;