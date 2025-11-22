import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { Subject, Difficulty, Exercise, ExerciseType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Text Content Generation ---

const systemInstruction = `
Você é a Sanda, uma professora divertida, amigável e encorajadora para crianças angolanas de 6 a 9 anos.
Sempre use exemplos contextualizados com a cultura de Angola (nomes como Njinga, Jamba; comidas como mufete, múcua; lugares como Luanda, Benguela).
Seja breve, clara e muito positiva. Use emojis.
`;

export const generateDiagnosticQuestions = async (): Promise<Exercise[]> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Gere 5 exercícios de diagnóstico para uma criança de 7 anos.
    Misture Matemática (operações básicas) e Português (sílabas, vogais).
    Retorne em JSON.
    Para 'type', use apenas 'MULTIPLE_CHOICE'.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              subject: { type: Type.STRING, enum: ['PORTUGUESE', 'MATH'] },
              type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE'] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              visualHint: { type: Type.STRING },
            },
            required: ['id', 'subject', 'type', 'question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Exercise[];
  } catch (e) {
    console.error("Error generating diagnostic", e);
    // Fallback static data if API fails
    return [
      {
        id: '1', subject: Subject.MATH, type: ExerciseType.MULTIPLE_CHOICE,
        question: 'A Ana comprou 3 mangas e o Jamba comprou 2. Quantas mangas eles têm juntos?',
        options: ['4', '5', '6'], correctAnswer: '5', explanation: '3 mais 2 é igual a 5!', visualHint: '🥭'
      },
      {
        id: '2', subject: Subject.PORTUGUESE, type: ExerciseType.MULTIPLE_CHOICE,
        question: 'Qual palavra começa com a letra A?',
        options: ['Bola', 'Ananás', 'Casa'], correctAnswer: 'Ananás', explanation: 'Ananás começa com A!', visualHint: '🍍'
      }
    ];
  }
};

export const generateExercise = async (subject: Subject, difficulty: Difficulty): Promise<Exercise> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Crie um exercício divertido de ${subject === Subject.MATH ? 'Matemática' : 'Língua Portuguesa'} 
    Nível: ${difficulty} (Criança 6-9 anos).
    Contexto: Angola.
    Se for Português, foque em ${difficulty === Difficulty.EASY ? 'vogais e consoantes' : 'sílabas e leitura simples'}.
    Se for Matemática, foque em ${difficulty === Difficulty.EASY ? 'somas simples' : 'subtração e multiplicação básica'}.
    Selecione aleatoriamente entre MULTIPLE_CHOICE e FILL_BLANK.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            subject: { type: Type.STRING, enum: ['PORTUGUESE', 'MATH'] },
            type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'FILL_BLANK'] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            visualHint: { type: Type.STRING },
          },
          required: ['id', 'subject', 'type', 'question', 'correctAnswer', 'explanation'],
        },
      },
    });
    
    const text = response.text;
    if(!text) throw new Error("No text generated");
    return JSON.parse(text) as Exercise;
  } catch (e) {
    console.error(e);
     return {
        id: 'fallback', subject: subject, type: ExerciseType.MULTIPLE_CHOICE,
        question: 'Quanto é 1 + 1?',
        options: ['1', '2', '3'], correctAnswer: '2', explanation: 'Um mais um é dois.', visualHint: '➕'
      };
  }
};

export const evaluateReading = async (audioBase64: string, expectedText: string): Promise<{score: number, feedback: string}> => {
   const model = 'gemini-2.5-flash';
   // Sending audio to verify pronunciation/reading
   try {
     const response = await ai.models.generateContent({
       model,
       contents: {
         parts: [
           { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
           { text: `A criança tentou ler a frase: "${expectedText}". Avalie se ela leu corretamente. Retorne JSON com 'score' (0 a 100) e 'feedback' curto e amigável em PT-PT (Angola).` }
         ]
       },
       config: {
         responseMimeType: 'application/json',
         responseSchema: {
           type: Type.OBJECT,
           properties: {
             score: { type: Type.NUMBER },
             feedback: { type: Type.STRING },
           }
         }
       }
     });
     const text = response.text;
     if(!text) throw new Error("No eval text");
     return JSON.parse(text);
   } catch (e) {
     return { score: 0, feedback: "Não consegui ouvir bem, tenta de novo!" };
   }
};

// --- Text to Speech ---

// Helper to decode base64 audio
const decodeAudio = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const speakText = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }, // Female, clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(decodeAudio(base64Audio).buffer);
    return audioBuffer;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

export const playAudioBuffer = (buffer: AudioBuffer) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
};
