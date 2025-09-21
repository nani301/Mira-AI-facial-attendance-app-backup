
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Syllabus } from '../types';
import { Role } from '../types';
import { getSyllabusData } from '../services/mockApiService';
import { UploadIcon, SyllabusIcon } from './Icons';

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const getColor = () => {
        if (percentage < 50) return 'bg-red-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5 relative overflow-hidden">
            <div
                className={`${getColor()} h-full rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-screen">
                {percentage}%
            </span>
        </div>
    );
};

const SyllabusCard: React.FC<{ syllabus: Syllabus; canUpload: boolean }> = ({ syllabus, canUpload }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{syllabus.subject}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Faculty: {syllabus.uploaded_by_name}</p>
            </div>
            {canUpload && (
                 <button className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors">
                    <UploadIcon className="w-4 h-4" />
                    Upload Syllabus
                </button>
            )}
        </div>
        <div className="mt-3">
            <ProgressBar percentage={syllabus.percent_completed} />
        </div>
    </div>
);


const SyllabusPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [allSyllabus, setAllSyllabus] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSyllabusData().then(data => {
            setAllSyllabus(data);
            setLoading(false);
        });
    }, []);

    const { canSeeAll, filteredSyllabus } = useMemo(() => {
        if (!user) return { canSeeAll: false, filteredSyllabus: [] };
        
        const isPrivileged = user.role === Role.PRINCIPAL || user.role === Role.HOD;
        const filtered = isPrivileged
            ? allSyllabus
            : allSyllabus.filter(s => s.uploaded_by === user.id);
            
        return { canSeeAll: isPrivileged, filteredSyllabus: filtered };
    }, [user, allSyllabus]);
    
    const syllabusByBranch = useMemo(() => {
        return filteredSyllabus.reduce((acc, item) => {
            const branch = item.branch || 'General';
            (acc[branch] = acc[branch] || []).push(item);
            return acc;
        }, {} as Record<string, Syllabus[]>);
    }, [filteredSyllabus]);


    if (loading || !user) {
        return (
            <div className="w-full h-full flex items-center justify-center p-10">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <SyllabusIcon className="w-6 h-6"/>
                    Syllabus Progress Tracker
                </h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                    {canSeeAll ? "Viewing syllabus progress for all departments." : `Viewing syllabus progress for subjects assigned to you.`}
                </p>
             </div>

            {Object.entries(syllabusByBranch).map(([branch, items]) => (
                <div key={branch} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    {canSeeAll && (
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                           Department: {branch}
                        </h3>
                    )}
                    <div className="space-y-4">
                        {items.map(s => (
                            <SyllabusCard 
                                key={s.id} 
                                syllabus={s}
                                canUpload={s.uploaded_by === user.id} 
                            />
                        ))}
                    </div>
                </div>
            ))}
            
            {filteredSyllabus.length === 0 && !loading && (
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                    <p className="text-slate-500 dark:text-slate-400">No syllabus data found for your profile.</p>
                </div>
            )}
        </div>
    );
};

export default SyllabusPage;
