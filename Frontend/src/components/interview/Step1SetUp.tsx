import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, UploadCloud, Mic, BarChart, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Step1Props {
  onStart: (data: any) => void;
}

const Step1SetUp: React.FC<Step1Props> = ({ onStart }) => {
  const { user, setUser } = useAuth();
  
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      // Replaced old raw axios with our central authenticated api
      const { data } = await api.post("/interview/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setRole(data.role || "");
      setExperience(data.experience || "");
      setProjects(data.projects || []);
      setSkills(data.skills || []);
      setResumeText(data.resumeText || "");
      setAnalysisDone(true);
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error("Resume analysis failed", error);
      toast.error(error.response?.data?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (loading || !role.trim() || !experience.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/interview/generate-questions", {
        role: role.trim(),
        experience: experience.trim(),
        mode,
        resumeText,
        projects,
        skills,
      });

      if (user) {
        setUser({ ...user, credits: data.creditsLeft });
      }

      onStart(data);
      toast.success("Interview session created successfully!");
    } catch (error: any) {
      console.error("Generation failed", error);
      const errMsg = error.response?.data?.message || error.message || "Failed to initialize AI Engine. Please check your API keys or try again.";
      toast.error(errMsg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto glass rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden border border-zinc-800/50"
    >
      {/* Left panel: Info */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-10 md:p-14 flex flex-col justify-center bg-zinc-900/50"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
          Configure Your <span className="text-gradient-primary">Interview</span>
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed text-sm md:text-base">
          Our AI uses natural language processing to emulate real-world technical and HR interviews. Upload your resume to get hyper-personalized questions.
        </p>

        <div className="space-y-4">
          {[
            { icon: <User className="w-5 h-5 text-primary" />, text: "Choose Role & Experience" },
            { icon: <Mic className="w-5 h-5 text-primary" />, text: "Smart Voice Interview" },
            { icon: <BarChart className="w-5 h-5 text-primary" />, text: "Detailed Analytics & Scoring" }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <div className="bg-primary/10 p-2 rounded-lg">{item.icon}</div>
              <span className="font-medium text-sm text-zinc-300">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right panel: Controls */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-10 md:p-14 bg-zinc-950 flex flex-col justify-center"
      >
        <div className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="E.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition text-sm"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Experience (e.g. 2 years)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition text-sm"
            />
          </div>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition text-sm"
          >
            <option value="Technical">Technical Interview</option>
            <option value="HR">HR Interview</option>
          </select>

          {!analysisDone ? (
            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 hover:border-primary/50 transition bg-zinc-900/30 flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-primary mb-3 opacity-80" />
              <input
                type="file"
                accept="application/pdf"
                id="resumeUpload"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="resumeUpload" className="cursor-pointer">
                <span className="text-zinc-400 text-sm font-medium hover:text-primary transition">
                  {resumeFile ? resumeFile.name : "Click to upload Resume (Optional)"}
                </span>
              </label>

              {resumeFile && (
                <Button
                  onClick={handleUploadResume}
                  disabled={analyzing}
                  variant="outline"
                  className="mt-4 border-primary/50 text-primary w-full"
                >
                  {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Analyze PDF"}
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-primary mb-3">Resume Analyzed Successfully</h3>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 5).map((s, i) => (
                    <span key={i} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md">
                      {s}
                    </span>
                  ))}
                  {skills.length > 5 && <span className="text-xs text-muted-foreground self-center">+{skills.length - 5} more</span>}
                </div>
              )}
            </motion.div>
          )}

          <Button
            onClick={handleStart}
            disabled={!role.trim() || !experience.trim() || loading}
            variant="hero"
            className="w-full h-12 mt-4 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing AI Engine...</> : "Start Practice Session"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Step1SetUp;
