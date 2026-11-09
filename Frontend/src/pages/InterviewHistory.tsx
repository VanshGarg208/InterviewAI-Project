import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function InterviewHistory() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const { data } = await api.get("/interview/get-interview");
        setInterviews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMyInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full h-12 w-12 border-zinc-800 bg-zinc-900 border"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Button>

          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-zinc-100">
              Interview Archives
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Review past practices, track your progression, and analyze your performance.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-zinc-500">Loading archives...</div>
        ) : interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-zinc-800/80 rounded-3xl p-12 text-center"
          >
            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-6">No interviews found in your archives.</p>
            <Button variant="hero" onClick={() => navigate("/interview")}>
              Start Your First Interview
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/report/${item._id}`)}
                className="glass bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800 shadow-xl cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "completed"
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <BarChart className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-zinc-100 font-display mb-1">
                    {item.role || "General Assesment"}
                  </h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    {item.experience || "Entry Level"} • {item.mode || "Technical"}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase">Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {item.finalScore || 0}<span className="text-sm text-zinc-500">/10</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase">Date</p>
                    <p className="text-sm text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;
