"use client";

import Avatar from "@/app/components/Avatar";
import useOtherUser from "@/app/hooks/useOtherUser";
import Link from "next/link";
import { Conversation, User } from "prisma/prisma-client";
import { useMemo, useState } from "react";
import { HiChevronLeft } from 'react-icons/hi'
import { HiEllipsisHorizontal } from "react-icons/hi2";
import ProfileDrawer from "./ProfileDrawer";
import AvatarGroup from "@/app/components/AvatarGroup";
import useActiveList from "@/app/hooks/useActiveList";

interface HeaderProps {
    conversation: Conversation & {
        users: User[];
    };
    allUsers: User[]
}

const Header: React.FC<HeaderProps> = ({
    conversation,
    allUsers
}) => {
    const otherUser = useOtherUser(conversation);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { members } = useActiveList();
    const isActive = members.indexOf(otherUser?.email!) !== -1;

    const outOfGroupUsers = useMemo(() => {
        if (allUsers.length > 0 && conversation.users.length > 0) {
            return allUsers.filter((user) => !conversation.users.some(item => item.id === user.id));
        }
        return [];
    }, [allUsers, conversation.users])

    const statusText = useMemo(() => {
        if (conversation.isGroup) {
            return `${conversation.users.length} members`;
        } 

        return isActive ? 'Active' : 'Offline';
    }, [conversation, isActive])

    return (
        <>
            <ProfileDrawer
                data={conversation}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                outOfGroupUsers={outOfGroupUsers}
            />

            <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
                <div className="flex gap-3 items-center">
                    {/* only mobile screen */}
                    <Link href="/conversations" className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer">
                        <HiChevronLeft size={32}/>
                    
                    </Link>

                    {
                        conversation.isGroup ? (
                            <AvatarGroup users={conversation.users}/>
                        ) : (
                            <Avatar user={otherUser}/>
                        )
                    }   
                    <div className="flex flex-col">
                        <div>
                            {conversation.name || otherUser.name}
                        </div>

                        <div className="text-sm font-light text-neutral-500">
                            {statusText}
                        </div>
                    </div>
                </div>

                <HiEllipsisHorizontal onClick={() => setDrawerOpen(true)} size={32} className="text-sky-500 cursor-pointer hover:text-sky-600 transition"/>
            </div>
        </>
    )
}

export default Header;