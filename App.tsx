import React, { useState, useEffect } from 'react';
import { Sanda } from './components/Sanda';
import Button from './components/Button';
import AudioRecorder from './components/AudioRecorder';
import { 
  Subject, 
  Difficulty, 
  Exercise, 
  ExerciseType, 
  UserProgress, 
  GameState 
} from './types';
import * as GeminiService from './services/geminiService';
import { Star, Trophy, Volume2, ArrowRight, Home, Settings, Map } from 'lucide-react';

// --- Sub-Components for Views ---

const WelcomeView = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8">
    <h1 className="text-5xl font-bold text-sanda-secondary tracking-tight">Aprender com Alegria</h1>
    <div className="p-8 bg-white rounded-[3rem] shadow-xl border-4 border-sanda-primary">
        <Sanda size="lg" mood="happy" />
    </div>
    <p className="text-2xl text-gray-700 font-medium">Olá! Eu sou a Sanda.<br/>Vamos aprender juntos?</p>
    <Button size="lg" onClick={onStart} className="w-64 shadow-lg animate-bounce">
      Começar Aventura! 🚀
    </Button>
  </div>
);

const DiagnosticView = ({ onComplete }: { onComplete: (result: any) => void }) => {
  const [questions, setQuestions] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = await GeminiService.generateDiagnosticQuestions();
      setQuestions(q);
      setLoading(false);
      // Intro speech
      const buffer = await GeminiService.speakText("Olá! Vamos fazer um pequeno jogo para eu te conhecer melhor.");
      if(buffer) GeminiService.playAudioBuffer(buffer);
    };
    load();
  }, []);

  const handleAnswer = (answer: string) => {
    if (answer === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(c => c + 1);
    } else {
      onComplete({ score, total: questions.length });
    }
  };

  if (loading) return <div className="flex flex-col h-screen items-center justify-center"><Sanda mood="thinking" size="md"/><p className="mt-4 text-xl">A preparar o teste...</p></div>;

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen p-6 flex flex-col max-w-2xl mx-auto">
       <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div className="bg-sanda-secondary h-4 rounded-full transition-all duration-500" style={{ width: `${((currentIdx) / questions.length) * 100}%` }}></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-sanda-primary w-full text-center mb-8">
          <span className="text-4xl mb-4 block">{q.visualHint}</span>
          <h2 className="text-2xl font-bold text-gray-800">{q.question}</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full">
            {q.options?.map(opt => (
                <Button key={opt} variant="outline" size="lg" onClick={() => handleAnswer(opt)}>
                    {opt}
                </Button>
            ))}
        </div>
      </div>
      <div className="mt-auto text-center text-gray-500">Pergunta {currentIdx + 1} de {questions.length}</div>
    </div>
  );
};

