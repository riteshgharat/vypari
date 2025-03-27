const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { generateInvoice } = require("./langflow/invoice");
const { generatePDF } = require("./utils/html2pdf");

const { getData, postData } = require("./googleapi/googleSheet");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
  webVersionCache: {
    type: "none",
  },
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

// client.on("message_create", async (message) => {
//   console.log(message);
//   const text = message.body;

//   if (text.startsWith("/invoice ")) {
//     const prompt = text.replace("/invoice ", "").trim();

//     if (prompt) {
//       try {
//         // Generate the invoice HTML and PDF
//         const htmlContent = await generateInvoice(prompt);
//         console.log("Generated HTML Content:", htmlContent);
//         if (htmlContent) {
//           const pdfBuffer = await generatePDF(htmlContent);

//           // Send the PDF as a file to the user
//           const media = new MessageMedia("application/pdf", pdfBuffer.toString("base64"), "invoice.pdf");
//           await client.sendMessage(message.from, media);

//           console.log("Invoice PDF sent successfully.");
//         } else {
//           client.sendMessage(message.from, "Failed to generate the invoice. Please try again.");
//         }
//       } catch (error) {
//         console.error("Error generating or sending the invoice:", error);
//         client.sendMessage(message.from, "An error occurred while generating the invoice. Please try again.");
//       }
//     } else {
//       client.sendMessage(message.from, "Invalid format. Please provide a valid prompt after '/invoice'.");
//     }
//   }
// });

// client.initialize();

client.on("message", async (message) => {
  const chatId = message.from;
  console.log("Chat ID:", chatId);
  const text = message.body.toLowerCase();

  if (text.startsWith("/start")) {
    const user = await getData("Profile", chatId); // Fetch user profile data
    if (!user) {
      await client.sendMessage(
        chatId,
        "*👋 Welcome!* Please provide your *name* and *address* to continue.\n\nUse the format:\n/register | Your Name | Your Address"
      );
    } else {
      await client.sendMessage(
        chatId,
        `🌟 *Welcome back, ${user.name}!* 🌟\n\n🚀 Available Commands:\n📦 */browse* - List products\n🛒 */order* - Checkout\n🚚 */track* - Track your order\n❓ */faqs* - Get support`
      );
    }
  } else if (text.startsWith("/register")) {
    const [_, name, address] = text.split("|");
    if (!name || !address) {
      await client.sendMessage(
        chatId,
        "⚠️ Please use the format:\n/register | Your Name | Your Address"
      );
    } else {
      await postData("Profiles", {
        "User ID": chatId,
        Name: name.trim(),
        Address: address.trim(),
        Phone: chatId,
      });
      await client.sendMessage(
        chatId,
        `✅ *Thank you, ${name}!* Your profile has been saved.\n\nNow you can browse products using */browse* or place an order using */order*.`
      );
    }
  } else if (text.startsWith("/browse")) {
    try {
      const stockData = await getData("Stock"); // Fetch stock data
      if (stockData && stockData.length > 0) {
        const productList = stockData
          .map(
            (item, index) =>
              `${index + 1}. *${item.name}* - ₹${item.price} (${
                item.quantity
              } available)`
          )
          .join("\n");
        await client.sendMessage(
          chatId,
          `🛍️ *Available Products:*\n\n${productList}`
        );
      } else {
        await client.sendMessage(
          chatId,
          "⚠️ No products available at the moment."
        );
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      await client.sendMessage(
        chatId,
        "⚠️ An error occurred while fetching the product list. Please try again later."
      );
    }
  } else if (text.startsWith("/chat")) {
    const inputValue = text.replace("/chat", "").trim(); // Extract the input value after "/chat"
    if (!inputValue) {
      await client.sendMessage(
        chatId,
        "⚠️ Please provide a message after the command. Example: */chat Hello!*"
      );
      return;
    }

    try {
      const response = await fetch(
        "https://api.langflow.astra.datastax.com/lf/c9496ff6-706f-45c9-8562-58067cf35599/api/v1/run/5196970a-9649-4e17-87c0-07176c419942?stream=false",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer AstraCS:CcQsbadEoqEqYeSNGveiHTDG:5e3da5a6ea98864e11450824af1b8cb0a33e0308984e84fbec0ec8b82d61cd88"
          },
          body: JSON.stringify({
            input_value: inputValue,
            output_type: "chat",
            input_type: "chat",
            tweaks: {
              "ChatInput-INyiv": {},
              "ParseData-6oxrC": {},
              "Prompt-P1qX9": {},
              "ChatOutput-kvrZ9": {},
              "AstraDB-x51p1": {},
              "GoogleGenerativeAIModel-b1lwT": {}
            }
          })
        }
      );
      
      const data = await response.json();
      console.log(data);
      const reply = data.outputs[0].outputs[0].artifacts.message;

      // Send the chatbot's response to the user
      await client.sendMessage(chatId, `🤖 *Chatbot Response:*\n\n${reply}`);
    } catch (error) {
      console.error("Error in /chat command:", error);
      await client.sendMessage(
        chatId,
        "⚠️ An error occurred while processing your request. Please try again later."
      );
    }
  } else if (text.startsWith("/order")) {
    const order = await placeOrder(chatId);
    await client.sendMessage(
      chatId,
      `🎉 *Order placed successfully!*\n\n📦 *Order ID:* ${order.id}\n\nTrack your order using */track*`
    );
  } else if (text.startsWith("/track")) {
    const status = await trackOrder(chatId);
    await client.sendMessage(chatId, `🚚 *Your order status:*\n${status}`);
  } else if (text.startsWith("/faqs")) {
    const faqs = await getFAQs();
    await client.sendMessage(chatId, `❓ *FAQs:*\n\n${faqs}`);
  } else {
    await client.sendMessage(
      chatId,
      "⚠️ Unknown command. Use */start* to see available commands."
    );
  }
});

client.initialize();
