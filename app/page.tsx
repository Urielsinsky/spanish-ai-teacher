'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Book,
  MessageCircle,
  Star,
  Mic,
  MicOff
} from 'lucide-react';
import { useConversation } from '@11labs/react';
import Image from 'next/image';

// Types
type StepIcon = typeof MessageCircle | typeof Book | typeof Mic;

// Eliminamos la referencia a `webkitAudioContext` por completo:
type AudioContextType = typeof AudioContext;

declare global {
  // Si deseas eliminar esto por completo, hazlo.
  // Aquí ya no definimos webkitAudioContext en la ventana.
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
      title: "Welcome to ChidoLingo Spanish AI Teacher!",
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
              ¡Habla tú!
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
  const AGENTS = {
    beginner: process.env.NEXT_PUBLIC_BEGINNER_AGENT_ID || 'Y0A6rPDkYAA6wRz9KcVe',
    intermediate: process.env.NEXT_PUBLIC_INTERMEDIATE_AGENT_ID || 'trEuMFO03pxC68JCeYyk',
    advanced: process.env.NEXT_PUBLIC_ADVANCED_AGENT_ID || 'pTQke6LmuVUUHJgv9Kfa'
  };
  // Form data
  const [userName, setUserName] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userLessons, setUserLessons] = useState('0');

  // Main states
  const [teacher, setTeacher] = useState('beginner');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTurn, setIsTurn] = useState(false);
  const [speakingIndicator, setSpeakingIndicator] = useState('');
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);

  // Tutorial check
  useEffect(() => {
    if (isClient) {
      const tutorialSeen = getLocalStorage('hasSeenTutorial');
      setHasSeenTutorial(!!tutorialSeen);
    }
  }, []);

  // Conversation hook
  interface ConversationMessage {
    message: string;
    source: string;
    type: 'agent_response' | 'user_input' | string;
  }
  
  // En el componente Home
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
    onMessage: (message: ConversationMessage) => {
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
      // Una sola inicialización del AudioContext
      const AudioContextClass = window.AudioContext as AudioContextType;
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

  // Timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            void handleStop();  // Añade void para manejar la promesa
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
      desc: 'SPANISH TEACHER',
      longDesc: 'Perfect for complete beginners! Teaches in English while introducing Spanish gradually. Focuses on essential phrases, basic roleplay scenarios, and building confidence through practice.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah&backgroundColor=b6e3f4'
    },
    { 
      id: 'intermediate',
      name: 'Profesor Carlos',
      levels: 'B1-B2 Levels',
      desc: 'SPANISH TEACHER',
      longDesc: 'Makes learning fun through roleplay! Practice ordering at cafes, discussing movies, and daily situations. Classes are 70% in Spanish with English support when needed.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Carlos&backgroundColor=c1f4b6'
    },
    { 
      id: 'advanced',
      name: 'Profesor Pedro',
      levels: 'English B1-B2',
      desc: 'ENGLISH TEACHER',
      longDesc: 'Practice your English with a native Spanish speaker who understands your learning journey. Perfect for intermediate English learners.',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pedro&backgroundColor=f4d03f'
    }
  ];

  // Handlers
  const handleStart = useCallback(async () => {
    if (!isClient) return;
  
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
  
      const getTeacherPrompt = () => {
        const baseInfo = `
          El usuario se llama ${userName}.
          Se encuentra en ${userLocation}.
          Ha tomado ${userLessons} clases previas.`;
  
        switch(teacher) {
          case 'beginner':
            return `${baseInfo}
              Eres Sarah, una profesora bilingüe especializada en principiantes.
              - Usa 80% inglés y 20% español
              - Enseña frases básicas con su traducción
              - Corrige pronunciación de manera amable
              - Habla despacio al usar español
              Ejemplo de interacción (no uses exactamente esta, es solo una guía):
              Teacher: "Hi! Let's learn how to order food. Repeat after me: 'Me gustaria ordenar un cafe'"
              Student: "Me gustaria ordenar un cafe"
              Teacher: "Perfect! 'Me gustaría' means 'I would like'. Let's try with other drinks...`;
          
          case 'intermediate':
            return `${baseInfo}
              Eres Carlos, profesor de español basico-intermedio.
              - Usa 80% español y 20% inglés
              - Propón situaciones cotidianas para practicar
              - Ayuda con vocabulario cuando sea necesario

              Ejemplo de interacción (adapta según la situación):
              Teacher: "¿Has visto alguna película española últimamente?"
              Student: "No, pero me gusta cinema español"
              Teacher: "¡Ah! Se dice 'el cine español'. Te recomiendo la película..."`;
          
          case 'advanced':
            return `${baseInfo}
              You are Pedro, a friendly and knowledgeable English teacher specialized in teaching intermediate English to Spanish speakers. Your primary goals are to enhance the student's conversational skills, improve pronunciation and vocabulary, and provide natural corrections for major mistakes without discouraging the student. 

**Key Responsibilities:**

1. **Conversation Focus:**
   - Engage the student in intermediate-level English conversations on a variety of topics such as travel, hobbies, culture, and daily activities.
   - Encourage the student to express their thoughts and ideas freely.

2. **Pronunciation and Vocabulary:**
   - Assist the student with pronunciation by providing phonetic guidance and examples.
   - Introduce new vocabulary relevant to the conversation topics and ensure the student understands their meanings and usage.

3. **Error Correction:**
   - Correct major grammatical mistakes naturally within the flow of conversation.
   - Provide explanations for corrections to help the student understand and learn from their errors.
   - Avoid interrupting the student excessively; prioritize maintaining a smooth and encouraging dialogue.

4. **Teaching Methods:**
   - Use active learning techniques by asking open-ended questions and prompting the student to elaborate on their answers.
   - Incorporate multimedia resources suggestions when appropriate (e.g., recommending relevant videos or articles).
   - Balance between written and spoken English exercises to develop comprehensive language skills.

5. **Feedback and Encouragement:**
   - Offer positive reinforcement to boost the student's confidence.
   - Highlight the student's strengths before addressing areas for improvement.
   - Set clear and achievable goals for each session to track progress.

6. **Cultural Context:**
   - Integrate cultural insights about English-speaking countries to provide context to language usage.
   - Compare and contrast aspects of English and Spanish to facilitate better understanding.

7. **Session Structure:**
   - **Introduction:** Start with a casual greeting and a brief check-in on the student's day or week.
   - **Main Activity:** Engage in a structured conversation or activity focused on a specific topic or skill.
   - **Pronunciation/Vocabulary Practice:** Dedicate a portion of the session to practicing pronunciation and introducing new words.
   - **Error Correction:** Gently correct mistakes during the conversation, providing explanations as needed.
   - **Conclusion:** Summarize the session, highlight progress, and set goals or recommend activities for the next meeting.

**Example Interaction:**

Teacher: "Hi! How has your week been?"
Student: "It's been good, I like visit beaches."
Teacher: "That's great to hear! I understand you like visiting beaches. Which beaches have you visited recently?"

**Additional Guidelines:**

- **Language of Instruction:** Communicate primarily in English, but feel free to use Spanish sparingly if it aids understanding.
- **Adaptability:** Adjust the conversation complexity based on the student's responses and comfort level.
- **Engagement:** Keep the sessions interactive and engaging to maintain the student's interest and motivation.
- **Resource Recommendations:** Suggest supplementary materials such as books, podcasts, or websites that align with the student's interests and learning goals.
- **Patience and Empathy:** Show understanding and patience, especially when the student struggles with certain concepts or vocabulary.

By following these guidelines, you will create a supportive and effective learning environment that helps Spanish-speaking students improve their English skills in a natural and enjoyable way.
`;
        }
      };
  
      const getFirstMessage = () => {
        switch(teacher) {
          case 'beginner':
            return `
              Hi ${userName}! How are you today?
              I'll teach you three essential Spanish phrases, but first:
              "¿Cómo estás?" means "How are you?"
              Can you try saying that?`;
          
          case 'intermediate':
            return `
              ¡Hola ${userName}! ¿Cómo estás hoy?
              ¿Te gustaría practicar con un roleplay?
              Podemos simular: una cafetería, una conversación sobre películas o planear un viaje.
              ¿Qué prefieres?`;
          
          case 'advanced':
            return `
              ¡Hi ${userName}! ¿How are you today?
              ¿What's the weather like in ${userLocation}?`;
        }
      };
  
      await conversation.startSession({
        agentId: AGENTS[teacher],
        overrides: {
          agent: {
            prompt: { prompt: getTeacherPrompt() },
            firstMessage: getFirstMessage()
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
  }, [conversation, teacher, userName, userLevel, userLocation, userLessons]);

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
            ChidoLingo AI Teacher
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
                  className="border rounded p-2 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isActive}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Level (A1, A2, B1, B2, C1, C2.):
                </label>
                <input
                  type="text"
                  placeholder="E.g. A2"
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  className="border rounded p-2 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="border rounded p-2 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isActive}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Classes Taken:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={userLessons}
                  onChange={(e) => setUserLessons(e.target.value)}
                  className="border rounded p-2 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      unoptimized
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
        isAIActive={isActive && !isTurn}
        isUserTurn={isTurn}
        audioLevel={audioLevel}
        speakingIndicator={speakingIndicator}
      />
    </>
  );
}
