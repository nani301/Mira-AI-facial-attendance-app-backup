import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import WebcamCapture from './WebcamCapture';
import { ArrowLeftIcon, CheckCircleIcon } from './Icons';

type QRScannerPageProps = {
    setCurrentPage: (page: Page) => void;
};

const QRScannerPage: React.FC<QRScannerPageProps> = ({ setCurrentPage }) => {
    const [scanStatus, setScanStatus] = useState<'scanning' | 'success'>('scanning');

    // Effect to simulate a successful scan
    useEffect(() => {
        const scanTimer = setTimeout(() => {
            setScanStatus('success');
        }, 3000); // Simulate scanning for 3 seconds

        return () => clearTimeout(scanTimer);
    }, []);

    // Effect to redirect back to the dashboard after a successful scan
    useEffect(() => {
        if (scanStatus === 'success') {
            const redirectTimer = setTimeout(() => {
                setCurrentPage('dashboard');
            }, 1500); // Wait 1.5s on success message before redirecting
            return () => clearTimeout(redirectTimer);
        }
    }, [scanStatus, setCurrentPage]);

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-white animate-fade-in-up">
            <header className="flex items-center p-4 bg-slate-800/50 flex-shrink-0">
                <button onClick={() => setCurrentPage('dashboard')} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold ml-4">Scan QR Code</h1>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <WebcamCapture isCameraOpen={true} />
                    <div className="absolute inset-0 border-8 border-white/20 rounded-2xl pointer-events-none"></div>
                    
                    {scanStatus === 'scanning' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                            <div className="absolute top-0 w-full h-1 bg-green-400 animate-scan-line shadow-lg"></div>
                        </div>
                    )}

                    {scanStatus === 'success' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 animate-fade-in-up">
                            <CheckCircleIcon className="w-16 h-16 text-white" />
                            <p className="mt-2 font-bold text-lg">Scan Successful!</p>
                        </div>
                    )}
                </div>
                <p className="mt-6 text-slate-300 max-w-xs">
                    {scanStatus === 'scanning' 
                        ? 'Align the QR code from the desktop within the frame.' 
                        : 'Redirecting you to the dashboard...'}
                </p>
            </main>
            {/* Component-specific animation styles */}
            <style>
                {`@keyframes scan-line {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(256px); } /* 256px = 64rem (w-64) */
                }
                .animate-scan-line {
                    animation: scan-line 2.5s infinite cubic-bezier(0.5, 0, 0.5, 1);
                    box-shadow: 0 0 15px 5px rgba(52, 211, 153, 0.5);
                }`}
            </style>
        </div>
    );
};

export default QRScannerPage;