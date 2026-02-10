import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";

const app = express();

const __dirname = path.resolve();

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
    app.use(express.static(path.join(__dirname, "../frontend/dist"))); 
    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
}

if (!process.env.VERCEL) {
    app.listen(ENV.PORT || 3000, () => {
        console.log(`Server is running on port ${ENV.PORT || 3000}`);
    });
}

export default app;