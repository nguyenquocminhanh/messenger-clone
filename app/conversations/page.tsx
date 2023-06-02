"use client"

import clsx from "clsx";

// analyse params to get conversationId
import useConversation from "../hooks/useConversation";
import EmptyState from "../components/EmptyState";

const Home = () => {
    const { isOpen } = useConversation();

    return(
        <div className={clsx(
            `lg:pl-80
            h-full
            lgLblock`,
            isOpen ? 'block' : 'hidden'
        )}>
            <EmptyState />
        </div>
    )
}

export default Home;