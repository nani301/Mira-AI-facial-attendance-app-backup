import React, { useState, useEffect, useMemo } from 'react';
import type { User, Reminder } from '../types';
import { getReminders, addReminder } from '../services/mockApiService';
import { BellIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './Icons';

const RemindersPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: '', description: '', date: '' });

    const fetchReminders = () => {
        getReminders().then(setReminders);
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleAddReminder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newReminder.title || !newReminder.date) return;
        
        await addReminder({
            ...newReminder,
            created_by: user.id
        });
        
        alert(`Reminder "${newReminder.title}" added and a notification has been sent to your email.`);
        setNewReminder({ title: '', description: '', date: '' });
        setShowForm(false);
        fetchReminders();
    };

    const upcomingReminders = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return reminders
            .filter(r => r.date >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [reminders]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BellIcon className="w-6 h-6"/> Reminders &amp; Calendar
                </h2>
                <button onClick={() => setShowForm(!showForm)} className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/> Add Reminder
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md animate-fade-in-up">
                    <h3 className="text-lg font-semibold mb-4">New Reminder</h3>
                    <form onSubmit={handleAddReminder} className="space-y-4">
                        <input type="text" placeholder="Reminder Title" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600" required />
                        <input type="date" value={newReminder.date} onChange={e => setNewReminder({...newReminder, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600" required />
                        <textarea placeholder="Description (optional)" value={newReminder.description} onChange={e => setNewReminder({...newReminder, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600" rows={3}></textarea>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="font-semibold py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                            <button type="submit" className="font-bold py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <CalendarView currentDate={currentDate} reminders={reminders} changeMonth={changeMonth} />
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Reminders</h3>
                    <ul className="space-y-3">
                        {upcomingReminders.map(r => (
                            <li key={r.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{r.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(r.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                {r.description && <p className="text-xs mt-1">{r.description}</p>}
                            </li>
                        ))}
                        {upcomingReminders.length === 0 && <p className="text-sm text-slate-500">No upcoming reminders.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const CalendarView: React.FC<{ currentDate: Date, reminders: Reminder[], changeMonth: (offset: number) => void }> = ({ currentDate, reminders, changeMonth }) => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const reminderDates = new Set(reminders.map(r => r.date));

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2 text-xl"><CalendarIcon className="w-6 h-6"/>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div>
                    <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold text-slate-500 p-2">{day}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const d = day + 1;
                    const dateObj = new Date(year, month, d);
                    const dateString = dateObj.toISOString().split('T')[0];
                    const hasReminder = reminderDates.has(dateString);
                    const isToday = today.toDateString() === dateObj.toDateString();

                    let cellClass = 'p-2 rounded-full flex items-center justify-center h-10 w-10 mx-auto';
                    if (isToday) cellClass += ' bg-indigo-600 text-white';
                    if (hasReminder && !isToday) cellClass += ' bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-300 dark:ring-indigo-700';
                    
                    return (
                        <div key={d} className={cellClass}>
                           {d}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RemindersPage;