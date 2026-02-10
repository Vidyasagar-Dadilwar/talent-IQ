import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";

import { fileURLToPath } from 'url';
import { connectDB } from "./lib/db.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is up and running"
    });
});

app.get("/books", (req, res) => {
    res.status(200).json({
        message: "This is books endpoint"
    });
});

if(ENV.NODE_ENV === "production" && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "../../frontend/dist"))); 
    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
    });
}

const startServer = async () => {
    await connectDB();
    app.listen(ENV.PORT || 3000, () => {
        console.log(`Server is running on port ${ENV.PORT || 3000}`);
    });
}

if (!process.env.VERCEL) {
    startServer();
}

export default app;