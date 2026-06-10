import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Internship } from '../App';

export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer Received';

export interface UserApplication {
  internship: Internship; // Storing the whole object for easy display in Kanban
  status: ApplicationStatus;
}

interface AppContextType {
  activeListing: Internship | null;
  setActiveListing: (listing: Internship | null) => void;
  userApplications: UserApplication[];
  setUserApplications: React.Dispatch<React.SetStateAction<UserApplication[]>>;
  updateApplicationStatus: (id: number, newStatus: ApplicationStatus) => void;
  userSkills: string[];
  setUserSkills: React.Dispatch<React.SetStateAction<string[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeListing, setActiveListing] = useState<Internship | null>(null);
  
  // Initialize from localStorage if available
  const [userApplications, setUserApplications] = useState<UserApplication[]>(() => {
    const saved = localStorage.getItem('interntrack_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [userSkills, setUserSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('interntrack_skills');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('interntrack_applications', JSON.stringify(userApplications));
  }, [userApplications]);

  useEffect(() => {
    localStorage.setItem('interntrack_skills', JSON.stringify(userSkills));
  }, [userSkills]);

  const updateApplicationStatus = (id: number, newStatus: ApplicationStatus) => {
    setUserApplications(prev => 
      prev.map(app => app.internship.id === id ? { ...app, status: newStatus } : app)
    );
  };

  return (
    <AppContext.Provider value={{
      activeListing,
      setActiveListing,
      userApplications,
      setUserApplications,
      updateApplicationStatus,
      userSkills,
      setUserSkills
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
