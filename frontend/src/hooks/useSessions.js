import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
    const result = useMutation({
        mutationKey: ["createSession"],
        mutationFn: sessionApi.createSession,
        onSuccess: () => {
            toast.success("Session created successfully");
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        },
    });

    return result;
};

export const useActiveSession = () => {
    const result = useQuery({
        queryKey: ["activeSession"],
        queryFn: sessionApi.getActiveSessions,
    });

    return result;
};

export const useMyRecentSessions = () => {
    const result = useQuery({
        queryKey: ["myRecentSessions"],
        queryFn: sessionApi.getMyRecentSessions,
    });

    return result;
};

export const useSessionById = (id) => {
    const result = useQuery({
        queryKey: ["sessionById", id],
        queryFn: () => sessionApi.getSessionById(id),
        enabled: !!id,
        refetchInterval: 5000
    });

    return result;
};

export const useJoinSession = () => {
    const result = useMutation({
        mutationKey: ["joinSession"],
        mutationFn: sessionApi.joinSession,
        onSuccess: () => {
            toast.success("Joined session successfully");
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        },
    });

    return result;
};