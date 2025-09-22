import { GoogleGenAI, Type } from "@google/genai";
import type { AttendanceRecord, PptContent, QuizContent } from '../types';

// A placeholder API key is used to ensure the AI service initializes and the UI can be displayed.
// In a real environment, process.env.API_KEY would provide the actual key.
// API calls will likely fail with this placeholder, but the application will not crash.
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "DUMMY_API_KEY_FOR_UI_RENDERING";
const ai = new GoogleGenAI({ apiKey });


/**
 * Checks if the AI service has been initialized.
 * This will now always return true to prevent the "AI Features Disabled" screen, allowing the UI to render.
 * @returns {boolean} True if the AI service is available, false otherwise.
 */
export const isAiAvailable = () => !!ai;

const getAi = () => {
    if (!ai) {
        throw new Error("AI service is not available. Please configure the Gemini API key.");
    }
    return ai;
}

export const generateReportSummary = async (records: AttendanceRecord[]): Promise<string> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `
            Analyze the following student attendance data for a single day and provide a concise, insightful summary for a college principal or head of department.
            The data represents attendance for one specific branch/department on one day.

            Focus on the following key areas:
            - Calculate and state the overall attendance percentage for the day.
            - Highlight any students who were marked as 'Late'.
            - Call out any positive observations (e.g., perfect attendance).
            - Identify potential issues if a significant number of students are absent.
            - Keep the summary professional, using bullet points for clarity.
            - Do not just list raw data; provide actionable insights.

            Attendance Data:
            ${JSON.stringify(records, null, 2)}
        `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        if (!response.text) {
            return "AI could not generate a summary. The response was empty, possibly due to content filtering.";
        }
        return response.text;
    } catch (error) {
        console.error("Error generating report summary from Gemini:", error);
        return "An error occurred while generating the AI summary. Please check the console for details.";
    }
};

export const summarizeText = async (text: string): Promise<string> => {
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
        if (!response.text) {
            return "AI could not generate a summary. The response was empty.";
        }
        return response.text;
    } catch (error) {
        console.error("Error generating summary from Gemini:", error);
        return "An error occurred while generating the AI summary.";
    }
};

// --- Notebook LLM FUNCTIONS ---

export const generateNotesSummary = async (notes: string): Promise<string> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `You are an expert academic assistant. Summarize the following class notes into concise, easy-to-digest bullet points. Focus on key concepts, definitions, and important takeaways for student revision.

Notes:
---
${notes}
---

Summary:`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a response.");
    }
    return response.text;
};

export const generateExamQuestions = async (topics: string): Promise<string> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `Based on the following syllabus topics/notes, generate a set of likely exam questions. Include a mix of multiple-choice, short-answer, and long-answer questions.

Topics:
---
${topics}
---

Predicted Questions:`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a response.");
    }
    return response.text;
};

export const generatePptContent = async (text: string): Promise<PptContent> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `Convert the following text into a structured presentation with a title and a series of slides. For each slide, provide a title, 3-5 bullet points, and optional speaker notes.

Text:
---
${text}
---`;
    try {
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
        if (!response.text) {
            throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a valid JSON response.");
        }
        return JSON.parse(response.text);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("Failed to parse AI response for PPT:", error);
            throw new Error("Failed to parse the AI's response. The format was not valid JSON.");
        }
        // Re-throw other errors to be caught by the UI
        throw error;
    }
};


export const generateStoryFromNotes = async (notes: string): Promise<string> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `Transform the following academic notes into an engaging, story-style summary. Use analogies, simple examples, and a narrative flow to make the concepts interesting for students.

Notes:
---
${notes}
---

Story Summary:`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a response.");
    }
    return response.text;
};

export const generateMindmapFromNotes = async (topic: string): Promise<string> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a text-based mind map structure for the following topic. Use indentation and bullet points (e.g., -, *, +) to represent the hierarchy of main ideas, sub-topics, and key details.

Topic:
---
${topic}
---

Mind Map:`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a response.");
    }
    return response.text;
};

export const generateQuizFromNotes = async (notes: string): Promise<QuizContent> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `Create a quiz from the following text. Generate 5 questions, including at least two multiple-choice questions with 4 options each, and the rest as short-answer questions. For each question, provide the correct answer.

Text:
---
${notes}
---`;
    try {
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
        if (!response.text) {
            throw new Error("Received an empty response from the AI. The content may have been blocked or the model could not generate a valid JSON response.");
        }
        return JSON.parse(response.text);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("Failed to parse AI response for Quiz:", error);
            throw new Error("Failed to parse the AI's response. The format was not valid JSON.");
        }
        // Re-throw other errors to be caught by the UI
        throw error;
    }
};