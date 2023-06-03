import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    conversationId?: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    try {
        const { conversationId } = params;
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true
            }
        });

        if(!existingConversation) {
            return new NextResponse('Invalid ID', { status: 400 })
        }

        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            }
        })

        existingConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(user.email, 'conversation:remove', existingConversation)
            }
        });

        return NextResponse.json(deletedConversation);
    } catch (error: any) {
        console.log(error, 'ERROR_CONVERSATION_DELETE');
        return new NextResponse('Internal Error', { status: 500 });
    }
}


export async function PUT(
    request: Request,
    { params }: { params: IParams }
) {
    try {
        const { conversationId } = params;
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {
            name,
            members,
            isGroup
        } = body;

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (isGroup) {
            const updatedConversation = await prisma.conversation.update({
                where: {
                    id: conversationId
                },
                include: {
                    users: true,
                    messages: true
                },
                data: {
                    users: {
                        // add userId Id to userIds
                        connect: [
                            ...members.map((member: { value: string }) => ({
                                id: member.value
                            }))
                        ]
                    }
                }  
            });

            updatedConversation.users.forEach((user) => {
                if (user.email) {
                    pusherServer.trigger(user.email, 'conversation:new', updatedConversation);
                }
            })

            return NextResponse.json(updatedConversation);
        }

        return new NextResponse('Internal Error', { status: 500 })
    } catch (error: any) {
        console.log(error, 'ERROR_CONVERSATION_DELETE');
        return new NextResponse('Internal Error', { status: 500 });
    }
}