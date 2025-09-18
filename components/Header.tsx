
import React, { useState } from 'react';
import type { User } from '../types';
import { SunIcon, MoonIcon } from './Icons';

type HeaderProps = {
    toggleTheme: () => void;
    currentTheme: string;
    currentUser: User | null;
    facultyList: User[];
    onUserChange: (userId: string) => void;
};

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme, currentUser, facultyList, onUserChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const user = currentUser;

    if (!user) {
        return <div className="h-20"></div>; // Placeholder for loading state
    }

    const handleUserSelect = (userId: string) => {
        onUserChange(userId);
        setIsDropdownOpen(false);
    };

    const nameParts = user.name.split(' ');
    const facultyDisplayName = nameParts.length > 1 && nameParts[0].length <= 2 ? nameParts[1] : nameParts[0];

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back, {facultyDisplayName}!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Here's a look at what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
                 <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    {currentTheme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                </button>
                <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-right cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div>
                            <div className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.role}</div>
                        </div>
                         <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl overflow-hidden ml-4">
                            {user.imageUrl ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                        </div>
                    </button>
                    {isDropdownOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <div className="px-4 py-2 text-xs text-slate-400">Switch Faculty</div>
                            {facultyList.map(faculty => (
                                <a
                                    key={faculty.id}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleUserSelect(faculty.id);
                                    }}
                                    className={`block px-4 py-2 text-sm transition-colors ${
                                        faculty.id === user.id 
                                        ? 'bg-indigo-500 text-white' 
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {faculty.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
