import React, { useState, useRef } from 'react';
import { Mic, Square, Play } from 'lucide-react';
import Button from './Button';

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data url prefix (data:audio/wav;base64,)
          const base64Data = base64String.split(',')[1];
          onRecordingComplete(base64Data);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Precisamos do microfone para ouvir a tua leitura!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <Button onClick={startRecording} variant="secondary" className="w-full h-24 rounded-full">
          <Mic className="w-8 h-8 mr-2" />
          Gravar Resposta
        </Button>
      ) : (
        <Button onClick={stopRecording} variant="outline" className="w-full h-24 rounded-full animate-pulse border-red-500 text-red-500">
          <Square className="w-8 h-8 mr-2" />
          Parar
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;