const DashboardView = ({ progress, onSelectSubject }: { progress: UserProgress, onSelectSubject: (s: Subject) => void }) => {
    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full border-2 border-sanda-primary">
                        <Sanda size="sm" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{progress.name}</h2>
                        <div className="flex gap-1 text-sanda-primary">
                            {[...Array(5)].map((_,i) => <Star key={i} size={16} fill={i < Math.floor(progress.points / 100) ? "currentColor" : "none"} />)}
                        </div>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl font-bold text-sanda-secondary flex items-center gap-2 shadow-sm">
                    <Trophy size={20} />
                    {progress.points} pts
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <div 
                    onClick={() => onSelectSubject(Subject.PORTUGUESE)}
                    className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-blue-400 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">Português</h3>
                    <p className="text-gray-600 mb-4">Nível {progress.levelPort}</p>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-blue-400 h-3 rounded-full" style={{ width: `${(progress.levelPort / 3) * 100}%` }}></div>
                    </div>
                    <span className="text-4xl absolute bottom-4 right-4">🇦🇴</span>
                </div>

                <div 
                     onClick={() => onSelectSubject(Subject.MATH)}
                    className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-green-400 cursor-pointer hover:bg-green-50 transition-colors relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Matemática</h3>
                    <p className="text-gray-600 mb-4">Nível {progress.levelMath}</p>
                     <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-green-400 h-3 rounded-full" style={{ width: `${(progress.levelMath / 3) * 100}%` }}></div>
                    </div>
                     <span className="text-4xl absolute bottom-4 right-4">🧮</span>
                </div>
            </div>

            <div className="mt-8 bg-white/60 p-6 rounded-3xl">
                <h3 className="font-bold text-gray-700 mb-4">As tuas Medalhas</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {progress.badges.length === 0 ? <p className="text-gray-400 italic">Joga para ganhar medalhas!</p> : 
                        progress.badges.map(b => (
                            <div key={b} className="bg-white p-3 rounded-2xl shadow-sm flex flex-col items-center min-w-[100px]">
                                <span className="text-3xl mb-2">🎖️</span>
                                <span className="text-xs font-bold text-center">{b}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

const ExerciseView = ({ subject, level, onExit }: { subject: Subject, level: number, onExit: () => void }) => {
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{msg: string, type: 'success'|'error' | null} | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userInput, setUserInput] = useState('');

    const loadExercise = async () => {
        setLoading(true);
        setFeedback(null);
        setUserInput('');
        // Map level to difficulty
        const diff = level === 1 ? Difficulty.EASY : level === 2 ? Difficulty.MEDIUM : Difficulty.HARD;
        const ex = await GeminiService.generateExercise(subject, diff);
        setExercise(ex);
        setLoading(false);
        
        // Read question
        speak(ex.question);
    };

    useEffect(() => {
        loadExercise();
    }, []);

    const speak = async (text: string) => {
        setIsSpeaking(true);
        const buffer = await GeminiService.speakText(text);
        if(buffer) {
             GeminiService.playAudioBuffer(buffer);
        }
        // Reset speaking indicator after approx duration (simple timeout for UI effect)
        setTimeout(() => setIsSpeaking(false), (buffer?.duration || 2) * 1000);
    };

    const handleCheck = async () => {
        if(!exercise) return;
        
        let correct = false;
        let explanation = exercise.explanation;

        if(exercise.type === ExerciseType.MULTIPLE_CHOICE || exercise.type === ExerciseType.FILL_BLANK) {
             if(userInput.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim()){
                 correct = true;
             }
        } 
        
        // For this demo, let's focus on multiple choice/text input for simplicity in "Check"
        if(correct) {
            setFeedback({ msg: "Muito bem! Acertaste! 🎉", type: 'success' });
            await speak("Muito bem! Acertaste!");
        } else {
            setFeedback({ msg: `Ops! A resposta certa era: ${exercise.correctAnswer}. ${explanation}`, type: 'error' });
             await speak(`Ops! A resposta certa era ${exercise.correctAnswer}.`);
        }
    };

    const handleAudioResponse = async (base64: string) => {
        if(!exercise) return;
        setLoading(true);
        const result = await GeminiService.evaluateReading(base64, exercise.correctAnswer);
        setLoading(false);
        
        if(result.score > 70) {
            setFeedback({ msg: `Fantástico! ${result.feedback}`, type: 'success' });
             await speak(`Fantástico! ${result.feedback}`);
        } else {
             setFeedback({ msg: `Quase lá! ${result.feedback}`, type: 'error' });
             await speak(`Quase lá! ${result.feedback}`);
        }
    };

    if(loading) return <div className="flex h-screen flex-col items-center justify-center space-y-4"><Sanda mood="thinking" /><p className="animate-pulse font-bold text-sanda-primary">A preparar o desafio...</p></div>;

    if(!exercise) return <div onClick={onExit}>Erro. Tentar de novo.</div>;

    return (
        <div className="min-h-screen flex flex-col p-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onExit} className="bg-white p-2 rounded-full shadow-sm"><Home size={20}/></button>
                <div className="bg-sanda-primary px-4 py-1 rounded-full font-bold text-sm">
                    {subject === Subject.MATH ? 'Matemática' : 'Português'} - Nível {level}
                </div>
                <button onClick={() => speak(exercise.question)} className="bg-white p-2 rounded-full shadow-sm"><Volume2 size={20}/></button>
            </div>

            <div className="flex-1 flex flex-col items-center">
                <Sanda mood={feedback?.type === 'success' ? 'excited' : feedback?.type === 'error' ? 'thinking' : 'happy'} speaking={isSpeaking} />
                
                <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl border-b-8 border-gray-200 w-full text-center relative">
                     <span className="text-5xl block mb-4">{exercise.visualHint || '📝'}</span>
                     <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-relaxed">{exercise.question}</h2>

                     {/* Interaction Area */}
                     {exercise.type === ExerciseType.MULTIPLE_CHOICE && (
                         <div className="grid grid-cols-1 gap-3">
                             {exercise.options?.map(opt => (
                                 <Button 
                                    key={opt} 
                                    variant={userInput === opt ? 'primary' : 'outline'}
                                    onClick={() => setUserInput(opt)}
                                 >
                                     {opt}
                                 </Button>
                             ))}
                         </div>
                     )}

                     {exercise.type === ExerciseType.FILL_BLANK && (
                         <input 
                            type="text" 
                            className="w-full p-4 text-center text-2xl border-4 border-gray-200 rounded-2xl focus:border-sanda-primary outline-none"
                            placeholder="Escreve a resposta..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                         />
                     )}

                    {/* Placeholder for Reading type if we had it dynamically switched */}
                </div>
            </div>

            {/* Feedback Area or Action Button */}
            <div className="mt-6 mb-8">
                {feedback ? (
                    <div className={`p-6 rounded-2xl text-center mb-4 ${feedback.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-400' : 'bg-red-100 text-red-800 border-2 border-red-400'}`}>
                        <p className="text-xl font-bold mb-4">{feedback.msg}</p>
                        <Button onClick={loadExercise} variant="primary" className="w-full">
                            Próximo Desafio <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                ) : (
                     <Button onClick={handleCheck} disabled={!userInput} className="w-full shadow-xl py-4 text-xl">
                        Verificar Resposta ✨
                    </Button>
                )}
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<GameState['currentView']>('WELCOME');
  const [progress, setProgress] = useState<UserProgress>({
    name: 'Amigo',
    levelMath: 1,
    levelPort: 1,
    points: 0,
    badges: [],
    history: []
  });
  const [activeSubject, setActiveSubject] = useState<Subject | undefined>(undefined);

  const handleDiagnosticComplete = (res: {score: number, total: number}) => {
    // Simple placement logic
    const newLevel = res.score > res.total / 2 ? 2 : 1;
    setProgress(p => ({ ...p, levelMath: newLevel, levelPort: newLevel, points: 50 })); // Bonus points
    setView('DASHBOARD');
  };

  return (
    <div className="font-sans text-gray-800">
      {view === 'WELCOME' && <WelcomeView onStart={() => setView('DIAGNOSTIC')} />}
      {view === 'DIAGNOSTIC' && <DiagnosticView onComplete={handleDiagnosticComplete} />}
      {view === 'DASHBOARD' && (
        <DashboardView 
            progress={progress} 
            onSelectSubject={(s) => {
                setActiveSubject(s);
                setView('EXERCISE');
            }} 
        />
      )}
      {view === 'EXERCISE' && activeSubject && (
          <ExerciseView 
            subject={activeSubject} 
            level={activeSubject === Subject.MATH ? progress.levelMath : progress.levelPort}
            onExit={() => setView('DASHBOARD')}
          />
      )}
    </div>
  );
}