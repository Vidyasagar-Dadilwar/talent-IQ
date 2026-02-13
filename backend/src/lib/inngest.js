import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";
import { sendWelcomeEmail, sendGoodByeEmail } from "./resend.js";

export const inngest = new Inngest({ id: "talent-iq" });

const syncUser = inngest.createFunction(
    {id: "sync-user"}, 
    {event: "clerk/user.created"},
    async ({ event, step }) => {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;

        await step.run("sync-user-to-db", async () => {
            await connectDB();
            const newUser = {
                clerkId: id,
                email: email_addresses[0]?.email_address,
                name: `${first_name || ""} ${last_name || ""}`,
                profileImage: image_url
            };
            await User.create(newUser);
            return newUser;
        });

        await step.run("sync-user-to-stream", async () => {
            await upsertStreamUser({
                id: id.toString(),
                name: `${first_name || ""} ${last_name || ""}`,
                image: image_url
            });
        });

        await step.run("send-welcome-email", async () => {
             await sendWelcomeEmail(email_addresses[0]?.email_address);
        });
    }
);

const deleteUserFromDB = inngest.createFunction(
    {id: "delete-user-from-db"},
    {event: "clerk/user.deleted"},
    async ({ event, step }) => {
        const { id } = event.data;

        const userEmail = await step.run("get-user-email", async () => {
            await connectDB();
            const user = await User.findOne({ clerkId: id });
            return user?.email;
        });

        await step.run("delete-user-metadata", async () => {
            await connectDB();
            await User.deleteOne({ clerkId: id });
            await deleteStreamUser(id.toString());
        });

        if (userEmail) {
            await step.run("send-goodbye-email", async () => {
                await sendGoodByeEmail(userEmail);
            });
        }
    }
);

const updateUser = inngest.createFunction(
    {id: "update-user"},
    {event: "clerk/user.updated"},
    async ({ event, step }) => {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses[0]?.email_address;
        const name = `${first_name || ""} ${last_name || ""}`;

        await step.run("update-user-in-db", async () => {
            await connectDB();
            await User.updateOne({ clerkId: id }, {
                email: email,
                name: name,
                profileImage: image_url
            });
        });

        await step.run("update-user-in-stream", async () => {
            await upsertStreamUser({
                id: id.toString(),
                name: name,
                image: image_url
            });
        });
    }
);

export const functions = [syncUser, deleteUserFromDB, updateUser];