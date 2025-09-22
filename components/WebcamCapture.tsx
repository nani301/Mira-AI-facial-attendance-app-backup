import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XCircleIcon } from './Icons';

export type CaptureState = 'AWAITING_CAMERA' | 'STREAMING' | 'NO_CAMERA';

interface WebcamCaptureProps {
    isCameraOpen: boolean;
    onCameraStateChange?: (state: CaptureState, error?: string | null) => void;
    onVideoReady?: (videoElement: HTMLVideoElement) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ isCameraOpen, onCameraStateChange, onVideoReady }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [captureState, setCaptureState] = useState<CaptureState>('AWAITING_CAMERA');
    const [cameraError, setCameraError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setCaptureState('AWAITING_CAMERA');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' } });
                streamRef.current = stream; 
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setCaptureState('STREAMING');
                        onCameraStateChange?.('STREAMING');
                        if (videoRef.current) {
                            onVideoReady?.(videoRef.current);
                        }
                    };
                }
            } catch (err: any) {
                console.error("Error accessing webcam:", err);
                const errorMessage = err.name === 'NotAllowedError'
                    ? 'Camera permission denied. Please allow camera access in your browser settings.'
                    : err.name === 'NotFoundError'
                    ? 'No camera found. Please ensure a camera is connected and enabled.'
                    : err.message || 'Could not access the camera.';
                setCameraError(errorMessage);
                setCaptureState('NO_CAMERA');
                onCameraStateChange?.('NO_CAMERA', errorMessage);
            }
        } else {
             const errorMessage = 'Your browser does not support camera access.';
             setCameraError(errorMessage);
             setCaptureState('NO_CAMERA');
             onCameraStateChange?.('NO_CAMERA', errorMessage);
        }
    }, [onCameraStateChange, onVideoReady]);
    
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (isCameraOpen) {
            startCamera();
        } else {
            stopCamera();
            setCaptureState('AWAITING_CAMERA');
        }
        return () => stopCamera();
    }, [isCameraOpen, startCamera, stopCamera]);


    if (!isCameraOpen) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full">
                <p className="text-slate-500 dark:text-slate-400">Camera is off</p>
            </div>
        );
    }
    
    if (captureState === 'NO_CAMERA') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 p-4 text-center rounded-full bg-slate-100 dark:bg-slate-700">
                <XCircleIcon className="w-12 h-12 text-amber-500"/>
                <p className="font-semibold text-sm mt-2">Camera Error</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-4">{cameraError}</p>
                <button onClick={startCamera} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Retry</button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-800">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
        </div>
    );
};

export default WebcamCapture;