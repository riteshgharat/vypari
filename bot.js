const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { generateInvoice } = require("./langflow/invoice");
const { generatePDF } = require("./utils/html2pdf");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { 
      headless: true,
      args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
      ]
  },
  webVersionCache: {
      type: 'none'
  }
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () =>
  console.log("🚀 WhatsApp AI E-Commerce Bot is Ready!")
);

client.on("auth_failure", () => {
  console.error("Authentication failed. Please check your credentials.");
  process.exit(1);
});

client.on("disconnected", (reason) => {
  console.error("Client was disconnected:", reason);
  client.initialize();
});

client.on("message_create", async (message) => {
  console.log(message);
  const text = message.body;

  if (text.startsWith("/invoice ")) {
    const prompt = text.replace("/invoice ", "").trim();

    if (prompt) {
      try {
        // Generate the invoice HTML and PDF
        const htmlContent = await generateInvoice(prompt);
        console.log("Generated HTML Content:", htmlContent);
        if (htmlContent) {
          const pdfBuffer = await generatePDF(htmlContent);

          // Send the PDF as a file to the user
          const media = new MessageMedia("application/pdf", pdfBuffer.toString("base64"), "invoice.pdf");
          await client.sendMessage(message.from, media);

          console.log("Invoice PDF sent successfully.");
        } else {
          client.sendMessage(message.from, "Failed to generate the invoice. Please try again.");
        }
      } catch (error) {
        console.error("Error generating or sending the invoice:", error);
        client.sendMessage(message.from, "An error occurred while generating the invoice. Please try again.");
      }
    } else {
      client.sendMessage(message.from, "Invalid format. Please provide a valid prompt after '/invoice'.");
    }
  }
});

client.initialize();