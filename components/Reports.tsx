
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAttendanceByDateAndBranch, getUsers } from '../services/mockApiService';
import type { AttendanceRecord, User } from '../types';
import { AttendanceStatus, Role } from '../types';
import { ExportIcon } from './Icons';

// Normalizes PIN input (e.g., "23101cs001" -> "23-101-CS-001")
const normalizePin = (pin: string): string => {    
    const compact = pin.toUpperCase().replace(/-/g, '');
    const regex = /^(?<year>\d{2})(?<college>\d{3})(?<branch>EC|EE|CS|MECH|CE|IT|AI|DS)(?<roll>\d{3})$/;
    const match = compact.match(regex);
    if (!match?.groups) return pin;
    const { year, college, branch, roll } = match.groups;
    return `${year}-${college}-${branch}-${roll}`;
};

const PinInput: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const [displayValue, setDisplayValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // For students, normalize the PIN. For others, just use the input.
        const normalized = placeholder?.includes('Student') ? normalizePin(input) : input;
        setDisplayValue(input);
        onChange(normalized);
    };

    return (
        <input
            type="text"
            placeholder={placeholder || "Search..."}
            value={displayValue}
            onChange={handleChange}
            className="w-full sm:w-1/3 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
        />
    );
};

const StudentGrid: React.FC<{ users: User[], attendance: AttendanceRecord[], onSelectUser: (user: User) => void }> = ({ users, attendance, onSelectUser }) => {
    const presentPins = new Set(attendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).map(r => r.userPin));
    
    return (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2">
            {users.map(user => {
                const isPresent = presentPins.has(user.pin);
                return (
                    <div 
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={`p-2 rounded text-center text-xs font-mono cursor-pointer transition-transform hover:scale-110
                            ${isPresent ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        title={user.name}
                    >
                        {user.pin.split('-')[3] || user.pin}
                    </div>
                );
            })}
        </div>
    );
};

const FacultyList: React.FC<{ users: User[], attendance: AttendanceRecord[], onSelectUser: (user: User) => void }> = ({ users, attendance, onSelectUser }) => {
    const presentUserIds = new Set(attendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).map(r => r.userId));

    return (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map(user => {
                        const isPresent = presentUserIds.has(user.id);
                        return (
                             <tr key={user.id} onClick={() => onSelectUser(user)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrl} alt={user.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.pin}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPresent ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                        {isPresent ? 'Present' : 'Absent'}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};


const Reports: React.FC = () => {
    const [viewMode, setViewMode] = useState('CS'); // Branch code or 'FACULTY'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getUsers().then(setAllUsers);
    }, []);
    
    useEffect(() => {
        getAttendanceByDateAndBranch(date, viewMode).then(setAttendance);
    }, [viewMode, date]);

    const { usersForView, filteredUsers, isFacultyView } = useMemo(() => {
        const facultyView = viewMode === 'FACULTY';
        const users = allUsers.filter(u => {
            if (facultyView) return u.role === Role.FACULTY || u.role === Role.PRINCIPAL;
            return u.role === Role.STUDENT && u.branch === viewMode;
        });
        
        const filtered = !searchTerm ? users : users.filter(u => 
            u.pin.toUpperCase().includes(searchTerm.toUpperCase()) || 
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return { usersForView: users, filteredUsers: filtered, isFacultyView: facultyView };
    }, [allUsers, viewMode, searchTerm]);

    const stats = useMemo(() => {
        const present = attendance.length;
        const total = usersForView.length;
        const absent = total - present;
        return { present, absent, total };
    }, [attendance, usersForView]);

    const pieData = [
        { name: 'Present', value: stats.present },
        { name: 'Absent', value: stats.absent },
    ].filter(item => item.value > 0);

    const COLORS = ['#10B981', '#EF4444'];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Daily Attendance Report</h3>
                    <div className="flex gap-2">
                        <button onClick={() => alert('Exporting to CSV...')} className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                            <ExportIcon className="w-4 h-4" /> CSV
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <PinInput 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder={isFacultyView ? "Search Faculty Name/PIN" : "Search Student PIN"}
                    />
                    <div className="flex gap-4">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        >
                            <option value="CS">CS</option>
                            <option value="EC">EC</option>
                            <option value="MECH">MECH</option>
                            <option value="IT">IT</option>
                            <option value="FACULTY">Faculty</option>
                        </select>
                         <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                        />
                    </div>
                </div>

                {isFacultyView ? (
                    <FacultyList users={filteredUsers} attendance={attendance} onSelectUser={(user) => alert(`Selected Faculty: ${user.name} (${user.pin})`)} />
                ) : (
                    <StudentGrid users={filteredUsers} attendance={attendance} onSelectUser={(user) => alert(`Selected Student: ${user.name} (${user.pin})`)} />
                )}

                 <p className="text-right mt-4 font-semibold">{stats.present}/{stats.total} Present</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Daily Attendance Trend (Last 7 Days)</h3>
                    {/* Bar chart data would be fetched here */}
                    <p className="text-slate-500 dark:text-slate-400">Bar chart showing daily trend will be here.</p>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Today's Status ({viewMode})</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
