import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { graphData } from "./data";
import { useCytoscape } from "./cytoscape";

function App() {
  const [count, setCount] = useState(0);
  const { cytoscapeRef } = useCytoscape(graphData);

  return (
    <>
      <div className="ext-3xl font-bold underline w-screen h-screen">
        <div ref={cytoscapeRef} className="w-full h-full" />
      </div>
    </>
  );
}

export default App;
