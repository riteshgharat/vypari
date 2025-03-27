const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

async function insertDocument(document) {
  const endpoint =
    "https://d88bae9d-6efb-455c-955f-58262b27f5c2-us-east-2.apps.astra.datastax.com/api/json/v1/default_keyspace/sample3";
  const token = process.env.ASTRADB_TOKEN; // Ensure you have set this environment variable

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        insertOne: {
          document: document,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to insert document. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error inserting document:", error);
    throw error;
  }
}

module.exports = { insertDocument };
