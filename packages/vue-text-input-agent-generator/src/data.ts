export const graphData = {
  version: 0.5,
  nodes: {
    one: {
      agent: "textInputAgent",
      params: { name: "one" },
    },
    two: {
      agent: "textInputAgent",
      inputs: { data: ":one" },
      params: { name: "two" },
    },
    three: {
      agent: "textInputAgent",
      inputs: { data: ":one" },
      params: { name: "three" },
    },
    four: {
      agent: "textInputAgent",
      inputs: { data: [":two", ":three"] },
      params: { name: "four" },
    },
  },
};
