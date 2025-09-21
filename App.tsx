
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page, User } from './types';
import { getAuthenticatedUser, getAllFaculty, setAuthenticatedUser as apiSetAuthenticatedUser } from './services/mockApiService';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';

// Lazy load page components for better performance and code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Reports = lazy(() => import('./components/Reports'));
const AttendanceLog = lazy(() => import('./components/AttendanceLog'));
const ManageUsers = lazy(() => import('./components/ManageUsers'));
const Settings = lazy(() => import('./components/Settings'));
const Notebook = lazy(() => import('./components/Notebook'));
const SyllabusPage = lazy(() => import('./components/SyllabusPage'));
const ApplicationsPage = lazy(() => import('./components/ApplicationsPage'));
const SbtetResultsPage = lazy(() => import('./components/SbtetResultsPage'));
const TimetablePage = lazy(() => import('./components/TimetablePage'));
const FeedbackPage = lazy(() => import('./components/FeedbackPage'));

const PageLoader: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center p-10">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
    </div>
);


const App: React.FC = () => {
    // State for splash screen
    const [isLoading, setIsLoading] = useState(true);

    // State for authentication
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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

    // Splash screen timer effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2800);
        return () => clearTimeout(timer);
    }, []);


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
    
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

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
    
    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLogin} />;
    }
    
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
                    <Suspense fallback={<PageLoader />}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;