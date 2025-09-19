
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import AttendanceLog from './components/AttendanceLog';
import ManageUsers from './components/ManageUsers';
import Header from './components/Header';
import Settings from './components/Settings';
import Notebook from './components/Notebook';
import type { Page, User } from './types';
import { getAuthenticatedUser, getAllFaculty, setAuthenticatedUser as apiSetAuthenticatedUser } from './services/mockApiService';
import SyllabusPage from './components/SyllabusPage';
import ApplicationsPage from './components/ApplicationsPage';
import SbtetResultsPage from './components/SbtetResultsPage';
import TimetablePage from './components/TimetablePage';
import FeedbackPage from './components/FeedbackPage';

const App: React.FC = () => {
    // State for navigation
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    // State for user and theme
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // Sidebar visibility is now directly linked to the theme
    const isSidebarOpen = theme === 'dark';

    useEffect(() => {
        // Fetch initial user and faculty data
        getAuthenticatedUser().then(setCurrentUser);
        getAllFaculty().then(setFacultyList);
    }, []);

    // Theme handling effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleUserChange = (userId: string) => {
        apiSetAuthenticatedUser(userId).then(setCurrentUser);
    };

    const handlePageChange = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) {
            // On mobile, changing page closes the sidebar by switching to light theme
            setTheme('light');
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard setCurrentPage={handlePageChange} />;
            case 'reports': return <Reports />;
            case 'logs': return <AttendanceLog />;
            case 'users': return <ManageUsers user={currentUser} />;
            case 'settings': return <Settings user={currentUser} />;
            case 'notebook': return <Notebook />;
            case 'syllabus': return <SyllabusPage user={currentUser} />;
            case 'applications': return <ApplicationsPage user={currentUser} />;
            case 'sbtet': return <SbtetResultsPage user={currentUser} />;
            case 'timetables': return <TimetablePage user={currentUser} />;
            case 'feedback': return <FeedbackPage user={currentUser} />;
            default: return <Dashboard setCurrentPage={handlePageChange} />;
        }
    };
    
    return (
        <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setTheme('light')} // Closing the sidebar means switching to light theme
                currentPage={currentPage}
                setCurrentPage={handlePageChange}
            />

            {isSidebarOpen && (
                <div
                    onClick={() => setTheme('light')} // Clicking the overlay also switches to light theme
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden"
                    aria-hidden="true"
                ></div>
            )}
            
            <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : ''}`}>
                <Header
                    toggleTheme={toggleTheme}
                    currentTheme={theme}
                    currentUser={currentUser}
                    facultyList={facultyList}
                    onUserChange={handleUserChange}
                />
                <main className="flex-1 p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
