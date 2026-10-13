import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";
import EntryOverlay from "../components/EntryOverlay";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
  isEntered: boolean;
  setIsEntered: (state: boolean) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 6) + 4;
      if (progress >= 100) {
        progress = 100;
        setLoading(100);
        clearInterval(interval);
      } else {
        setLoading(progress);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
    isEntered,
    setIsEntered,
  };

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <EntryOverlay />
      <main
        className="main-body"
        style={{
          visibility: !isEntered ? "hidden" : "visible",
          opacity: !isEntered ? 0 : 1,
          pointerEvents: !isEntered ? "none" : "auto",
          transition: "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
