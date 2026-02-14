import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY or STREAM_API_SECRET is missing");
    throw new Error("Missing Stream API key or secret");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);    // this is for chat feature

export const streamClient = new StreamClient(apiKey, apiSecret); // this is for video call feature

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log("Stream user upsert successfully: ", userData);
    } catch (error) {
        console.error("Error upserting stream user:", error);
        throw error;
    }
}

export const deleteStreamUser = async(userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log("Stream user delete successfully: ", userId);        
    } catch (error) {
        console.error("Error deleting stream user:", error);
        throw error;
    }
}


// todo add another method to generateToken