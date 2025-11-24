
const {
  postMessage,
  viewMessages,
  updateMessage,
  deleteMessage,
  addReply,
  uploadMedia
} = require('./Comms_frontend');

describe("Simple Message Functions", () => {
  let user;

  beforeEach(() => {
      user = { name: "Loren", permission: 1, email: "loren@example.com" };

      const messages = require('./Comms_frontend').viewMessages();
      messages.length = 0; 
  });

  test("postMessage creates a new message", () => {
      const msg = postMessage(user, "Hello World");
      expect(msg.author).toBe(user.name);
      expect(msg.message).toBe("Hello World");
      expect(msg.replies.length).toBe(0);
  });

  test("postMessage fails on empty message", () => {
      expect(() => postMessage(user, "")).toThrow("Message cannot be empty.");
  });

  test("viewMessages returns all messages", () => {
      postMessage(user, "Msg 1");
      postMessage(user, "Msg 2");

      const allMessages = viewMessages();
      expect(allMessages.length).toBe(2);
      expect(allMessages[0].message).toBe("Msg 1");
      expect(allMessages[1].message).toBe("Msg 2");
  });

  test("updateMessage updates a message", () => {
      const msg = postMessage(user, "Original");
      const updated = updateMessage(user, msg.id, "Updated");
      expect(updated.message).toBe("Updated");
  });

  test("updateMessage fails if not author", () => {
      const msg = postMessage(user, "Original");
      const otherUser = { name: "Bob", permission: 2, email: "bob@example.com" };
      expect(() => updateMessage(otherUser, msg.id, "Hack")).toThrow("Not authorized");
  });

  test("deleteMessage removes a message", () => {
      const msg = postMessage(user, "To be deleted");
      const deleted = deleteMessage(user, msg.id);
      expect(deleted.message).toBe("To be deleted");
      expect(viewMessages().length).toBe(0);
  });

  test("addReply adds a reply to a message", () => {
      const msg = postMessage(user, "Parent message");
      const updatedMsg = addReply(user, msg.id, "This is a reply");
      expect(updatedMsg.replies.length).toBe(1);
      expect(updatedMsg.replies[0].message).toBe("This is a reply");
      expect(updatedMsg.replies[0].email).toBe(user.email);
  });

  test("uploadMedia creates a message with photo", () => {
      const msg = uploadMedia(user, "Check this photo", "/uploads/photo.jpg", "photo");
      expect(msg.photoUrl).toBe("/uploads/photo.jpg");
      expect(msg.videoUrl).toBeNull();
  });

  test("uploadMedia creates a message with video", () => {
      const msg = uploadMedia(user, "Check this video", "/uploads/video.mp4", "video");
      expect(msg.videoUrl).toBe("/uploads/video.mp4");
      expect(msg.photoUrl).toBeNull();
  });
});
