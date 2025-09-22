


import React, { useState } from 'react';
import { 
    LightbulbIcon, QuestionMarkCircleIcon, PresentationChartBarIcon, BookOpenIcon, 
    ShareIcon, BeakerIcon, ArrowLeftIcon, SparklesIcon, DownloadIcon, UploadIcon
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

const PptOutput: React.FC<{ content: { title: string, slides: PptSlide[] } }> = ({ content }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slide = content.slides[currentSlide];

    return (
        <div className="flex flex-col h-full">
            <h4 className="text-lg font-bold text-center mb-2">{content.title}</h4>
            <div className="flex-grow bg-white dark:bg-slate-800 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                <h5 className="font-bold text-indigo-600 dark:text-indigo-400">{slide.title}</h5>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    {slide.points.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
                {slide.notes && <p className="text-xs mt-4 p-2 bg-slate-100 dark:bg-slate-700 rounded italic">Notes: {slide.notes}</p>}
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
                <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="font-semibold disabled:opacity-50">&larr; Prev</button>
                <span>Slide {currentSlide + 1} of {content.slides.length}</span>
                <button onClick={() => setCurrentSlide(s => Math.min(content.slides.length - 1, s + 1))} disabled={currentSlide === content.slides.length - 1} className="font-semibold disabled:opacity-50">Next &rarr;</button>
            </div>
        </div>
    );
};

const QuizOutput: React.FC<{ content: { questions: QuizQuestion[] } }> = ({ content }) => {
    const [showAnswers, setShowAnswers] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Generated Quiz</h4>
                <button onClick={() => setShowAnswers(!showAnswers)} className="text-xs font-semibold text-indigo-600 hover:underline">
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
            </div>
            <div className="space-y-4 text-sm">
                {content.questions.map((q, i) => (
                    <div key={i} className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <p><strong>{i + 1}. {q.question}</strong></p>
                        {q.options && (
                            <ul className="list-alpha list-inside pl-2 mt-1 space-y-0.5" style={{ listStyleType: 'lower-alpha' }}>
                                {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                            </ul>
                        )}
                        {showAnswers && <p className="mt-1 text-green-600 dark:text-green-400 font-semibold">Answer: {q.answer}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};


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
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setOutput(null);
        setAccuracy(null);
        try {
            const result = await feature.generator(inputText);
            setOutput(result);
            // Simulate accuracy calculation
            setTimeout(() => setAccuracy(85 + Math.random() * 14), 500);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
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
                            <h4>Q${index + 1}: ${q.question}</h4>
                            ${q.options ? `<ul>${q.options.map((o: string) => `<li>${o}</li>`).join('')}</ul>` : ''}
                            <p class="answer">Answer: ${q.answer}</p>
                        </div>
                    `;
                });
            }
            htmlContent += `</body></html>`;
        
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.print();
            } else {
                alert('Could not open print window. Please disable your pop-up blocker.');
            }
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in-up">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg p-3">
                    {feature.icon}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{feature.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Input</h3>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={feature.prompt}
                        className="w-full h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-md resize-none bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                         <label className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 cursor-pointer">
                            <UploadIcon className="w-4 h-4" />
                            <span>{uploadedFile ? 'Change File' : 'Upload File'}</span>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !inputText.trim()}
                            className="w-full sm:w-auto font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                     {uploadedFile && (
                        <div className="mt-3 text-xs flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                            <span>{uploadedFile.name}</span>
                            <button onClick={handleDownloadUploaded} className="font-semibold text-indigo-600 hover:underline">Download</button>
                        </div>
                    )}
                </div>

                {/* Output Panel */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Output</h3>
                        {output && (
                             <div className="flex gap-2">
                                <button onClick={() => handleExport('csv')} className="flex items-center gap-1 text-xs font-semibold p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"><DownloadIcon className="w-4 h-4"/> CSV</button>
                                <button onClick={() => handleExport('pdf')} className="flex items-center gap-1 text-xs font-semibold p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"><DownloadIcon className="w-4 h-4"/> PDF</button>
                            </div>
                        )}
                    </div>
                    <div className="w-full h-96 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
                        {isLoading && <p className="text-slate-500 animate-pulse">Generating your content...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {output && feature.outputType === 'text' && <pre className="whitespace-pre-wrap text-sm">{output}</pre>}
                        {output && feature.outputType === 'mindmap' && <pre className="whitespace-pre-wrap text-sm font-mono">{output}</pre>}
                        {output && feature.outputType === 'ppt' && <PptOutput content={output} />}
                        {output && feature.outputType === 'quiz' && <QuizOutput content={output} />}
                        {!isLoading && !error && !output && <p className="text-slate-400">Your generated content will appear here.</p>}
                    </div>
                     {accuracy !== null && <AccuracyBar current={accuracy} previous={previousAccuracy} />}
                </div>
            </div>
        </div>
    );
};

const Notebook: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('hub');
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    const handleSelectFeature = (id: View) => {
        const feature = features.find(f => f.id === id);
        if (feature) {
            setSelectedFeature(feature);
            setCurrentView(id);
        }
    };

    const handleBackToHub = () => {
        setCurrentView('hub');
        setSelectedFeature(null);
    };

    if (currentView === 'hub' || !selectedFeature) {
        return (
            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <SparklesIcon className="w-12 h-12 text-indigo-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notebook LLM</h2>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Your AI-powered toolkit for smarter lesson planning and content creation.</p>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(feature => (
                        <FeatureCard key={feature.id} feature={feature} onSelect={handleSelectFeature} />
                    ))}
                </div>
            </div>
        );
    }

    return <Workspace feature={selectedFeature} onBack={handleBackToHub} />;
};
// FIX: Added default export to resolve lazy loading issue in App.tsx
export default Notebook;
