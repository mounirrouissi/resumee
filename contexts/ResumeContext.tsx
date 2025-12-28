import React, { createContext, useContext, useState, ReactNode } from "react";

export type Resume = {
  id: string;
  originalFilename: string;
  originalText: string;
  improvedText: string;
  dateProcessed: Date;
  status: "processing" | "completed" | "error";
  downloadUrl?: string;
};

type ResumeContextType = {
  resumes: Resume[];
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  clearAllResumes: () => void;
  getResumeById: (id: string) => Resume | undefined;
  currentProcessingId: string | null;
  setCurrentProcessingId: (id: string | null) => void;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(
    null,
  );

  const addResume = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
  };

  const updateResume = (id: string, updates: Partial<Resume>) => {
    setResumes((prev) =>
      prev.map((resume) =>
        resume.id === id ? { ...resume, ...updates } : resume,
      ),
    );
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  const clearAllResumes = () => {
    setResumes([]);
  };

  const getResumeById = (id: string) => {
    return resumes.find((resume) => resume.id === id);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        addResume,
        updateResume,
        deleteResume,
        clearAllResumes,
        getResumeById,
        currentProcessingId,
        setCurrentProcessingId,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumes must be used within a ResumeProvider");
  }
  return context;
}
