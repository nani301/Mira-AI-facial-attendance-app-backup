import React, { useState } from 'react';
import { MailIcon, QrCodeIcon } from './Icons';

type LoginProps = {
    onLoginSuccess: () => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'pin' | 'qr'>('pin');
    const [pin, setPin] = useState('');
    const [password, setPassword] = useState(''); // Simulated password

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login success with any non-empty pin and password
        if (pin.trim() && password.trim()) {
            onLoginSuccess();
        } else {
            alert("Please enter PIN and Password.");
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
                            Login with PIN
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
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Your PIN</label>
                                <input
                                    type="text"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="e.g., FAC-01"
                                    className="w-full px-4 py-3 bg-slate-800/60 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-800/60 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 mt-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                            >
                                Login
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
                            <button
                                onClick={onLoginSuccess}
                                className="w-full py-3 mt-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
                            >
                                Continue after Scan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;