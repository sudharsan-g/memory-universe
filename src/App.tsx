import { useState } from "react";
import Home from "./pages/Home";
import Celebration from "./pages/Celebration";
import Collage from "./pages/Collage";
import PersonalPage from "./pages/PersonalPage";

import "./App.css";

type Page =
  | "home"
  | "celebration"
  | "collage"
  | "personal"
  | "roast"
  | "memory";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "celebration":
        return <Celebration onNext={() => setCurrentPage("collage")} />;
      case "collage":
        return <Collage onNext={() => setCurrentPage("personal")} />;
      case "personal":
        return <PersonalPage onNext={() => setCurrentPage("home")} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return <div className="min-h-screen bg-[#030406]">{renderPage()}</div>;
}

export default App;
