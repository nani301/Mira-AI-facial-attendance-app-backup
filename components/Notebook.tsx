

import React, { useState } from 'react';
import { 
    LightbulbIcon, QuestionMarkCircleIcon, PresentationChartBarIcon, BookOpenIcon, 
    ShareIcon, BeakerIcon, ArrowLeftIcon, SparklesIcon, DownloadIcon 
} from './Icons.tsx';
import * as geminiService from '../services/geminiService.ts';
import type { PptSlide, QuizQuestion } from '../types.ts';

type View = 'hub' | 'summary' | 'exam' | 'ppt' | 'story' | 'mindmap' | 'quiz';

interface Feature {
    id: View;
    title: string;
    description: string;
    icon: React.ReactNode;
    prompt: string;
    generator: (text: string) => Promise<any>;
    outputType: 'text' | 'ppt' | 'quiz' | 'mindmap';
}

const features: Feature[] = [
    { id: 'summary', title: 'Smart Notes Summary', description: 'Get concise bullet summaries optimized for quick revision.', icon: <LightbulbIcon className="w-8 h-8"/>, prompt: "Paste your class notes here...", generator: geminiService.generateNotesSummary, outputType: 'text' },
    { id: 'exam', title: 'Exam Question Generator', description: 'Predict likely exam questions based on past patterns and syllabus weightage.', icon: <QuestionMarkCircleIcon className="w-8 h-8"/>, prompt: "Enter syllabus topics or upload notes...", generator: geminiService.generateExamQuestions, outputType: 'text' },
    { id: 'ppt', title: 'Engaging PPT Generator', description: 'Auto-generate well-designed PPT slides from your notes or text.', icon: <PresentationChartBarIcon className="w-8 h-8"/>, prompt: "Paste the content for your presentation...", generator: geminiService.generatePptContent, outputType: 'ppt' },
    { id: 'story', title: 'Story-style Summary', description: 'Turn dry notes into a classroom-ready narrative with examples.', icon: <BookOpenIcon className="w-8 h-8"/>, prompt: "Enter the notes you want to turn into a story...", generator: geminiService.generateStoryFromNotes, outputType: 'text' },
    { id: 'mindmap', title: 'Concept Reinforcer', description: 'Create visual mind maps or flashcards linked to your notes.', icon: <ShareIcon className="w-8 h-8"/>, prompt: "Enter a topic to generate a mindmap structure...", generator: geminiService.generateMindmapFromNotes, outputType: 'mindmap' },
    { id: 'quiz', title: 'Adaptive Quiz Maker', description: 'Generate MCQs and short-answer questions with marking schemes.', icon: <BeakerIcon className="w-8 h-8"/>, prompt: "Paste text to generate a quiz from...", generator: geminiService.generateQuizFromNotes, outputType: 'quiz' },
];

