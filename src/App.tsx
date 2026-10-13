import { lazy, Suspense } from "react";
import "./App.css";

const InteractiveWave = lazy(() => import("./components/InteractiveWave"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
          <MainContainer>
            <Suspense fallback={null}>
              <InteractiveWave />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
