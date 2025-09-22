
import React, { useState, useEffect } from 'react';
import type { User, Feedback } from '../types';
import { getFeedbackForUser, submitFeedback } from '../services/mockApiService';
import { SmileyIcon } from './Icons';

const FeedbackPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [feedbackType, setFeedbackType] = useState<'Suggestion' | 'Bug Report' | 'Other'>('Suggestion');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedFeedback, setSubmittedFeedback] = useState<Feedback[]>([]);

    const fetchFeedback = () => {
        if (user) {
            getFeedbackForUser(user.id).then(setSubmittedFeedback);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !message) return;

        setIsSubmitting(true);
        try {
            await submitFeedback({
                user_id: user.id,
                user_name: user.name,
                user_role: user.role,
                category: feedbackType,
                message,
                is_anonymous: isAnonymous,
            });
            alert('Thank you! Your feedback has been submitted successfully.');
            // Reset form and refresh list
            setMessage('');
            setFeedbackType('Suggestion');
            setIsAnonymous(false);
            fetchFeedback();
        } catch (error) {
            alert('There was an error submitting your feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/\//g, '/');
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                <SmileyIcon className="w-12 h-12 text-indigo-500" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Feedback & Support</h2>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Help us improve the Mira Attendance system.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Submission Form Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Submit Feedback</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Have a suggestion or found a bug? Let us know!</p>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="feedbackType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Feedback Type</label>
                            <select
                                id="feedbackType"
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value as any)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option>Suggestion</option>
                                <option>Bug Report</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                            <textarea
                                id="message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Please provide as much detail as possible..."
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="anonymous"
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-slate-100 dark:bg-slate-900"
                            />
                            <label htmlFor="anonymous" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">Submit Anonymously</label>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full font-bold py-2.5 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>

                {/* Submitted Feedback Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Your Submitted Feedback</h3>
                    
                    <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {submittedFeedback.length > 0 ? (
                            submittedFeedback.map(fb => (
                                <div key={fb.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {fb.category}
                                    </span>
                                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{fb.message}</p>
                                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                        <span>
                                            From: {fb.is_anonymous ? 'Anonymous' : `${fb.user_name.toUpperCase()} (${fb.user_role.toUpperCase()})`}
                                        </span>
                                        <span>{formatDate(fb.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">You haven't submitted any feedback yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;