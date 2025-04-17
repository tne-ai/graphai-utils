import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:8085/api",
  apiKey: "dummy",
});

const messages = [
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "How can I travel to Mars?",
      },
    ],
  },
] as any;
async function main() {
  const stream = await openai.beta.chat.completions.stream({
    model: "gpt-4o",
    messages,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) process.stdout.write(token);
  }
  console.log("\n--- done ---");
  const chatCompletion = await stream.finalChatCompletion();
  console.log(JSON.stringify(chatCompletion, null, 2));
}

main().catch(console.error);
