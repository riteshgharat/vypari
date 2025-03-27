// const axios = require('axios');

// const API_URL = process.env.GOOGLE_SHEET_API_URL;

// // 🔹 GET Data from Google Sheets
// async function getData(sheet, id = null) {
//     try {
//         const url = id ? `${API_URL}?sheet=${sheet}&id=${id}` : `${API_URL}?sheet=${sheet}`;
//         const response = await axios.get(url);
//         console.log(`✅ ${sheet} Data:`, response.data);
//     } catch (error) {
//         console.error(`❌ Error fetching ${sheet}:`, error.message);
//     }
// }

// // 🔹 POST Data to Google Sheets
// async function postData(sheet, data) {
//     try {
//         const response = await axios.post(`${API_URL}?sheet=${sheet}`, data, {
//             headers: { 'Content-Type': 'application/json' }
//         });
//         console.log(`✅ ${sheet} Data Added:`, response.data);
//     } catch (error) {
//         console.error(`❌ Error adding data to ${sheet}:`, error.message);
//     }
// }

// // Example Usage
// getData('Profile'); // Fetch all Profiles
// getData('Orders', 'ORD001'); // Fetch specific Order by ID

// postData('Profile', {
//     "User ID": "123",
//     "Name": "John Doe",
//     "Address": "123 Street",
//     "Phone": "9876543210"
// });

// postData('Orders', {
//     "OrderID": "ORD002",
//     "CustomerName": "Jane Doe",
//     "Product": "Keyboard",
//     "Price": "49.99",
//     "Status": "Shipped",
//     "OrderDate": "2025-03-27",
//     "CustomerNo": "9876543211",
//     "temp": ""
// });

// module.exports = { getData, postData };
// // Example usage of getData and postData functions

const axios = require("axios");

const BASE_URL = process.env.GOOGLE_SHEET_URL; // Replace with your Apps Script deployment URL

// Get Data from a Sheet
async function getData(sheetName, id = null) {
  try {
    const url = `${BASE_URL}?sheet=${sheetName}${id ? `&id=${id}` : ""}`;
    const response = await axios.get(url);
    console.log(response.data);
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
  }
}

// Post Data to a Sheet
async function postData(sheetName, data) {
  try {
    const url = `${BASE_URL}?sheet=${sheetName}`;
    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.data);
  } catch (error) {
    console.error(
      "Error posting data:",
      error.response ? error.response.data : error.message
    );
  }
}

// Usage Examples
(async () => {
  // 1️⃣ Get all Profiles
  await getData("Profile");

  // 2️⃣ Get a single Profile by User ID
  await getData("Profile", "9876543210");

  // 3️⃣ Add a new Profile (Phone Number as String)
  await postData("Profile", {
    "User ID": "9876543210",
    Name: "John Doe",
    Address: "123 Street",
    Phone: "9876543210",
  });

  // 4️⃣ Add a new Order (OrderID will be auto-generated)
  await postData("Orders", {
    CustomerName: "John Doe",
    Product: "Gaming Laptop",
    Price: "1299.99",
    Status: "Pending",
    OrderDate: "2025-03-27",
    CustomerNo: "9876543210",
    temp: "",
  });

  // 5️⃣ Add a new Product (ProductID will be auto-generated)
  await postData("Stocks", {
    "Product Name": "Wireless Mouse",
    Category: "Accessories",
    Rate: "25.99",
    Qty: "50",
    Gst: "5%",
    Stock: "In Stock",
  });
})();

module.exports = { getData, postData };
