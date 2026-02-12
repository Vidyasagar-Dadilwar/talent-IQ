import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from '@clerk/express'

import { fileURLToPath } from 'url';
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}));

app.use(clerkMiddleware()); // this add auth field to request obj: req.auth() (to verify user is authenticated)

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        msg: "Server is up and running"
    });
});



if(ENV.NODE_ENV === "production" && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "../../frontend/dist"))); 
    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
    });
}

await connectDB();

if (!process.env.VERCEL) {
    app.listen(ENV.PORT || 3000, () => {
        console.log(`Server is running on port ${ENV.PORT || 3000}`);
    });
}

export default app;