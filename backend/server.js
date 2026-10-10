const express = require("express");
const cors = require("cors");

const app = express();

/* ---------- MIDDLEWARE ---------- */

// 1. CORS: lets the browser (localhost:5500) call this server (localhost:3000)
app.use(cors());

// 2. Built-in JSON parser: fills req.body from JSON requests
app.use(express.json());

// 3. Custom middleware: logs HTTP method + URL of every request
app.use((req, res, next) => {
    console.log("--------------------------------");
    console.log("Request received at", new Date().toLocaleTimeString());
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    next(); // continue to the route
});

/* ---------- PREDEFINED DATA ---------- */

const products = [
    { id: 1, name: "Velo Smart Bottle", price: 34.99, category: "Bottles",
      colors: ["black", "blue", "pink", "green"], variants: ["classic", "sport"] },
    { id: 2, name: "Velo Travel Cap", price: 9.99, category: "Accessories",
      colors: ["black", "blue"], variants: ["classic"] },
    { id: 3, name: "Velo Cleaning Kit", price: 14.5, category: "Accessories",
      colors: ["green"], variants: ["classic", "sport"] }
];

const orders = []; // in-memory only (no database in this lab)

/* ---------- ROUTES ---------- */

// GET: send product list as JSON
app.get("/api/products", (req, res) => {
    res.json(products);
});

// POST: receive a configuration in req.body, reply with JSON
app.post("/api/configurations", (req, res) => {
    const config = req.body;
    console.log("Received configuration:", config);

    if (!config || !config.productName || !config.color || !config.variant) {
        return res.status(400).json({
            success: false,
            message: "Invalid configuration: productName, color and variant are required."
        });
    }

    const order = { orderId: orders.length + 1, ...config, receivedAt: new Date().toISOString() };
    orders.push(order);

    res.json({
        success: true,
        message: "Configuration received successfully",
        order: order
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
