
import { GoogleGenAI, Type } from "@google/genai";
import type { AttendanceRecord, PptContent, QuizContent } from '../types';

// IMPORTANT: This key is managed externally. Do not hardcode or expose it.
// It is assumed to be available in the environment variables.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Gemini API key not found in environment variables. AI features will be disabled.");
}

const getAi = () => {
    if (!ai) {
        throw new Error("AI service is not available. Please configure the Gemini API key.");
    }
    return ai;
}

/**
 * Simulates a 1-2 second processing delay to make AI generation feel more real.
 * @param action The async function to execute after the delay.
 */
const simulateAiProcessing = <T,>(action: () => Promise<T>): Promise<T> => {
    const delay = 1000 + Math.random() * 1000; // 1 to 2 seconds delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(action());
        }, delay);
    });
};


export const generateReportSummary = async (records: AttendanceRecord[]): Promise<string> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `
            Analyze the following employee attendance data and provide a concise, insightful summary for a manager. 
            Focus on trends, potential issues, and positive call-outs.
            - Identify any employees with consistent tardiness.
            - Note the overall attendance rate.
            - Mention any patterns you observe (e.g., certain days having more absences).
            - Keep the summary professional and to the point.
            - Do not just list the data, provide actionable insights.

            Data:
            ${JSON.stringify(records, null, 2)}
        `;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating report summary from Gemini:", error);
            return "An error occurred while generating the AI summary. Please check the console for details.";
        }
    });
};

export const summarizeText = async (text: string): Promise<string> => {
     return simulateAiProcessing(async () => {
        const ai = getAi();
        if (!text || text.trim().length < 20) {
            return "Please provide more text to summarize.";
        }

        const model = 'gemini-2.5-flash';
        const prompt = `Summarize the following text into a few key bullet points. Be concise and clear.

Text to summarize:
---
${text}
---
`;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating summary from Gemini:", error);
            return "An error occurred while generating the AI summary.";
        }
    });
};

// --- Notebook LLM FUNCTIONS ---

export const generateNotesSummary = async (notes: string): Promise<string> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `You are an expert academic assistant. Summarize the following class notes into concise, easy-to-digest bullet points. Focus on key concepts, definitions, and important takeaways for student revision.

Notes:
---
${notes}
---

Summary:`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    });
};

export const generateExamQuestions = async (topics: string): Promise<string> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `Based on the following syllabus topics/notes, generate a set of likely exam questions. Include a mix of multiple-choice, short-answer, and long-answer questions.

Topics:
---
${topics}
---

Predicted Questions:`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    });
};

export const generatePptContent = async (text: string): Promise<PptContent> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `Convert the following text into a structured presentation with a title and a series of slides. For each slide, provide a title, 3-5 bullet points, and optional speaker notes.

Text:
---
${text}
---`;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        slides: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    points: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    notes: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    });
};


export const generateStoryFromNotes = async (notes: string): Promise<string> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `Transform the following academic notes into an engaging, story-style summary. Use analogies, simple examples, and a narrative flow to make the concepts interesting for students.

Notes:
---
${notes}
---

Story Summary:`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    });
};

export const generateMindmapFromNotes = async (topic: string): Promise<string> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `Generate a text-based mind map structure for the following topic. Use indentation and bullet points (e.g., -, *, +) to represent the hierarchy of main ideas, sub-topics, and key details.

Topic:
---
${topic}
---

Mind Map:`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    });
};

export const generateQuizFromNotes = async (notes: string): Promise<QuizContent> => {
    return simulateAiProcessing(async () => {
        const ai = getAi();
        const model = 'gemini-2.5-flash';
        const prompt = `Create a quiz from the following text. Generate 5 questions, including at least two multiple-choice questions with 4 options each, and the rest as short-answer questions. For each question, provide the correct answer.

Text:
---
${notes}
---`;
         const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: 'e.g., "multiple-choice" or "short-answer"' },
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    answer: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    });
};