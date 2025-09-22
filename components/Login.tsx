import React, { useState } from 'react';
import { MailIcon, QrCodeIcon, EyeIcon, EyeSlashIcon } from './Icons';
import { login } from '../services/mockApiService';
import type { User } from '../types';

type LoginProps = {
    onLoginSuccess: (user: User) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'pin' | 'qr'>('pin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Add a small delay to make the loading indicator visible
            await new Promise(resolve => setTimeout(resolve, 500));
            const user = await login(email, password);
            if (user) {
                onLoginSuccess(user);
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !value.includes('@')) {
            setSuggestion('@mira.in');
        } else {
            setSuggestion('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
            const input = e.target as HTMLInputElement;
            if (input.selectionStart === email.length) {
                e.preventDefault();
                setEmail(email + suggestion);
                setSuggestion('');
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center animated-gradient p-4">
            <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-8 text-slate-100">
                    <div className="flex flex-col items-center text-center mb-8">
                         <div className="bg-indigo-500/30 rounded-lg p-3 mb-4 border border-indigo-500/50">
                            <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"></path></svg>
                        </div>
                        <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
                        <p className="text-slate-300 mt-1">Login to your Mira Attendance account.</p>
                    </div>

                    <div className="flex bg-slate-800/60 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setActiveTab('pin')}
                            className={`w-1/2 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'pin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
                        >
                            <MailIcon className="w-5 h-5" />
                            Login with Email
                        </button>
                        <button
                            onClick={() => setActiveTab('qr')}
                            className={`w-1/2 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'qr' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
                        >
                            <QrCodeIcon className="w-5 h-5" />
                            Scan QR Code
                        </button>
                    </div>

                    {activeTab === 'pin' ? (
                        <form onSubmit={handleLogin} className={`space-y-4 ${error ? 'animate-shake' : ''}`}>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Enter registered email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="e.g., faculty01@mira.in"
                                        className="w-full px-4 py-3 bg-slate-800/60 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                        required
                                        autoComplete="off"
                                    />
                                    {suggestion && (
                                        <div className="absolute inset-y-0 left-0 px-4 py-3 flex items-center pointer-events-none">
                                            <span className="text-transparent">{email}</span>
                                            <span className="text-slate-500">{suggestion}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-800/60 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3 mt-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : 'Login'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="mb-4 text-slate-300">Scan this QR code with the Mira Attendance mobile app to log in instantly.</p>
                            <div className="p-4 bg-white rounded-lg inline-block">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=mira-attend-login-simulation" 
                                    alt="QR Code for desktop login"
                                    className="w-44 h-44"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;