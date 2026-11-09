import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Loader2 } from "lucide-react";
import maleVideo from "../../assets/videos/male-ai.mp4";
import femaleVideo from "../../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import api from "../../services/api";
import { Button } from "@/components/ui/button";

interface Step2Props {
  interviewData: any;
  onFinish: (report: any) => void;
}

const Step2Interview: React.FC<Step2Props> = ({ interviewData, onFinish }) => {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  const [subtitle, setSubtitle] = useState("");

  const recognitionRef = useRef<any>(null);
  const answerRef = useRef("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find((v) =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find((v) =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      );
      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        if (isMicOn) startMic();
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName || "there"}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    
    // Always use the latest answer value via ref
    const finalAnswer = answerRef.current;
    
    try {
      const { data } = await api.post("/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: finalAnswer.trim() || "No text provided",
        timeTaken: currentQuestion.timeLimit - timeLeft,
      });
      setFeedback(data.feedback);
      speakText(data.feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const { data } = await api.post("/interview/finish", { interviewId });
      onFinish(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-[85vh] w-full max-w-6xl mx-auto glass rounded-3xl shadow-2xl border border-zinc-800/50 flex flex-col lg:flex-row overflow-hidden">
      {/* Video & Status Panel */}
      <div className="w-full lg:w-[35%] bg-zinc-950 flex flex-col items-center p-6 space-y-6 border-r border-zinc-800/50">
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800">
          <video
            src={videoSource}
            ref={videoRef}
            muted
            playsInline
            loop
            preload="auto"
            className="w-full h-auto object-cover"
          />
          {isAIPlaying && (
            <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md border border-primary/50 text-primary text-xs px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> Speaking
            </div>
          )}
        </div>

        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm"
          >
            <p className="text-zinc-300 text-sm font-medium text-center leading-relaxed">
              "{subtitle}"
            </p>
          </motion.div>
        )}

        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Session Status</span>
          </div>
          <div className="h-px bg-zinc-800/50 w-full" />
          <div className="flex justify-center">
            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
          </div>
          <div className="h-px bg-zinc-800/50 w-full" />
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">{currentIndex + 1}</span>
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">{questions.length}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Panel */}
      <div className="flex-1 flex flex-col p-6 md:p-10 bg-zinc-900/30 relative">
        <h2 className="text-2xl font-bold text-primary mb-8 font-display flex items-center justify-between">
          <span>AI Interaction Center</span>
          <span className="text-sm font-normal text-muted-foreground px-3 py-1 bg-zinc-800/50 rounded-full">
            {isMicOn ? "🎤 Recording Active" : "🔇 Mic Muted"}
          </span>
        </h2>

        {!isIntroPhase && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 shadow-inner"
          >
            <p className="text-xs text-primary mb-3 uppercase tracking-wider font-semibold">
              Question {currentIndex + 1}
            </p>
            <div className="text-lg text-zinc-100 leading-relaxed">
              {currentQuestion?.question}
            </div>
          </motion.div>
        )}

        <div className="flex-1 flex flex-col">
          <textarea
            placeholder={isAIPlaying ? "Please listen to the AI..." : "Begin speaking or type your answer here..."}
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={isAIPlaying || isSubmitting}
            className="flex-1 w-full bg-zinc-950/50 p-6 rounded-2xl resize-none outline-none border border-zinc-800/80 focus:ring-1 focus:ring-primary focus:border-primary transition text-zinc-300 placeholder:text-zinc-600 shadow-inner"
          />
        </div>

        {!feedback ? (
          <div className="flex items-center gap-4 mt-6">
            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className={`w-14 h-14 flex flex-shrink-0 items-center justify-center rounded-2xl shadow-lg border transition-all ${
                isMicOn ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {isMicOn ? <Mic size={22} className="animate-pulse" /> : <MicOff size={22} />}
            </motion.button>

            <Button
              onClick={submitAnswer}
              disabled={isSubmitting || !answer.trim() || isAIPlaying}
              variant="hero"
              className="flex-1 h-14 rounded-2xl text-lg font-medium shadow-primary/20 shadow-lg"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Evaluating Answer...</>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-primary/10 border border-primary/30 p-6 rounded-2xl shadow-sm"
          >
            <p className="text-primary font-medium mb-6 leading-relaxed">
              {feedback}
            </p>
            <Button
              onClick={handleNext}
              variant="heroOutline"
              className="w-full h-12 text-primary border-primary/50 hover:bg-primary hover:text-black transition flex items-center justify-center gap-2"
            >
              {currentIndex + 1 >= questions.length ? "Finish Interview" : "Proceed to Next Question"} 
              <ArrowRight size={18} />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Step2Interview;
