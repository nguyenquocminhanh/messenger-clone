"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Conversation, Message, User } from "prisma/prisma-client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/AvatarGroup";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface ConversationBoxProps {
    data: FullConversationType,
    selected?: boolean
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
    data,
    selected
}) => {
    const otherUser = useOtherUser(data);
    const session = useSession();
    const router = useRouter();

    const handleClick = useCallback(() => {
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    const lastMessage = useMemo(() => {
        const messages = data.messages || [];

        return messages[messages.length - 1];
    }, [data.messages]);

    const userEmail = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    const hasSeen = useMemo(() => {
        if (!lastMessage) {
            return false;
        }
        const seenArray = lastMessage.seen || [];

        if (!userEmail) {
            return false
        }

        return seenArray.filter((user) => user.email === userEmail).length !== 0;
    }, [userEmail, lastMessage]);

    const lastMessageText = useMemo(() => {
        if (lastMessage?.image) {
            return 'Sent an image';
        }

        if (lastMessage?.body) {
            return lastMessage.body;
        }

        return "Started a conversation";
    }, [lastMessage])

    return (
        <div onClick={handleClick} className={
            clsx(`
                w-full
                relative
                flex
                items-center
                space-x-3
                hover:bg-neutral-100
                rounded-lg
                transition
                cursor-pointer
                p-3
                pr-8
            `,
                selected ? 'bg-neutral-100' : 'bg-white'
            )
        }>
            {data.isGroup ? 
                <AvatarGroup users={data.users}/> 
                : 
                <Avatar user={otherUser}/>
                
            }

            <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-1
                    ">
                        <p className="
                            text-md
                            font-medium
                            text-gray-900
                        ">
                            {data.name || otherUser.name}
                        </p>

                        {lastMessage?.createdAt && (
                            <p className="
                                text-xs
                                text-gray-400
                                font-light
                            ">
                                {format(new Date(lastMessage.createdAt), 'p')}
                            </p>
                        )}
                    </div>

                    <p  className={clsx(`
                        truncate
                        text-sm
                    `,
                            hasSeen ? 'text-gray-500' : 'text-black font-medium'
                    )}>
                        {lastMessageText}
                    </p>
                        
         
                </div>
            </div>

            {!hasSeen && lastMessage && (
                <span className="
                    absolute
                    block
                    rounded-full
                    bg-sky-500
                    top-1/2
                    right-2
                    transform
                    -translate-y-1/2
                    h-2
                    w-2
                    md:h-3
                    md:w-3
                "/>
            )}
        </div>
    )
}

export default ConversationBox;