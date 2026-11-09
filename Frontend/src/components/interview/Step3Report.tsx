import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportProps {
  report: any;
}

const Step3Report: React.FC<ReportProps> = ({ report }) => {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-lg">Loading Report...</p>
      </div>
    );
  }

  const { finalScore = 0, confidence = 0, communication = 0, correctness = 0, questionWiseScore = [] } = report;

  const questionScoreData = questionWiseScore.map((score: any, index: number) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const percentage = (finalScore / 10) * 100;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;
    doc.setDrawColor(16, 185, 129);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;
    doc.setFillColor(24, 24, 27); // zinc-900
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 13, { align: "center" });

    currentY += 30;
    doc.setFillColor(39, 39, 42); // zinc-800
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
    doc.setFontSize(12);
    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q: any, i: number) => [`${i + 1}`, q.question, `${q.score}/10`, q.feedback]),
      styles: { fontSize: 9, cellPadding: 5, valign: "top" },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("InterviewIQ_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 lg:px-10 py-8 text-foreground pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/history")} className="rounded-full h-12 w-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-zinc-100 mt-1">Analytics Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">AI-powered performance insights</p>
            </div>
          </div>
          <Button onClick={downloadPDF} variant="hero" className="rounded-xl h-12 px-6 shadow-primary/20 shadow-lg">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column (Scores & Skills) */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-zinc-800/80 rounded-3xl p-8 text-center bg-zinc-900/40">
              <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-8">Overall Score</h3>

              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-zinc-800" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute text-4xl font-display font-bold text-zinc-100">
                  {finalScore}<span className="text-lg text-zinc-500">/10</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="font-semibold text-zinc-200 text-lg">{performanceText}</p>
                <p className="text-muted-foreground text-sm mt-2">{shortTagline}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass border border-zinc-800/80 rounded-3xl p-8 bg-zinc-900/40">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Skill Evaluation</h3>
              <div className="space-y-6">
                {skills.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-zinc-300 font-medium">{s.label}</span>
                      <span className="font-bold text-primary">{s.value}/10</span>
                    </div>
                    <div className="bg-zinc-800/50 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value * 10}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                        className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column (Trends & Breakdown) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-zinc-800/80 rounded-3xl p-8 bg-zinc-900/40">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">Performance Trend</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" tickSize={0} tickMargin={10} axisLine={false} />
                    <YAxis domain={[0, 10]} stroke="#a1a1aa" tickSize={0} tickMargin={10} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#f4f4f5" }}
                      itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass border border-zinc-800/80 rounded-3xl p-8 bg-zinc-900/40">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Question Breakdown</h3>
              <div className="space-y-4">
                {questionWiseScore.map((q: any, i: number) => (
                  <div key={i} className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 transition-all hover:bg-zinc-900">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Question {i + 1}</p>
                        <p className="font-medium text-zinc-200 text-sm md:text-base leading-relaxed">{q.question || "N/A"}</p>
                      </div>
                      <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full font-bold text-sm text-nowrap self-start">
                        Score: {q.score ?? 0}/10
                      </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl">
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">AI Feedback</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{q.feedback && q.feedback.trim() !== "" ? q.feedback : "No feedback available."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;
