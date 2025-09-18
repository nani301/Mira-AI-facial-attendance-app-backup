import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/mockApiService';
import type { Page } from '../types';
import { QrCodeIcon } from './Icons';

const StatCard: React.FC<{ title: string; value: string; color: string; total?: string }> = ({ title, value, color, total }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex-1">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value} {total && <span className="text-xl font-medium text-slate-500 dark:text-slate-400">/ {total}</span>}</p>
    </div>
);

type DashboardProps = {
  setCurrentPage: (page: Page) => void;
};


const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        getDashboardStats(todayStr).then(setStats);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
                <StatCard title="Present Today" value={`${stats.present}`} total={`${stats.total}`} color="text-green-500" />
                <StatCard title="Absent Today" value={`${stats.absent}`} color="text-red-500" />
                <StatCard title="Attendance %" value={`${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%`} color="text-indigo-500" />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard title="Mark Attendance" description="Open camera to start facial recognition." onClick={() => setCurrentPage('logs')} />
                <ActionCard title="View Reports" description="Analyze attendance data and trends." onClick={() => setCurrentPage('reports')} />
                <ActionCard title="Syllabus Progress" description="Check course completion status." onClick={() => setCurrentPage('syllabus')} />
                <ActionCard title="QR Desktop Login" description="Pair with a Windows desktop session." onClick={() => setCurrentPage('settings')} icon={<QrCodeIcon className="w-6 h-6 mb-2 text-indigo-500"/>}/>
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
    <div onClick={onClick} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col items-center text-center">
        {icon}
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

export default Dashboard;