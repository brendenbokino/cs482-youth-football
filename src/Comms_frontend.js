// Iteration 3
// Loren Kim

const messages = [];

function validateMessage(message) {
    return typeof message === "string" && message.trim().length > 0;
}

function postMessage(user, messageText) {
    if (!validateMessage(messageText)) {
        throw new Error("Message cannot be empty.");
    }

    const newMessage = {
        id: messages.length + 1, // im using this as a placeholder for the post
        author: user.name,
        authorType: user.permission,
        message: messageText,
        replies: [],
        photoUrl: null,
        videoUrl: null,
    };

    messages.push(newMessage);
    return newMessage;
}

function viewMessages() {
    return messages;
}

function updateMessage(user, messageId, newMessageText) {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.author !== user.name) throw new Error("Not authorized");
    if (!validateMessage(newMessageText)) throw new Error("Message cannot be empty");

    msg.message = newMessageText;
    return msg;
}

function deleteMessage(user, messageId) {
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) throw new Error("Message not found");
    if (messages[index].author !== user.name) throw new Error("Not authorized");

    const deleted = messages.splice(index, 1)[0];
    return deleted;
}

function addReply(user, messageId, replyText) {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) throw new Error("Message not found");
    if (!validateMessage(replyText)) throw new Error("Reply cannot be empty");

    const reply = {
        email: user.email,
        message: replyText,
        date: new Date(),
    };

    msg.replies.push(reply);
    return msg;
}

function uploadMedia(user, messageText, mediaUrl, type = "photo") {
    const newMessage = {
        id: messages.length + 1,
        author: user.name,
        authorType: user.permission,
        message: messageText || "(no message)",
        replies: [],
        photoUrl: type === "photo" ? mediaUrl : null,
        videoUrl: type === "video" ? mediaUrl : null,
    };
    messages.push(newMessage);
    return newMessage;
}

module.exports = {
    postMessage,
    viewMessages,
    updateMessage,
    deleteMessage,
    addReply,
    uploadMedia,
};
