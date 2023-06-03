"use client"

import { User } from "prisma/prisma-client";
import UserBox from "./UserBox";
import { AiOutlineSearch } from 'react-icons/ai'
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

interface UserListProps {
    items: User[]
};

const UserList: React.FC<UserListProps> = ({
    items
}) => {
    const [users, setUsers] = useState(items);
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
            setUsers(items);
            return;
        }
        const allUsers = items;
        const filteredUsers = allUsers.filter((user) => user.name?.toLowerCase().includes(searchKeyWord.toLowerCase()))
        setUsers(filteredUsers);
    }, [searchKeyWord])

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (data.searchKeyWord.length === 0) {
            setUsers(items);
            return;
        }
        const allUsers = items;
        const filteredUsers = allUsers.filter((user) => user.name?.toLowerCase().includes(data.searchKeyWord.toLowerCase()))
        setUsers(filteredUsers);
    }

    return (
        <aside className="
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
            block
            w-full
            left-0
        ">
            <div className="px-5">
                <div className="flex-col">
                    <div className="text-2xl font-bold text-neutral-800 py-4">
                        People
                    </div> 
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-100 rounded-full p-2 flex items-center">
                    <input id="searchKeyWord" {...register("searchKeyWord", { required: true })} type="text" className="bg-transparent outline-none ml-2 flex-grow" placeholder="Search..."/>
                    <button className="bg-transparent border-none">
                        <AiOutlineSearch />
                    </button>
                </form>

                {users.map((item) => (
                    <UserBox 
                        key={item.id}
                        data={item}
                    />
                ))}
            </div>
        </aside>
    )
}

export default UserList;