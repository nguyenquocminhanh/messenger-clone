"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { User } from "prisma/prisma-client";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Input from "./inputs/Input";
import Select from "./inputs/Select";
import Button from "./Button";

interface InviteModalProps {
    isOpen?: boolean;
    onClose: () => void;
    users: User[],
    conversationName?: string,
    conversationId?: string
}

// create group modal
const InviteModal: React.FC<InviteModalProps> = ({
    isOpen,
    onClose,
    users,
    conversationName,
    conversationId
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: conversationName,
            members: []
        }
    });

    const members = watch('members');

    const onsubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios.put(`/api/conversations/${conversationId}`, {
            ...data,
            isGroup: true
        })
        .then(() => {
            // triggers a re-render of the current page within the Next.js application.
            router.refresh();
            onClose();
            toast.success('Invited successfully')
        })
        .catch(() => toast.error('Something went wrong'))
        .finally(() => setIsLoading(false))
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onsubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900-10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">
                            Invite member to group chat
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Invite member to group chat with more than 2 people
                        </p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input
                                register={register}
                                label="Group Name"
                                id="name"
                                disabled={true}
                                required
                                errors={errors}
                            />

                            <Select
                                disabled={isLoading}
                                label="Members"
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.name
                                }))}
                                onChange={(value) => setValue('members', value, {
                                    shouldValidate: true
                                })}
                                value={members}
                            />
                        </div>
                    </div>
                </div>

                <div className="
                    mt-6
                    flex
                    items-center
                    justify-end
                    gap-x-6
                ">
                    <Button
                        disabled={isLoading}
                        onClick={onClose}
                        type="button"
                        secondary
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={isLoading}
                        type="submit"
                    >
                        Invite
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default InviteModal;