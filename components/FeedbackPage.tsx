
import React from 'react';
import type { User } from '../types';

const FeedbackPage: React.FC<{ user: User | null }> = ({ user }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Feedback</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">A form for submitting feedback about the application will be here.</p>
        </div>
    );
};

export default FeedbackPage;