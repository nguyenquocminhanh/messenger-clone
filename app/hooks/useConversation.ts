import { useParams } from "next/navigation";
import { useMemo } from "react";

// analyse params to get conversationId
const useConversation = () => {
    const params = useParams();

    const conversationId = useMemo(() => {
        if (!params?.conversationId) {
            return '';
        }

        return params.conversationId as string;
    }, [params?.conversationId]);

    // true when there exists conversationId, else false
    const isOpen = useMemo(() => !!conversationId, [conversationId]);

    return useMemo(() => ({
        isOpen,
        conversationId
    }), [isOpen, conversationId])
}

export default useConversation;