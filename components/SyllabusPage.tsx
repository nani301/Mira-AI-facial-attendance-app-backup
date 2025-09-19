
import React from 'react';
import type { User } from '../types';

const SyllabusPage: React.FC<{ user: User | null }> = ({ user }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Syllabus</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Syllabus information and progress tracking will be displayed here.</p>
        </div>
    );
};

export default SyllabusPage;