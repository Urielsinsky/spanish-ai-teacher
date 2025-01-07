'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Book,
  GraduationCap,
  MessageCircle,
  Star,
  Mic,
  MicOff
} from 'lucide-react';
import { useConversation } from '@11labs/react';
import Image from 'next/image';

// Types
type StepIcon = typeof MessageCircle | typeof Book | typeof Mic;
type AudioContextType = typeof AudioContext | typeof webkitAudioContext;

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Utils
const isClient = typeof window !== 'undefined';
const getLocalStorage = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};
const setLocalStorage = (key: string, value: string): void => {
  if (!isClient) return;
  localStorage.setItem(key, value);
};

// ================== Tutorial Overlay ==================
interface TutorialOverlayProps {
  onComplete: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  const steps: { title: string; desc: string; icon: StepIcon }[] = [
    {
      title: "Welcome to Spanish AI Teacher!",
      desc: "Let's get you ready for your first conversation in just 3 quick steps.",
      icon: MessageCircle
    },
    {
      title: "Choose Your Teacher",
      desc: "Select the teacher that matches your level. Each has a unique teaching style and language mix.",
      icon: Book
    },
    {
      title: "Start Speaking",
      desc: "Click 'Start Conversation' and begin practicing. Your teacher will guide you through a 5-minute session.",
      icon: Mic
    }
  ];

