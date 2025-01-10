export const graphData = {
  version: 0.5,
  nodes: {
    start: {
      value: 1,
    },
    one: {
      agent: "sleeperAgent",
      params: { duration: 1000 },
      inputs: { data: ":start" },
    },
    nested: {
      agent: "nestedAgent",
      graph: {
        version: 0.5,
        nodes: {
          input1: {
            value: ":test",
          },
          child1: {
            agent: "sleeperAgent",
            params: { duration: 1000 },
            inputs: { data: ":data", data2: ":input1" },
          },
          child2: {
            agent: "sleeperAgent",
            params: { duration: 1000 },
            inputs: { data: ":child1" },
            isResult: true,
          },
          child3: {
            agent: "sleeperAgent",
            params: { duration: 1000 },
            inputs: { data: ":child2" },
          },
        },
      },
      inputs: { data: ":one", test: ":one" },
    },
  },
};
export const graphData2 = {
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
      inputs: { text: "${:data2speech.data}" },
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

export const graphChat = {
  version: 0.5,
  loop: {
    while: ":continue",
  },
  nodes: {
    continue: {
      value: true,
      update: ":checkInput",
    },
    messages: {
      value: [],
      update: ":reducer.array",
    },
    userInput: {
      agent: "streamMockAgent",
      params: {
        message: "You:",
      },
    },
    checkInput: {
      // Checks if the user wants to terminate the chat or not.
      agent: "streamMockAgent",
      inputs: { array: [":userInput.text", "!=", "/bye"] },
    },
    llm: {
      agent: "streamMockAgent",
      params: {
        forWeb: true,
        apiKey: import.meta.env.VITE_OPEN_API_KEY,
        stream: true,
      },
      inputs: { messages: ":messages", prompt: ":userInput.text" },
    },
    output: {
      agent: "streamMockAgent",
      console: {
        after: true,
      },
      inputs: {
        text: "\x1b[32mAgent\x1b[0m: ${:llm.text}",
      },
    },
    reducer: {
      agent: "streamMockAgent",
      inputs: { array: ":messages", items: [":userInput.message", { content: ":llm.text", role: "assistant" }] },
    },
  },
};

export const graphLoop = {
  version: 0.5,
  nodes: {
    arrayData: {
      value: [1,2,3]
    },
    nestedLoop: {
      agent: "nestedAgent",
      inputs: {
        arrayData: ":arrayData"
      },
      graph: {
        version: 0.5,
        loop: {
          while: ":arrayData"
        },
        nodes: {
          arrayData: {
            value: [],
            update: ":shift.array",
            console: {after: true },
          },
          shift: {
            isResult: true,
            agent: "shiftAgent",
            inputs: {
              array: ":arrayData"
            },
            console: {after: true },
          },
        }
      }
    }
  }
};
