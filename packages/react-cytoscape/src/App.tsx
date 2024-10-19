import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { graphData } from "./data";
import { useCytoscape } from "./cytoscape";

import { GraphAI } from "graphai";
import { streamMockAgent } from "@graphai/vanilla";

function App() {
  const [count, setCount] = useState(0);
  const { cytoscapeRef, updateCytoscape } = useCytoscape(graphData);

  const run = async () => {
    const graphai = new GraphAI(graphData, { streamMockAgent });
    graphai.onLogCallback = async ({ nodeId, state }) => {
      // logs.value.push({ nodeId, state, inputs, result, errorMessage });
      updateCytoscape(nodeId, state);
      console.log(nodeId, state);
    };
    await graphai.run();
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <>
      <div className="ext-3xl font-bold underline w-screen h-screen">
        <div ref={cytoscapeRef} className="w-full h-full" />
      </div>
    </>
  );
}

export default App;
