import React from 'react';
import type { Page, User } from '../types';
import { Role } from '../types';
import { QrCodeIcon, BellIcon, CheckBadgeIcon, NotebookIcon, LogIcon, ReportIcon, SyllabusIcon, ApplicationIcon } from './Icons';

const StatCard: React.FC<{ title: string; value: string; color: string; total?: string }> = ({ title, value, color, total }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex-1">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value} {total && <span className="text-xl font-medium text-slate-500 dark:text-slate-400">/ {total}</span>}</p>
    </div>
);

type DashboardProps = {
  setCurrentPage: (page: Page) => void;
  currentUser: User | null;
  stats: { present: number; absent: number; total: number; };
};


const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage, currentUser, stats }) => {
    if (!currentUser) {
        return null; // Or a loading state
    }

    const { role } = currentUser;

    const allCards = [
        { id: 'mark-attendance', title: 'Mark Attendance', description: 'Open camera for facial recognition.', onClick: () => setCurrentPage('logs'), icon: <LogIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
        { id: 'view-reports', title: 'View Reports', description: 'Analyze attendance data and trends.', onClick: () => setCurrentPage('reports'), icon: <ReportIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
        { id: 'approve-requests', title: 'Approve Requests', description: 'Manage leave and certificate applications.', onClick: () => setCurrentPage('requests'), icon: <CheckBadgeIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL] },
        { id: 'reminders', title: 'Reminders & Calendar', description: 'Set deadlines and view important dates.', onClick: () => setCurrentPage('reminders'), icon: <BellIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL] },
        { id: 'syllabus', title: 'Syllabus Progress', description: 'Check course completion status.', onClick: () => setCurrentPage('syllabus'), icon: <SyllabusIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
        { id: 'applications', title: 'Applications', description: 'Manage leave and bonafide requests.', onClick: () => setCurrentPage('applications'), icon: <ApplicationIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.STAFF] },
        { id: 'notebook', title: 'Notebook LLM', description: 'AI tools for lesson planning.', onClick: () => setCurrentPage('notebook'), icon: <NotebookIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY], desktopOnly: true },
        { id: 'qr-scanner', title: 'QR Desktop Login', description: 'Scan to pair with a desktop.', onClick: () => setCurrentPage('qr-scanner'), icon: <QrCodeIcon className="w-8 h-8 mb-2 text-indigo-500"/>, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF], mobileOnly: true },
    ];

    const visibleCards = allCards.filter(card => card.roles.includes(role));

    let gridClasses = 'grid grid-cols-1 md:grid-cols-2 gap-6';
    if (role === Role.PRINCIPAL) {
        gridClasses += ' lg:grid-cols-3'; // 3x2 grid
    } else if (role === Role.FACULTY || role === Role.HOD) {
        gridClasses += ' lg:grid-cols-2'; // 2x2 grid
    } else if (role === Role.STAFF) {
        gridClasses += ' lg:grid-cols-2'; // 2x1 grid
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
                <StatCard title="Present Today" value={`${stats.present}`} total={`${stats.total}`} color="text-green-500" />
                <StatCard title="Absent Today" value={`${stats.absent}`} color="text-red-500" />
                <StatCard title="Attendance %" value={`${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%`} color="text-indigo-500" />
            </div>
            
            <div className={gridClasses}>
                {visibleCards.map(card => {
                    const responsiveClass = card.mobileOnly ? 'md:hidden' : card.desktopOnly ? 'hidden md:flex' : 'flex';
                    // For Staff, ensure the single-row layout on desktop
                    const staffLayoutClass = role === Role.STAFF ? 'lg:col-span-1' : '';
                    
                    return (
                        <div key={card.id} className={`${responsiveClass} ${staffLayoutClass}`}>
                           <ActionCard title={card.title} description={card.description} onClick={card.onClick} icon={card.icon} />
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Notifications</h3>
                <div className="space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200">
                        <p><span className="font-bold">System Update:</span> The nightly email summary job is scheduled to run at 2 AM.</p>
                    </div>
                     <div className="p-4 bg-amber-50 dark:bg-amber-900/50 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200">
                        <p><span className="font-bold">Reminder:</span> Faculty members, please update syllabus progress for October by the end of this week.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard: React.FC<{title: string, description: string, onClick: () => void, icon?: React.ReactNode}> = ({ title, description, onClick, icon }) => (
    <div onClick={onClick} className="w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col items-center text-center h-full">
        {icon}
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

export default Dashboard;