const FeatureCard: React.FC<{feature: Feature, onSelect: (id: View) => void}> = ({ feature, onSelect }) => (
    <div onClick={() => onSelect(feature.id)} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-indigo-500/20 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 cursor-pointer group flex flex-col items-start">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg p-3">
            {feature.icon}
        </div>
        <h3 className="text-lg font-bold mt-4 text-slate-800 dark:text-slate-100">{feature.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex-grow">{feature.description}</p>
        <span className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">Use Tool &rarr;</span>
    </div>
);

const AccuracyBar: React.FC<{ current: number; previous: number }> = ({ current, previous }) => (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Generation Accuracy</h4>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
            <div
                className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${current}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-semibold text-white text-sm">
                {current.toFixed(1)}%
            </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
            Compared to previous run: {previous.toFixed(1)}%
        </p>
    </div>
);


const Workspace: React.FC<{feature: Feature, onBack: () => void}> = ({ feature, onBack }) => {
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [previousAccuracy] = useState(75 + Math.random() * 20); // Mock previous accuracy

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            if (file.type.startsWith("text/")) {
                const text = await file.text();
                setInputText(text);
            } else {
                 setInputText(`File uploaded: ${file.name}\n\n(File content will be processed upon generation)`);
            }
        }
    };
    
    const handleDownloadUploaded = () => {
        if (!uploadedFile) return;
        const url = URL.createObjectURL(uploadedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = uploadedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        if (!output) return;
    
        const filename = `${feature.title.replace(/\s+/g, '_')}_output`;
    
        if (format === 'csv') {
            let csvContent = '';
            
            const escapeCsv = (field: any): string => {
                if (field === null || field === undefined) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
    
            if (feature.outputType === 'text' || feature.outputType === 'mindmap') {
                csvContent = escapeCsv(output);
            } else if (feature.outputType === 'ppt') {
                const header = ['slide_number', 'slide_title', 'point_number', 'point_text', 'speaker_notes'];
                csvContent += header.join(',') + '\n';
                (output.slides as PptSlide[]).forEach((slide, slideIndex) => {
                    slide.points.forEach((point, pointIndex) => {
                        const row = [
                            slideIndex + 1,
                            escapeCsv(slide.title),
                            pointIndex + 1,
                            escapeCsv(point),
                            escapeCsv(slide.notes || '')
                        ];
                        csvContent += row.join(',') + '\n';
                    });
                });
            } else if (feature.outputType === 'quiz') {
                const header = ['question_number', 'type', 'question', 'options', 'answer'];
                csvContent += header.join(',') + '\n';
                (output.questions as QuizQuestion[]).forEach((q, index) => {
                    const row = [
                        index + 1,
                        escapeCsv(q.type),
                        escapeCsv(q.question),
                        escapeCsv(q.options?.join('; ') || ''),
                        escapeCsv(q.answer)
                    ];
                    csvContent += row.join(',') + '\n';
                });
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
    
        } else if (format === 'pdf') {
            let htmlContent = `
                <html>
                <head>
                    <title>${feature.title}</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.5; }
                        h1 { color: #333; }
                        h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 5px; }
                        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
                        .quiz-item, .slide { border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
                        .answer { font-weight: bold; color: green; }
                    </style>
                </head>
                <body>
                    <h1>${feature.title}</h1>
            `;
    
            if (feature.outputType === 'text') {
                htmlContent += `<p>${output.replace(/\n/g, '<br/>')}</p>`;
            } else if (feature.outputType === 'mindmap') {
                htmlContent += `<pre>${output}</pre>`;
            } else if (feature.outputType === 'ppt') {
                (output.slides as PptSlide[]).forEach((slide, index) => {
                    htmlContent += `
                        <div class="slide">
                            <h2>Slide ${index + 1}: ${slide.title}</h2>
                            <ul>
                                ${slide.points.map((p: string) => `<li>${p}</li>`).join('')}
                            </ul>
                            ${slide.notes ? `<p><strong>Notes:</strong> ${slide.notes}</p>` : ''}
                        </div>
                    `;
                });
            } else if (feature.outputType === 'quiz') {
                (output.questions as QuizQuestion[]).forEach((q, index) => {
                    htmlContent += `
                        <div class="quiz-item">
                            <p><strong>${index + 1}. ${q.question}</strong> (${q.type})</p>
                            ${q.options ? `<ul>${q.options.map((opt: string) => `<li>${opt}</li>`).join('')}</ul>` : ''}
                            <p class="answer">Answer: ${q.answer}</p>
                        </div>
                    `;
                });
            }
    
            htmlContent += '</body></html>';
            
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            } else {
                alert('Could not open print window. Please disable your pop-up blocker and try again.');
            }
        }
    };
    
     const handleShare = async () => {
        if (!output) return;

        let shareText = `Notebook LLM Output: ${feature.title}\n\n`;

        if (feature.outputType === 'text' || feature.outputType === 'mindmap') {
            shareText += output;
        } else if (feature.outputType === 'ppt') {
            (output.slides as PptSlide[]).forEach((slide, slideIndex) => {
                shareText += `Slide ${slideIndex + 1}: ${slide.title}\n`;
                slide.points.forEach((point) => {
                    shareText += `- ${point}\n`;
                });
                if (slide.notes) {
                    shareText += `Notes: ${slide.notes}\n`;
                }
                shareText += '\n';
            });
        } else if (feature.outputType === 'quiz') {
            (output.questions as QuizQuestion[]).forEach((q, index) => {
                shareText += `${index + 1}. ${q.question} (${q.type})\n`;
                if (q.options) {
                    shareText += q.options.join('\n');
                    shareText += '\n';
                }
                shareText += `Answer: ${q.answer}\n\n`;
            });
        }

        const shareData = {
            title: feature.title,
            text: shareText,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            alert("Share feature is not supported on your browser.");
        }
    };

    const handleGenerate = async () => {
        if (!inputText) return;
        setIsLoading(true);
        setError(null);
        setOutput(null);
        setAccuracy(null);
        try {
            const result = await feature.generator(inputText);
            setOutput(result);
            // Simulate new accuracy based on previous
            const newAccuracy = Math.max(0, Math.min(100, previousAccuracy + (Math.random() * 10 - 4)));
            setAccuracy(newAccuracy);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while generating the content. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-md">{feature.icon}</div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{feature.title}</h2>
                </div>
            </header>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700">
                <div className="bg-white dark:bg-slate-800 p-6 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">Input</h3>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={feature.prompt}
                        className="w-full flex-grow p-4 text-base bg-slate-100 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Or upload a file (text, pdf, images)</label>
                        <div className="flex items-center gap-2">
                             <input type="file" onChange={handleFileChange} accept="image/*,application/pdf,.txt" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            {uploadedFile && (
                                <button onClick={handleDownloadUploaded} title="Download uploaded file" className="text-sm font-semibold p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                                    <DownloadIcon className="w-5 h-5"/>
                                </button>
                            )}
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading || !inputText} className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors">
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Output</h3>
                        {output && (
                             <div className="flex items-center gap-2">
                                <button onClick={() => handleExport('csv')} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <DownloadIcon className="w-4 h-4" /> CSV
                                </button>
                                <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <DownloadIcon className="w-4 h-4" /> PDF
                                </button>
                                <button onClick={handleShare} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <ShareIcon className="w-4 h-4" /> Share
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/70 rounded-lg flex-grow overflow-y-auto">
                        {isLoading && <p className="text-center text-slate-500">Generating, please wait...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!isLoading && !output && <p className="text-center text-slate-500">Output will appear here.</p>}
                        {output && <OutputDisplay output={output} type={feature.outputType} />}
                        {output && accuracy && (
                            <AccuracyBar current={accuracy} previous={previousAccuracy} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OutputDisplay: React.FC<{output: any, type: Feature['outputType']}> = ({ output, type }) => {
    switch(type) {
        case 'text':
            return <p className="whitespace-pre-wrap">{output}</p>;
        case 'mindmap':
             return <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>;
        case 'ppt':
            return (
                <div className="space-y-4">
                    {(output.slides as PptSlide[]).map((slide, index) => (
                        <div key={index} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-500">SLIDE {index + 1}</p>
                            <h4 className="font-bold text-lg">{slide.title}</h4>
                            <ul className="list-disc list-inside text-sm mt-2">
                                {slide.points.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                            {slide.notes && <p className="text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500">Notes: {slide.notes}</p>}
                        </div>
                    ))}
                </div>
            );
        case 'quiz':
            return (
                 <div className="space-y-4">
                    {(output.questions as QuizQuestion[]).map((q, index) => (
                        <div key={index} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg">
                           <p className="font-semibold">{index + 1}. {q.question}</p>
                           {q.options && (
                                <ul className="text-sm space-y-1 mt-2">
                                   {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                                </ul>
                           )}
                           <p className="text-sm mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-green-600 dark:text-green-400 font-bold">Answer: {q.answer}</p>
                        </div>
                    ))}
                </div>
            );
        default: return <p>Unsupported output type</p>;
    }
};

const Notebook: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('hub');
    const isGeminiConfigured = geminiService.isAiAvailable();
    
    if (!isGeminiConfigured) {
        return (
            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden p-8 flex flex-col items-center justify-center text-center">
                 <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                 </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AI Features Disabled</h1>
                 <p className="mt-2 max-w-lg text-slate-600 dark:text-slate-400">
                    The Gemini API key has not been configured for this application. Please contact your administrator to enable AI-powered notebook features.
                </p>
            </div>
        );
    }
    
    const activeFeature = features.find(f => f.id === activeView);

    return (
        <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            {activeView === 'hub' ? (
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Notebook LLM for Teachers</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Your toolkit for smarter lesson planning, assessment creation, and student engagement.</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(feature => (
                           <FeatureCard key={feature.id} feature={feature} onSelect={setActiveView} />
                        ))}
                    </div>
                </div>
            ) : activeFeature ? (
                <Workspace feature={activeFeature} onBack={() => setActiveView('hub')} />
            ) : null}
        </div>
    );
};

export default Notebook;