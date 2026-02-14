import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
    try {
        const {problem, difficulty} = req.body;
        const userId = req.user_id;
        const clerkId = req.user.clerkId;

        if(!problem || !difficulty){
            return res.status(400).json({msg: "Problem and difficulty are required"});
        }

        // generate unique callId for stream video

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // create session in db
        const session = await Session.create({
            problem,
            difficulty,
            host: userId,
            callId 
        });


        // create stream video call 
        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom: {problem, difficulty, sessionId:session._id.toString()}
            }
        });

        
        // chat messaging
        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        });
        await channel.create();

        res.status(201).json({session});
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({msg: "Internal server error"});
    }
}

export async function getActiveSessions(req, res) {
    try {
        const sessions = await Session.find({status: "active"})
        .populate("host", "name profileImage email clerkId")
        .sort({createdAt: -1})
        .limit(20);  // top 20 latest

        res.status(200).json({sessions});
    } catch (error) {
        console.error("Error fetching active sessions:", error);
        res.status(500).json({msg: "Internal server error"});
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user_id;

        const sessions = await Session.find({
            status:"completed",
            $or: [
                {host: userId}, {participants: userId}
            ]
        })
        // .populate("host", "name profileImage email clerkId")
        .sort({createdAt: -1})
        .limit(20);

        res.status(200).json({sessions});
    } catch (error) {
        console.error("Error fetching my recent sessions:", error);
        res.status(500).json({msg: "Internal server error"});
    }
}

export async function getSessionById(req, res) {
    try {
        const { id } = req.params;
        const session = await Session.findById(id)
        .populate("host", "name profileImage email clerkId")
        .populate("participants", "name profileImage email clerkId");

        if(!session) {
            return res.status(404).json({msg: "Session not found"});
        }

        res.status(200).json({session});
    } catch (error) {
        console.error("Error fetching session by ID:", error);
        res.status(500).json({msg: "Internal server error"});
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user_id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);  
        if(!session) {
            return res.status(404).json({msg: "Session not found"});
        }

        if(session.status === "completed") {
            return res.status(400).json({msg: "Session already completed"});
        }

        if(session.participants) {
            return res.status(409).json({msg: "Session already full"});
        }

        if(session.host.toString() === userId.toString()) {
            return res.status(400).json({msg: "You are already host of this session. You cannot     join as participant"});
        }

        session.participants = userId;
        await session.save();

        // add participant to stream video call
        await streamClient.video.call("default", session.callId).addMembers([clerkId]);

        // add participant to stream chat
        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({session});
    } catch (error) {
        console.error("Error joining session:", error);
        res.status(500).json({msg: "Internal server error"});
    } 
}

export async function endSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);
        if(!session) {
            return res.status(404).json({msg: "Session not found"});
        }

        if(session.host.toString() !== userId.toString()) {
            return res.status(403).json({msg: "Only host can end the session"});
        }

        if(session.status === "completed") {
            return res.status(400).json({msg: "Session already completed"});
        }

        // delete stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({hard: true});


        // delete stream chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({session, msg: "Session ended successfully"});
    } catch (error) {
        console.error("Error ending session:", error);
        res.status(500).json({msg: "Internal server error"});
    }
}