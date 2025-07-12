import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
}
// export interface Education {
//   id: string;            // Unique identifier
//   institution: string;   // School, college or university name
//   degree: string;        // Degree or certification earned (e.g., BSc Computer Science)
//   startDate: string;     // ISO-8601 date string (e.g., "2022-09-01")
//   endDate: string;       // ISO-8601 date string or empty if current
//   description: string;   // Optional notes (honors, coursework, etc.)
//   isCurrent: boolean;    // True if the student is still enrolled
// }



export interface CVData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  isActive: boolean;
  nationality: string;
  employmentStatus: string;
  termsAccepted: boolean;
  preferredLanguages: string[];
  workExperience: WorkExperience[];
  profilePicture?: string; // Base64 encoded image
  createdAt: string;
  updatedAt: string;
}

interface CVContextType {
  cvs: CVData[];
  createCV: (cvData: Omit<CVData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => string;
  updateCV: (id: string, cvData: Partial<CVData>) => boolean;
  deleteCV: (id: string) => boolean;
  getCVById: (id: string) => CVData | undefined;
  getUserCVs: () => CVData[];
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const useCV = () => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};

interface CVProviderProps {
  children: ReactNode;
}

export const CVProvider: React.FC<CVProviderProps> = ({ children }) => {
  const [cvs, setCVs] = useState<CVData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load CVs from localStorage on component mount
    const storedCVs = localStorage.getItem('cvs');
    if (storedCVs) {
      setCVs(JSON.parse(storedCVs));
    }
  }, []);

  const saveCVsToStorage = (newCVs: CVData[]) => {
    localStorage.setItem('cvs', JSON.stringify(newCVs));
    setCVs(newCVs);
  };

  const createCV = (cvData: Omit<CVData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): string => {
    if (!user) throw new Error('User must be authenticated');
    
    const newCV: CVData = {
      ...cvData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCVs = [...cvs, newCV];
    saveCVsToStorage(updatedCVs);
    return newCV.id;
  };

  const updateCV = (id: string, cvData: Partial<CVData>): boolean => {
    if (!user) return false;

    const cvIndex = cvs.findIndex(cv => cv.id === id && cv.userId === user.id);
    if (cvIndex === -1) return false;

    const updatedCVs = [...cvs];
    updatedCVs[cvIndex] = {
      ...updatedCVs[cvIndex],
      ...cvData,
      updatedAt: new Date().toISOString()
    };

    saveCVsToStorage(updatedCVs);
    return true;
  };

  const deleteCV = (id: string): boolean => {
    if (!user) return false;

    const updatedCVs = cvs.filter(cv => !(cv.id === id && cv.userId === user.id));
    if (updatedCVs.length === cvs.length) return false;

    saveCVsToStorage(updatedCVs);
    return true;
  };

  const getCVById = (id: string): CVData | undefined => {
    if (!user) return undefined;
    return cvs.find(cv => cv.id === id && cv.userId === user.id);
  };

  const getUserCVs = (): CVData[] => {
    if (!user) return [];
    return cvs.filter(cv => cv.userId === user.id);
  };

  const value = {
    cvs,
    createCV,
    updateCV,
    deleteCV,
    getCVById,
    getUserCVs
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};