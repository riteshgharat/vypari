const dotenv = require("dotenv");
dotenv.config();

async function mainFlow(prompt) {
  try {
    const response = await fetch(
        "https://astra.datastax.com/api/v1/run/5196970a-9649-4e17-87c0-07176c419942?stream=false",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MAIN_LANGFLOW_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_value: prompt,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "ChatInput-INyiv": {},
            "ParseData-6oxrC": {},
            "Prompt-P1qX9": {},
            "ChatOutput-kvrZ9": {},
            "AstraDB-x51p1": {},
            "GoogleGenerativeAIModel-b1lwT": {}
          },
        }),
      }
    );
    const data = await response.json();
    console.log("Response Data:", data);

    const resTxt = data.outputs[0].outputs[0].artifacts.message;
    
    
    return resTxt;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = { mainFlow };