  const handleComplete = () => {
    setLocalStorage('hasSeenTutorial', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4">
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-2 w-12 rounded-full transition-colors ${
                  num <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {(() => {
                const Icon = steps[step - 1].icon;
                return <Icon className="h-12 w-12 text-blue-500" />;
              })()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {steps[step-1].title}
            </h3>
            <p className="text-gray-600">
              {steps[step-1].desc}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== Conversation Modal ==================
interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAIActive: boolean;
  isUserTurn: boolean;
  audioLevel: number;
  speakingIndicator: string;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
  isAIActive,
  isUserTurn,
  audioLevel,
  speakingIndicator
}) => {
  const [bars, setBars] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isOpen && isAIActive) {
      interval = setInterval(() => {
        setBars(prev =>
          prev.map(() => Math.floor(Math.random() * 100))
        );
      }, 500);
    } else {
      setBars([0, 0, 0, 0, 0]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isAIActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient opacity-90"></div>
      
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Active Conversation
          </h2>

          {isUserTurn ? (
            <div className="text-green-600 font-semibold text-lg">
              Your turn!
            </div>
          ) : (
            <div className="text-blue-600 font-semibold text-lg">
              AI Speaking
            </div>
          )}

          <p className="text-sm text-gray-700 mt-2">{speakingIndicator}</p>

          <div className="mt-4 flex flex-col items-center gap-4">
            {!isUserTurn && (
              <div className="flex items-end gap-1 h-20">
                {bars.map((barHeight, idx) => (
                  <div
                    key={idx}
                    className="w-2 bg-blue-600 transition-all duration-300"
                    style={{ height: `${barHeight}%` }}
                  />
                ))}
              </div>
            )}

            {isUserTurn && (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-40 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-100"
                    style={{ width: `${(audioLevel / 255) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-700">
                  {audioLevel > 50 ? 'Good volume level' : 'Speak a bit louder'}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
          >
            End Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

// ================== MAIN PAGE ==================
export default function Home() {
  // Form data
  const [userName, setUserName] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userLessons, setUserLessons] = useState('0'); // <--- Sí lo usamos en el input

  // Main states
  const [teacher, setTeacher] = useState('beginner');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTurn, setIsTurn] = useState(false);
  const [speakingIndicator, setSpeakingIndicator] = useState('');
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);

  // Agent IDs
  const AGENTS = {
    beginner: 'Y0A6rPDkYAA6wRz9KcVe',
    intermediate: 'trEuMFO03pxC68JCeYyk',
    advanced: 'pTQke6LmuVUUHJgv9Kfa'
  };

  // Tutorial check
  useEffect(() => {
    if (isClient) {
      const tutorialSeen = getLocalStorage('hasSeenTutorial');
      setHasSeenTutorial(!!tutorialSeen);
    }
  }, []);

  // Conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setIsTurn(true);
      setSpeakingIndicator('Ready to start! You can speak now.');
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsActive(false);
      setIsTurn(false);
      setSpeakingIndicator('');
      setShowConversationModal(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
      const isAIResponse = message.type === 'agent_response';
      setIsTurn(!isAIResponse);
      setSpeakingIndicator(
        isAIResponse ? 'Teacher speaking...' : 'Your turn to speak!'
      );
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsActive(false);
      setIsTurn(false);
      setSpeakingIndicator('');
      setShowConversationModal(false);
      if (isClient) {
        alert('The conversation ended unexpectedly. You can start a new one!');
      }
    }
  });

  // Audio monitoring
  useEffect(() => {
    if (!isClient || !isActive || !isTurn) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = (window.AudioContext || window.webkitAudioContext) as AudioContextType;
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateLevel = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          
          if (isActive && isTurn) {
            requestAnimationFrame(updateLevel);
          }
        };
        
        updateLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive, isTurn]);

  // Handle Stop
  const handleStop = useCallback(async () => {
    try {
      setIsActive(false);
      setIsTurn(false);
      setSpeakingIndicator('');
      setShowConversationModal(false);

      if (conversation.status === 'connected') {
        await conversation.endSession();
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
      setIsActive(false);
      setIsTurn(false);
      setSpeakingIndicator('');
      setShowConversationModal(false);
    }
  }, [conversation]);

  // Timer with handleStop in dependencies
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isActive, timeLeft, handleStop]);

  // Teachers data
  const teachers = [
    { 
      id: 'beginner',
      name: 'Professor Sarah',
      levels: 'A1-A2 Levels',
      desc: 'Bilingual Expert',
      longDesc: 'Native Spanish speaker with perfect English. Specializes in helping beginners start their Spanish journey. Uses 80% English for instructions.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah&backgroundColor=b6e3f4'
    },
    { 
      id: 'intermediate',
      name: 'Profesor Carlos',
      levels: 'B1-B2 Levels',
      desc: 'Conversation Specialist',
      longDesc: 'Native Spanish speaker focusing on conversational skills. Classes are 70% in Spanish with basic English support when needed.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Carlos&backgroundColor=c1f4b6'
    },
    { 
      id: 'advanced',
      name: 'Profesor Pedro',
      levels: 'C1-C2 Levels',
      desc: 'Advanced Spanish Expert',
      longDesc: 'Native Spanish speaker specialized in advanced topics. Classes are 100% in Spanish, focusing on cultural nuances and complex conversations.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pedro&backgroundColor=f4d03f'
    }
  ];

  // Handlers
  const handleStart = useCallback(async () => {
    if (!isClient) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const systemPrompt = `
        El usuario se llama ${userName}.
        Su nivel es ${userLevel}.
        Ha tomado ${userLessons} clases previas.
        Se encuentra en ${userLocation}.
        Por favor, salúdalo en español y usa su nombre.
        Ajusta la complejidad del vocabulario a nivel ${userLevel}.
      `;
      const firstMessage = `
        ¡Hola, ${userName}!
        ¿Listo para practicar tu español hoy?
        He notado que tu nivel es ${userLevel}.
        ¿Quieres practicar vocabulario de comida o de viajes?
      `;

      await conversation.startSession({
        agentId: AGENTS[teacher],
        overrides: {
          agent: {
            prompt: { prompt: systemPrompt },
            firstMessage
          }
        }
      });

      setIsActive(true);
      setIsTurn(true);
      setSpeakingIndicator('Ready to start! You can speak now.');
      setShowConversationModal(true);

    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please make sure your microphone is connected and you have granted permission.');
      setIsActive(false);
      setIsTurn(false);
      setSpeakingIndicator('');
    }
  }, [
    conversation,
    teacher,
    userName,
    userLevel,
    userLocation,
    userLessons,
    AGENTS // agregado para evitar el warning
  ]);

  const isAIActive = isActive && !isTurn;

  return (
    <>
      {!hasSeenTutorial && (
        <TutorialOverlay onComplete={() => setHasSeenTutorial(true)} />
      )}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Spanish AI Teacher
            </h1>
            <p className="text-gray-700">
              5 minutes of practice daily - Make every minute count!
            </p>
          </div>

          {/* Time Remaining */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" />
                <span className="text-gray-800">Daily Time Remaining</span>
              </div>
              <span className="font-bold text-blue-700">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* User Data Form */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Name:
                </label>
                <input
                  type="text"
                  placeholder="E.g. John"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border rounded p-2"
                  disabled={isActive}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Level (A1, A2, B1, etc.):
                </label>
                <input
                  type="text"
                  placeholder="E.g. A2"
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  className="border rounded p-2"
                  disabled={isActive}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Location:
                </label>
                <input
                  type="text"
                  placeholder="E.g. New York"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="border rounded p-2"
                  disabled={isActive}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Previous Classes:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={userLessons}
                  onChange={(e) => setUserLessons(e.target.value)}
                  className="border rounded p-2"
                  disabled={isActive}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-700" />
              Select Your Teacher & Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teachers.map((teach) => (
                <button
                  key={teach.id}
                  onClick={() => !isActive && setTeacher(teach.id)}
                  disabled={isActive}
                  className={`p-4 rounded-lg border-2 text-left transition
                    ${teacher === teach.id 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-green-200'}
                    ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-4 mb-3">
                    <Image
                      src={teach.image}
                      alt={teach.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{teach.name}</div>
                      <div className="text-sm font-medium text-blue-600">{teach.levels}</div>
                      <div className="text-sm text-gray-600 mt-1">{teach.desc}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 border-t pt-3">
                    {teach.longDesc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start/Stop Button */}
          <div className="space-y-4">
            <button
              onClick={isActive ? handleStop : handleStart}
              className={`w-full py-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl
                ${isActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'}`}
            >
              <div className="flex items-center justify-center gap-2">
                {isActive ? (
                  <>
                    <MicOff className="animate-pulse" />
                    End Conversation
                  </>
                ) : (
                  <>
                    <Mic className="animate-bounce" />
                    Start Conversation
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Conversation Modal */}
      <ConversationModal
        isOpen={showConversationModal}
        onClose={handleStop}
        isAIActive={isAIActive}
        isUserTurn={isTurn}
        audioLevel={audioLevel}
        speakingIndicator={speakingIndicator}
      />
    </>
  );
}
