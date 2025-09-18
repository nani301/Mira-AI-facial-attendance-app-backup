
import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp, updateUserProfile } from '../services/mockApiService';
import type { User } from '../types';
import { CheckCircleIcon, QrCodeIcon } from './Icons';

const Settings: React.FC<{ user: User | null }> = ({ user: initialUser }) => {
    const [user, setUser] = useState<User | null>(initialUser);

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const handleVerifyEmail = async (email: string, type: 'student' | 'parent') => {
        const otp = prompt(`An OTP has been sent to ${email}. Please enter the 6-digit code below:`);
        if (otp) {
            const { success } = await verifyOtp(email, otp);
            if (success && user) {
                const updates = type === 'student' ? { email_verified: true } : { parent_email_verified: true };
                const updatedUser = await updateUserProfile(user.id, updates);
                setUser(updatedUser);
                alert('Email verified successfully!');
            } else {
                alert('Invalid OTP. Please try again.');
            }
        }
    };
    
    if (!user) return <div className="text-center">Loading settings...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>

            {/* Profile Information */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                        <p className="font-semibold">{user.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                        <p className="font-semibold">{user.role}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">PIN</label>
                        <p className="font-semibold font-mono">{user.pin}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Branch</label>
                        <p className="font-semibold">{user.branch}</p>
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
                        email={user.email} 
                        isVerified={user.email_verified}
                        onVerify={() => handleVerifyEmail(user.email, 'student')}
                    />
                    {/* Parent/Guardian Email */}
                    <EmailRow 
                        label="Parent/Guardian Email" 
                        email={user.parent_email || 'Not set'} 
                        isVerified={user.parent_email_verified}
                        onVerify={() => user.parent_email && handleVerifyEmail(user.parent_email, 'parent')}
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
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mira-attend-session-${user.id}`} 
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
