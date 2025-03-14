## Composable to show GraphAI state to React using cytoscape

### install

```sh
yarn add @receptron/graphai_react_cytoscape
```

### Usage


```typescript

import { useCytoscape } from "@receptron/graphai_react_cytoscape";

import { GraphAI } from "graphai";

function App() {
  const [selectedGraph, __setSelectedGraph] = useState(graphData);
  const { cytoscapeRef, updateCytoscape } = useCytoscape(selectedGraph);

  const run = async () => {
    const graphai = new GraphAI(selectedGraph, agents);
    graphai.registerCallback(updateCytoscape);
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

```