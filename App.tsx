

import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page, User } from './types';
import { getAllFaculty, setAuthenticatedUser as apiSetAuthenticatedUser, updateUserProfile, getDashboardStats } from './services/mockApiService';
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
const RemindersPage = lazy(() => import('./components/RemindersPage'));
const RequestsPage = lazy(() => import('./components/RequestsPage'));
const QRScannerPage = lazy(() => import('./components/QRScannerPage'));


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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State for user and theme
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // NEW: State for dashboard stats, lifted from Dashboard component
    const [dashboardStats, setDashboardStats] = useState({ present: 0, absent: 0, total: 0 });

    // Splash screen timer effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Reduced splash screen time
        return () => clearTimeout(timer);
    }, []);

    // NEW: Function to fetch/refresh dashboard stats
    const fetchDashboardStats = useCallback(async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const stats = await getDashboardStats(todayStr);
        setDashboardStats(stats);
    }, []);

    useEffect(() => {
        // Fetch all faculty for the user switcher dropdown
        getAllFaculty().then(setFacultyList);
        // Fetch initial dashboard stats
        fetchDashboardStats();
    }, [fetchDashboardStats]);

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
    
    const handleLogin = (user: User) => {
        // When a user logs in, set their ID in the mock API state
        // and update the app's state.
        apiSetAuthenticatedUser(user.id).then(authedUser => {
             if (authedUser) {
                setCurrentUser(authedUser);
                setIsAuthenticated(true);
            }
        });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
    };
    
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleThemeAndSidebarToggle = () => {
        setIsSidebarOpen(prev => !prev);
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleUserChange = (userId: string) => {
        apiSetAuthenticatedUser(userId).then(setCurrentUser);
    };
    
    const handleUpdateUser = async (updates: Partial<User>) => {
        if (currentUser) {
            const updatedUser = await updateUserProfile(currentUser.id, updates);
            if(updatedUser) {
                setCurrentUser(updatedUser);
            }
        }
    };


    const handlePageChange = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard setCurrentPage={handlePageChange} currentUser={currentUser} stats={dashboardStats} />;
            case 'reports': return <Reports />;
            case 'logs': return <AttendanceLog onAttendanceMarked={fetchDashboardStats} />;
            case 'users': return <ManageUsers user={currentUser} />;
            case 'settings': return <Settings user={currentUser} onUpdateUser={handleUpdateUser} />;
            case 'notebook': return <Notebook />;
            case 'syllabus': return <SyllabusPage user={currentUser} />;
            case 'applications': return <ApplicationsPage user={currentUser} />;
            case 'sbtet': return <SbtetResultsPage user={currentUser} />;
            case 'timetables': return <TimetablePage user={currentUser} />;
            case 'feedback': return <FeedbackPage user={currentUser} />;
            case 'reminders': return <RemindersPage user={currentUser} />;
            case 'requests': return <RequestsPage user={currentUser} />;
            case 'qr-scanner': return <QRScannerPage setCurrentPage={handlePageChange} />;
            default: return <Dashboard setCurrentPage={handlePageChange} currentUser={currentUser} stats={dashboardStats} />;
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
                onClose={closeSidebar}
                currentPage={currentPage}
                setCurrentPage={handlePageChange}
                onLogout={handleLogout}
                currentUser={currentUser}
            />

            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden"
                    aria-hidden="true"
                ></div>
            )}
            
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
                <Header
                    onThemeAndSidebarToggle={handleThemeAndSidebarToggle}
                    currentTheme={theme}
                    currentUser={currentUser}
                    facultyList={facultyList}
                    onUserChange={handleUserChange}
                />
                <main className="flex-1 p-4 sm:p-6">
                    <Suspense fallback={<PageLoader />}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;