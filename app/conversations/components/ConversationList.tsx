"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md"
import ConversationBox from "./ConversationBox";
import GroupChatModal from "@/app/components/GroupChatModal";
import { User } from "prisma/prisma-client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";
import { AiOutlineSearch } from "react-icons/ai";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useOtherUser from "@/app/hooks/useOtherUser";

interface ConversationListProps {
    initialItems: FullConversationType[];
    users: User[]
}

const ConversationList: React.FC<ConversationListProps> = ({
    initialItems,
    users
}) => {
    const session = useSession();
    const [items, setItems] = useState(initialItems);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const router = useRouter();

    const { conversationId, isOpen } = useConversation();

    const {
        register,
        handleSubmit,
        watch,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            searchKeyWord: '',
        }
    });

    const searchKeyWord = watch('searchKeyWord');

    useEffect(() => {
        if (searchKeyWord.length === 0) {
            setItems(initialItems);
            return;
        }
        const allItems = initialItems;

        const filteredConversation = allItems.filter((conversation) => {
            let conversationName;
            if (conversation.isGroup) {
                conversationName = conversation.name
            } else {
                conversationName = conversation.users.filter(user => user.name !== session.data?.user?.name)[0].name;
            }
            return conversationName?.toLowerCase().includes(searchKeyWord.toLowerCase());
        })

        setItems(filteredConversation);
    }, [searchKeyWord])

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (searchKeyWord.length === 0) {
            setItems(initialItems);
            return;
        }
        const allItems = initialItems;

        const filteredConversation = allItems.filter((conversation) => {
            let conversationName;
            if (conversation.isGroup) {
                conversationName = conversation.name
            } else {
                conversationName = conversation.users.filter(user => user.name !== session.data?.user?.name)[0].name;
            }
            return conversationName?.toLowerCase().includes(searchKeyWord.toLowerCase());
        })

        setItems(filteredConversation);
    }

    const pusherKey = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    useEffect(() => {
        if(!pusherKey) {
            return;
        }

        pusherClient.subscribe(pusherKey);

        const newConversationHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                if (find(current, { id: conversation.id })) {
                    return current
                }

                return [conversation, ...current];
            })
        }

        const updateConversationHandler = (conversation: FullConversationType) => {
            setItems((current) => 
                current.map((currentConversation) => {
                    if (currentConversation.id === conversation.id) {
                        return {
                            ...currentConversation,
                            // update messages
                            messages: conversation.messages
                        }
                    }

                    return currentConversation;
                })
            )
        }

        const deleteConversationHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                return [...current.filter((conver) => conver.id !== conversation.id)]
            })

            if (conversationId === conversation.id) {
                router.push('/conversations');
            }
        };

        pusherClient.bind('conversation:new', newConversationHandler);
        pusherClient.bind('conversation:update', updateConversationHandler);
        pusherClient.bind('conversation:remove', deleteConversationHandler);

        return () => {
            pusherClient.unsubscribe(pusherKey);
            pusherClient.unbind('conversation:new', newConversationHandler);
            pusherClient.unbind('conversation:update', updateConversationHandler);
            pusherClient.unbind('conversation:remove', deleteConversationHandler);
        }
    }, [pusherKey, conversationId, router]);

    return (
        <>
            <GroupChatModal
                users={users}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <aside className={clsx(`
                fixed
                inset-y-0
                pb-20
                lg:pb-0
                lg:left-20
                lg:w-80
                lg:block
                overflow-y-auto
                border-r
                border-gray-200
            `,
                isOpen ? 'hidden' : 'block w-full left-0'
            )}>
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="
                            text-2xl
                            font-bold
                            text-neitral-800
                        ">
                            Messages
                        </div>

                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="
                                rounded-full
                                p-2
                                bg-gray-100
                                text-gray-600
                                cursor-pointer
                                hover:opacity-75
                                transition
                            ">
                            <MdOutlineGroupAdd size={20}/>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-100 rounded-full p-2 flex items-center">
                        <input id="searchKeyWord" {...register("searchKeyWord", { required: true })} type="text" className="bg-transparent outline-none ml-2 flex-grow" placeholder="Search..."/>
                        <button className="bg-transparent border-none">
                            <AiOutlineSearch />
                        </button>
                    </form>

                    {items.map((item) => (
                        <ConversationBox
                            key={item.id}
                            data={item}
                            selected={conversationId === item.id}
                        />
                    ))}

                </div>
            </aside>
        </>
    )
}

export default ConversationList;