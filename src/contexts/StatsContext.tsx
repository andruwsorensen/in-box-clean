import React, { createContext, useContext, useState } from 'react';

interface StatsContextType {
  triggerRefetch: number;
  incrementTrigger: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [triggerRefetch, setTriggerRefetch] = useState(0);

  const incrementTrigger = () => {
    setTriggerRefetch((prev) => prev + 1);
  };

  return (
    <StatsContext.Provider value={{ triggerRefetch, incrementTrigger }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}