

import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../services/mockApiService';
import type { User } from '../types';
import { Role } from '../types';
import { PlusIcon, EditIcon, DeleteIcon } from './Icons';

const UserFormModal: React.FC<{
    user?: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}> = ({ user, onClose, onSave }) => {
    const isEditMode = !!user;
    const [formData, setFormData] = useState<Partial<User>>({
        name: user?.name || '',
        pin: user?.pin || '',
        branch: user?.branch || 'EC',
        role: user?.role || Role.STUDENT,
        email: user?.email || '',
        parent_email: user?.parent_email || '',
        imageUrl: user?.imageUrl || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave: User = {
            id: user?.id || `new_${Date.now()}`,
            year: parseInt(formData.pin?.split('-')[0] || '0'),
            college_code: formData.pin?.split('-')[1] || '',
            email_verified: user?.email_verified || false,
            parent_email_verified: user?.parent_email_verified || false,
            ...formData,
        } as User;
        onSave(userToSave);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{isEditMode ? 'Edit User' : 'Register New User'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">PIN</label>
                            <input type="text" name="pin" required value={formData.pin} onChange={handleInputChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Branch/Department</label>
                            <select name="branch" value={formData.branch} onChange={handleInputChange} className={inputClasses}>
                                <option>EC</option><option>CS</option><option>MECH</option><option>IT</option><option>Office</option><option>Library</option><option>ADMIN</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select name="role" value={formData.role} onChange={handleInputChange} className={inputClasses}>
                                {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email (Optional)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} />
                        </div>
                         <div>
                            <label className="flex items-center text-sm font-medium">
                                Parent Email (for Students)
                            </label>
                            <input type="email" name="parent_email" value={formData.parent_email} onChange={handleInputChange} className={inputClasses} />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium">Profile Image</label>
                             <div className="mt-1 flex items-center gap-4">
                                {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-16 h-16 rounded-full object-cover" />}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                        <button type="submit" className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AuthModal: React.FC<{
    action: string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ action, onClose, onSuccess }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Principal Authentication Required</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Please verify your identity to {action} this user.</p>
            <div className="p-4 border-2 border-dashed rounded-lg border-slate-300 dark:border-slate-600">
                 <p className="font-semibold text-indigo-500">Biometric / OTP</p>
                 <p className="text-xs text-slate-500">This is a simulated authentication step.</p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
                <button type="button" onClick={onClose} className="font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                <button type="button" onClick={onSuccess} className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700">Authenticate & Proceed</button>
            </div>
        </div>
    </div>
);


const ManageUsers: React.FC<{ user: User | null }> = ({ user: authenticatedUser }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [modalState, setModalState] = useState<{ type: 'form' | 'auth' | null, user?: User | null, action?: string }>({ type: null });
    
    const fetchUsers = () => getUsers().then(setAllUsers);

    useEffect(() => {
        fetchUsers();
    }, []);

    const { faculty, staff, students } = useMemo(() => {
        return {
            faculty: allUsers.filter(u => u.role === Role.PRINCIPAL || u.role === Role.HOD || u.role === Role.FACULTY),
            staff: allUsers.filter(u => u.role === Role.STAFF),
            students: allUsers.filter(u => u.role === Role.STUDENT)
        };
    }, [allUsers]);

    // Role-based access control logic
    const canManageFacultyOrStaff = authenticatedUser?.role === Role.PRINCIPAL;
    const canManageStudents = authenticatedUser?.role === Role.PRINCIPAL || authenticatedUser?.role === Role.FACULTY || authenticatedUser?.role === Role.HOD;

    const handleAction = (action: 'add' | 'edit' | 'delete', userToManage: User | null, requiresAuth: boolean) => {
        if (requiresAuth) {
            const actionText = action === 'add' ? 'add a new user' : `${action} this user`;
            setModalState({ type: 'auth', user: userToManage, action: actionText });
        } else {
             setModalState({ type: 'form', user: userToManage });
        }
    };
    
    const handleAuthSuccess = () => {
        if (modalState.action?.startsWith('delete') && modalState.user) {
            deleteUser(modalState.user.id).then(() => {
                setModalState({ type: null });
                fetchUsers();
            });
        } else {
             setModalState(prev => ({ ...prev, type: 'form' }));
        }
    };

    const handleSaveUser = async (userToSave: User) => {
        if (userToSave.id.startsWith('new_')) {
            await addUser(userToSave);
        } else {
            await updateUser(userToSave.id, userToSave);
        }
        setModalState({ type: null });
        fetchUsers();
    };


    return (
        <>
            <div className="space-y-8">
                <UserTable 
                    title="Leadership & Faculty" 
                    users={faculty} 
                    canManage={canManageFacultyOrStaff}
                    onAdd={() => handleAction('add', null, true)}
                    onEdit={(user) => handleAction('edit', user, true)} 
                    onDelete={(user) => handleAction('delete', user, true)} 
                />
                
                 <UserTable 
                    title="Staff" 
                    users={staff} 
                    canManage={canManageFacultyOrStaff}
                    onAdd={() => handleAction('add', null, true)}
                    onEdit={(user) => handleAction('edit', user, true)} 
                    onDelete={(user) => handleAction('delete', user, true)} 
                />

                <UserTable
                    title="Students"
                    users={students}
                    canManage={canManageStudents}
                    onAdd={() => handleAction('add', null, false)} // Faculty can add students without Principal auth
                    onEdit={(user) => handleAction('edit', user, false)}
                    onDelete={(user) => handleAction('delete', user, false)}
                />
            </div>
            
            {modalState.type === 'auth' && (
                <AuthModal
                    action={modalState.action!}
                    onClose={() => setModalState({ type: null })}
                    onSuccess={handleAuthSuccess}
                />
            )}
            
            {modalState.type === 'form' && (
                <UserFormModal
                    user={modalState.user}
                    onClose={() => setModalState({ type: null })}
                    onSave={handleSaveUser}
                />
            )}
        </>
    );
};

const UserTable: React.FC<{
    title: string;
    users: User[];
    canManage: boolean;
    onAdd: () => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}> = ({ title, users, canManage, onAdd, onEdit, onDelete }) => (
     <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            {canManage && (
                <button onClick={onAdd} className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add New {title.split(' ')[0].slice(0, -1)}
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name / PIN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Department/Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email Verified</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.pin}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.branch}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.email_verified ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {user.email_verified ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {canManage ? (
                                    <>
                                        <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 p-1"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDelete(user)} className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 p-1"><DeleteIcon className="w-5 h-5"/></button>
                                    </>
                                ) : (
                                    <span className="text-slate-400 dark:text-slate-500 text-xs italic">No permissions</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default ManageUsers;