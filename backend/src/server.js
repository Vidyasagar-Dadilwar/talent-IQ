import express from "express";
import { ENV } from "./lib/env.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is up and running"
    });
});

app.listen(ENV.PORT || 3000, () => {
    console.log(`Server is running on port ${ENV.PORT || 3000}`);
});