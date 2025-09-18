import React, { useState } from 'react';
import { 
    LightbulbIcon, QuestionMarkCircleIcon, PresentationChartBarIcon, BookOpenIcon, 
    ShareIcon, BeakerIcon, ArrowLeftIcon, SparklesIcon, DownloadIcon 
} from './Icons';
import * as geminiService from '../services/geminiService';
import type { PptSlide, QuizQuestion } from '../types';

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

const Workspace: React.FC<{feature: Feature, onBack: () => void}> = ({ feature, onBack }) => {
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!inputText) return;
        setIsLoading(true);
        setError(null);
        setOutput(null);
        try {
            const result = await feature.generator(inputText);
            setOutput(result);
        } catch (err) {
            console.error(err);
            setError("An error occurred while generating the content. Please try again.");
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
                    <button onClick={handleGenerate} disabled={isLoading || !inputText} className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors">
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Output</h3>
                        {output && (
                             <button onClick={() => alert('Download initiated!')} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                <DownloadIcon className="w-4 h-4" /> Export
                            </button>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/70 rounded-lg min-h-[200px]">
                        {isLoading && <p>Generating, please wait...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {output && <OutputDisplay output={output} type={feature.outputType} />}
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
