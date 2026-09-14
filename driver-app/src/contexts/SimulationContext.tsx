import React, { createContext, useContext, useState, ReactNode } from 'react';

type Scenario = 'toaster' | 'tv' | 'scrap';

interface SimulationContextType {
  activeScenario: Scenario;
  setActiveScenario: (scenario: Scenario) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [activeScenario, setActiveScenario] = useState<Scenario>('toaster');

  return (
    <SimulationContext.Provider value={{ activeScenario, setActiveScenario }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
