export const graphData = {
  version: 0.5,
  nodes: {
    customerPhoneAudioLog: {
      agent: "streamMockAgent",
      params: {
        message: "hi, tell me hoge hoge",
      },
    },
    audio2text: {
      agent: "streamMockAgent",
      params: {
        message: "hi, tell me hoge hoge",
      },
      inputs: { text: ":customerPhoneAudioLog" },
    },
    sentiment: {
      agent: "streamMockAgent",
      params: {
        message: "angry",
      },
      inputs: { text: ":customerPhoneAudioLog" },
    },
    talkAnalysis: {
      inputs: { text: ":audio2text" },
      agent: "streamMockAgent",
      params: {
        message: "this is message",
      },
    },
    functionCalling: {
      inputs: { text: ":talkAnalysis" },
      agent: "streamMockAgent",
    },
    onpremiseApi: {
      inputs: { array: [":functionCalling", ":RAG"] },
      agent: "streamMockAgent",
    },
    RAG: {
      inputs: { array: [":sentiment", ":talkAnalysis"] },
      agent: "streamMockAgent",
      params: {
        message: "foo",
      },
    },
    data2speech: {
      inputs: { array: [":RAG", ":talkAnalysis", ":onpremiseApi"] },
      agent: "streamMockAgent",
    },
    responseToCustomer: {
      agent: "streamMockAgent",
      inputs: { text: ":data2speech.data" },
      params: {
        message: "response",
      },
      isResult: true,
    },
    storeToDatabase: {
      inputs: { array: [":sentiment", ":talkAnalysis", ":onpremiseApi"] },
      agent: "streamMockAgent",
      params: {
        message: "response",
      },
    },
  },
};
