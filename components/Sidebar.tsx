import React from 'react';
import type { Page, User } from '../types';
import { Role } from '../types';
import { DashboardIcon, ReportIcon, LogIcon, UserIcon, LogoutIcon, SyllabusIcon, SettingsIcon, ApplicationIcon, ResultsIcon, TimetableIcon, FeedbackIcon, NotebookIcon, XCircleIcon, CheckBadgeIcon, BellIcon } from './Icons';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  currentUser: User | null;
};

const NavItem: React.FC<{
  page: Page;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <li
      className={`
        flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100'
        }
      `}
      onClick={onClick}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, setCurrentPage, onLogout, currentUser }) => {
  // Base item definitions with associated roles
  const allNavItems = [
    { page: 'dashboard' as Page, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
    { page: 'requests' as Page, label: 'Approve Requests', icon: <CheckBadgeIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL] },
    { page: 'reminders' as Page, label: 'Reminders', icon: <BellIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL] },
    { page: 'reports' as Page, label: 'Reports', icon: <ReportIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
    { page: 'logs' as Page, label: 'Attendance Log', icon: <LogIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
    { page: 'users' as Page, label: 'Manage Users', icon: <UserIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
  ];
  
  const allAcademicItems = [
     { page: 'applications' as Page, label: 'Applications', icon: <ApplicationIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
     { page: 'sbtet' as Page, label: 'SBTET Results', icon: <ResultsIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
     { page: 'syllabus' as Page, label: 'Syllabus', icon: <SyllabusIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
     { page: 'timetables' as Page, label: 'Timetables', icon: <TimetableIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
     { page: 'notebook' as Page, label: 'Notebook LLM', icon: <NotebookIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
  ];
  
  const allSystemItems = [
      { page: 'feedback' as Page, label: 'Feedback', icon: <FeedbackIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
      { page: 'settings' as Page, label: 'Settings', icon: <SettingsIcon className="w-6 h-6" />, roles: [Role.PRINCIPAL, Role.HOD, Role.FACULTY, Role.STAFF] },
  ];

  const userRole = currentUser?.role;

  // Filter items based on the current user's role
  const filterItemsByRole = (items: typeof allNavItems) => {
      if (!userRole) return [];
      if (userRole === Role.PRINCIPAL) return items; // Principal sees all
      return items.filter(item => item.roles.includes(userRole));
  };

  const navItems = filterItemsByRole(allNavItems);
  const academicItems = filterItemsByRole(allAcademicItems);
  const systemItems = filterItemsByRole(allSystemItems);


  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 flex-shrink-0 p-4 flex flex-col shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!isOpen}>
        <div className="relative flex items-center mb-6 p-2">
            <div className="flex items-center">
                <div className="bg-indigo-600 rounded-lg p-2 mr-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"></path></svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mira Attendance</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Founded by Nani</p>
                </div>
            </div>
             <button onClick={onClose} className="absolute top-0 right-0 p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden" aria-label="Close sidebar">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
      <nav className="flex-1 overflow-y-auto -mr-2 pr-2">
          {navItems.length > 0 && (
            <>
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</p>
                <ul>
                    {navItems.map((item) => (
                    <NavItem
                        key={item.page}
                        {...item}
                        isActive={currentPage === item.page}
                        onClick={() => setCurrentPage(item.page)}
                    />
                    ))}
                </ul>
            </>
          )}
          {academicItems.length > 0 && (
            <>
                <p className="mt-6 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Academics</p>
                <ul>
                    {academicItems.map((item) => (
                    <NavItem
                        key={item.page}
                        {...item}
                        isActive={currentPage === item.page}
                        onClick={() => setCurrentPage(item.page)}
                    />
                    ))}
                </ul>
            </>
          )}
          {systemItems.length > 0 && (
            <>
                 <p className="mt-6 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</p>
                <ul>
                    {systemItems.map((item) => (
                    <NavItem
                        key={item.page}
                        {...item}
                        isActive={currentPage === item.page}
                        onClick={() => setCurrentPage(item.page)}
                    />
                    ))}
                </ul>
            </>
          )}
      </nav>
      <div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
         <button
            onClick={onLogout}
            className="w-full text-left flex items-center p-3 my-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
          >
            <LogoutIcon className="w-6 h-6" />
            <span className="ml-4 font-medium">Logout</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;