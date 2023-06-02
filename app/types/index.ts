import { Conversation, Message, User } from "@prisma/client";

export type FullMessageType = Message & {
    // relational
    sender: User,
    seen: User[]
};

export type FullConversationType = Conversation & {
    // relational
    users: User[],
    messages: FullMessageType[]
}