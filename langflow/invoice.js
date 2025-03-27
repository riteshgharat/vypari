const dotenv = require("dotenv");
dotenv.config();

async function generateInvoice(prompt) {
  try {
    const response = await fetch(
      "https://api.langflow.astra.datastax.com/lf/37c06c22-02c2-4d97-af46-1cba5d3b7b40/api/v1/run/89c33e6d-fd40-4629-9c96-12f0b9e436c8?stream=false",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.INVOICE_LANGFLOW_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_value: prompt,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "Agent-6KEAi": {},
            "ChatInput-5JmQC": {},
            "ChatOutput-QAgkt": {},
            "AstraDBToolComponent-Bsr7Q": {},
          },
        }),
      }
    );
    const data = await response.json();
    console.log("Response Data:", data);

    const htmlData = data.outputs[0].outputs[0].artifacts.message;
    const extractedHtml = htmlData.match(/```html([\s\S]*?)```/);
    const cleanHtml = extractedHtml ? extractedHtml[1].trim() : null;

    if (!cleanHtml) {
      throw new Error('No HTML content found in the response');
    }

    return cleanHtml;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = { generateInvoice };