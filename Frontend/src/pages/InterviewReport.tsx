import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Step3Report from "../components/interview/Step3Report";

function InterviewReport() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/interview/report/${id}`);
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    };

    fetchReport();
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide">Compiling Analysis...</p>
        </div>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;
