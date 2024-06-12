export const graphData = {
  version: 0.3,
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
      inputs: [":customerPhoneAudioLog"],
    },
    sentiment: {
      agent: "streamMockAgent",
      params: {
        message: "angry",
      },
      inputs: [":customerPhoneAudioLog"],
    },
    talkAnalysis: {
      inputs: [":audio2text"],
      agent: "streamMockAgent",
      params: {
        message: "this is message",
      },
    },
    functionCalling: {
      inputs: [":talkAnalysis"],
      agent: "streamMockAgent",
    },
    onpremiseApi: {
      inputs: [":functionCalling", ":RAG"],
      agent: "streamMockAgent",
    },
    RAG: {
      inputs: [":sentiment", ":talkAnalysis"],
      agent: "streamMockAgent",
      params: {
        message: "foo",
      },
    },
    data2speech: {
      inputs: [":RAG", ":talkAnalysis", ":onpremiseApi"],
      agent: "streamMockAgent",

    },
    responseToCustomer: {
      agent: "streamMockAgent",
      inputs: [":data2speech"],
      params: {
        message: "response",
      },
      isResult: true,
    },
    storeToDatabase: {
      inputs: [":sentiment", ":talkAnalysis", ":onpremiseApi"],
      agent: "streamMockAgent",
      params: {
        message: "response",
      },
    },
  },
};
