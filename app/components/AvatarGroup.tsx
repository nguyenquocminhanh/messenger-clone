"use client";

import Image from "next/image";
import { User } from "prisma/prisma-client";

interface AvatarGroupProps {
    users: User[]
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
    users
}) => {
    const slicedUsers = users.slice(0, 3);

    const poisitionMap = {
        0: 'top-0 left-[12px]',
        1: 'bottom-0',
        2: 'bottom-0 right-0'
    }

    return (
        <div className="
            relative
            h-11
            w-11
        ">
            {slicedUsers?.map((user, index) => (
                <div key={user.id}
                className={`
                    absolute
                    inline-block
                    rounded-full
                    overflow-hidden
                    h-[21px]
                    w-[21px]
                    ${poisitionMap[index as keyof typeof poisitionMap]}
                `}>
                    <Image
                        alt="Avatar"
                        fill
                        src={user?.image || '/images/placeholder.jpg'}
                    />
                </div>
            ))}
        </div>
    )
}

export default AvatarGroup;