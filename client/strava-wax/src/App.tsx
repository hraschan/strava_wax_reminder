import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Stats } from "./Stats";

function App() {
  // const StatsComponent = lazy(() => import("./Stats"));
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <div>
          <h1 className="strava">Strava Wax Reminder - Canyon CF7 </h1>
          <Stats />
        </div>
      </>
    </QueryClientProvider>
  );
}

export default App;
