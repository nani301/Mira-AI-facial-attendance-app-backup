
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import type { FaceLandmarksDetector } from '@tensorflow-models/face-landmarks-detection';

// Create a context to hold the model
const ModelContext = createContext<FaceLandmarksDetector | null>(null);

// Create a provider component
export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [model, setModel] = useState<FaceLandmarksDetector | null>(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log("Preloading AI model...");
                await tf.setBackend('webgl');
                const loadedModel = await faceLandmarksDetection.createDetector(
                    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                    { runtime: 'tfjs', maxFaces: 1, refineLandmarks: true }
                );
                setModel(loadedModel);
                console.log("AI Model preloaded successfully.");
            } catch (e) {
                console.error("Failed to preload AI model:", e);
            }
        };

        loadModel();
    }, []);

    return React.createElement(ModelContext.Provider, { value: model }, children);
};

// Create a custom hook to use the model
export const useModel = () => {
    return useContext(ModelContext);
};
