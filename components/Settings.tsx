import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp } from '../services/mockApiService';
import type { User } from '../types';
import { CheckCircleIcon, QrCodeIcon, EditIcon } from './Icons';

type SettingsProps = {
    user: User | null;
    onUpdateUser: (updates: Partial<User>) => void;
};


const Settings: React.FC<SettingsProps> = ({ user: initialUser, onUpdateUser }) => {
    const [formData, setFormData] = useState({ name: '', imageUrl: '' });
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialUser) {
            setFormData({
                name: initialUser.name,
                imageUrl: initialUser.imageUrl || '',
            });
            setIsDirty(false);
        }
    }, [initialUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
                setIsDirty(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSave = async () => {
        if (!initialUser || !isDirty) return;
        setIsSaving(true);
        await onUpdateUser({ name: formData.name, imageUrl: formData.imageUrl });
        setIsSaving(false);
        setIsDirty(false);
    };


    const handleVerifyEmail = async (email: string, type: 'student' | 'parent') => {
        const otp = prompt(`An OTP has been sent to ${email}. Please enter the 6-digit code below:`);
        if (otp) {
            const { success } = await verifyOtp(email, otp);
            if (success && initialUser) {
                const updates = type === 'student' ? { email_verified: true } : { parent_email_verified: true };
                onUpdateUser(updates);
                alert('Email verified successfully!');
            } else {
                alert('Invalid OTP. Please try again.');
            }
        }
    };
    
    if (!initialUser) return <div className="text-center">Loading settings...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>

            {/* Profile Information */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Profile Information</h3>
                     {isDirty && (
                        <button onClick={handleSave} disabled={isSaving} className="font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
                
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group flex-shrink-0">
                        <img src={formData.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(initialUser.name)}`} alt={initialUser.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700" />
                        <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition-all">
                            <EditIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </label>
                        <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow w-full">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="font-semibold p-2 w-full bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                            <p className="font-semibold p-2">{initialUser.role}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">PIN</label>
                            <p className="font-semibold font-mono p-2">{initialUser.pin}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Branch</label>
                            <p className="font-semibold p-2">{initialUser.branch}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                    {/* Student Email */}
                    <EmailRow 
                        label="Student Email" 
                        email={initialUser.email} 
                        isVerified={initialUser.email_verified}
                        onVerify={() => handleVerifyEmail(initialUser.email, 'student')}
                    />
                    {/* Parent/Guardian Email */}
                    <EmailRow 
                        label="Parent/Guardian Email" 
                        email={initialUser.parent_email || 'Not set'} 
                        isVerified={initialUser.parent_email_verified}
                        onVerify={() => initialUser.parent_email && handleVerifyEmail(initialUser.parent_email, 'parent')}
                        isEditable={true}
                    />
                </div>
            </div>

            {/* QR Code Desktop Login */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <QrCodeIcon className="w-6 h-6" />
                    QR Code Login (Desktop)
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white border rounded-lg">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mira-attend-session-${initialUser.id}`} 
                            alt="QR Code for desktop login"
                            className="w-36 h-36"
                        />
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
                        <p>Scan this QR code with the Mira Attendance mobile app to log in to a desktop session instantly.</p>
                        <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
                            <p className="font-semibold">Your desktop session will be active for 6 hours.</p>
                            <p className="text-xs">You can log out from the desktop session at any time.</p>
                        </div>
                        <button onClick={() => alert('Desktop session logged out.')} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                            Logout Desktop Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const EmailRow: React.FC<{label: string, email: string, isVerified: boolean, onVerify: () => void, isEditable?: boolean}> = 
({ label, email, isVerified, onVerify, isEditable }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <p className="font-semibold flex items-center gap-2">
                    {email}
                    {isVerified && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
                {isEditable && <button className="text-sm font-semibold text-indigo-600 hover:underline">Edit</button>}
                {!isVerified && email !== 'Not set' && (
                    <button onClick={onVerify} className="text-sm font-semibold text-green-600 hover:underline">Verify</button>
                )}
            </div>
        </div>
    );
}

export default Settings;