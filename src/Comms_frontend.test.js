/**
 * @jest-environment jsdom
 */

//const { describe } = require('yargs');
const {
    getAuthorType,
    checkLoginStatus,
    postMessage,
    deleteMessage,
    updateMessage,
    replyToMessage,
    uploadPhoto,
    uploadVideo,
    viewMessages,
    toggleMessages
  } = require('./Comms_frontend');
  
  global.fetch = jest.fn();
  global.alert = jest.fn();
  global.prompt = jest.fn();
  global.console.error = jest.fn();
  global.console.log = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <form id="messageForm">
        <textarea id="messageBody"></textarea>
      </form>
      <div id="confirmationMessage" style="display:none;"></div>
      <div id="messageList" style="display:block;"></div>
      <button class="hide-btn">Hide Messages</button>
    `;
  });

  describe("getAuthorType and toggleMessages", () => {
    test("returns correct types", () => {
      expect(getAuthorType(1)).toBe("Coach");
      expect(getAuthorType(2)).toBe("Parent");
      expect(getAuthorType(3)).toBe("Player");
      expect(getAuthorType(999)).toBe("User");
    });

    test("toggles visibility", () => {
      const list = document.getElementById("messageList");
      const btn = document.querySelector(".hide-btn");
  
      toggleMessages();
      expect(list.style.display).toBe("none");
      expect(btn.textContent).toBe("View Messages");
  
      toggleMessages();
      expect(list.style.display).toBe("block");
      expect(btn.textContent).toBe("Hide Messages");
    });
  });

  describe("checkLoginStatus", () => {
    test("redirects on 401", async () => {
      delete window.location;
      window.location = { href: "" };
  
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 401 })
      });
  
      const result = await checkLoginStatus();
      expect(result).toBe(false);
      expect(window.location.href).toContain("login.html");
    });
  
    test("returns true on valid session", async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 200 })
      });
  
      expect(await checkLoginStatus()).toBe(true);
    });
  
    test("returns false on network error", async () => {
      fetch.mockRejectedValueOnce(new Error("fail"));
      expect(await checkLoginStatus()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("postMessage", () => {
    test("alerts if empty", async () => {
      await postMessage();
      expect(alert).toHaveBeenCalledWith("Message cannot be empty.");
    });
  
    test("successful post shows confirmation", async () => {
      document.getElementById("messageBody").value = "Hello";
  
      fetch
        .mockResolvedValueOnce({ ok: true }) 
        .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) }) 
        .mockResolvedValueOnce({ json: async () => ({ name: "John" }) }); 
  
      await postMessage();
  
      expect(document.getElementById("confirmationMessage").style.display).toBe("block");
    });
  
    test("failed post alerts error", async () => {
      document.getElementById("messageBody").value = "Hello";
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failure" })
      });
  
      await postMessage();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Failure"));
    });
  
    test("network error alert", async () => {
      document.getElementById("messageBody").value = "Hello";
      fetch.mockRejectedValueOnce(new Error("Network"));
  
      await postMessage();
      expect(alert).toHaveBeenCalledWith("Network error. Please try again.");
    });
  });

  describe("deleteMessage", () => {
    test("cancels if user declines confirm()", async () => {
      confirm.mockReturnValueOnce(false);
      await deleteMessage("123");
      expect(fetch).not.toHaveBeenCalled();
    });
  
    test("successful delete calls viewMessages", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      await deleteMessage("123");
      expect(fetch).toHaveBeenCalled();
    });
  
    test("failed delete alerts error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Delete failed" })
      });
  
      await deleteMessage("123");
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Delete failed"));
    });
  
    test("network error alerts", async () => {
      fetch.mockRejectedValueOnce(new Error("Network"));
      await deleteMessage("123");
      expect(alert).toHaveBeenCalledWith("Network error. Please try again.");
    });
  });
  
  describe("updateMessage", () => {
    test("cancel if no input", async () => {
      prompt.mockReturnValueOnce("");
      await updateMessage("1");
      expect(fetch).not.toHaveBeenCalled();
    });
  
    test("successful update calls viewMessages", async () => {
      prompt.mockReturnValueOnce("New text");
      fetch.mockResolvedValueOnce({ ok: true });
      await updateMessage("1");
      expect(fetch).toHaveBeenCalled();
    });
  
    test("failed update alerts", async () => {
      prompt.mockReturnValueOnce("error");
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Bad update" })
      });
  
      await updateMessage("1");
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Bad update"));
    });
  
    test("network error alerts", async () => {
      prompt.mockReturnValueOnce("msg");
      fetch.mockRejectedValueOnce(new Error("Network"));
      await updateMessage("1");
      expect(alert).toHaveBeenCalledWith("Network error. Please try again.");
    });
  });
  
  describe("replyToMessage", () => {
    test("no reply cancels", async () => {
      prompt.mockReturnValueOnce("");
      await replyToMessage("1");
      expect(fetch).not.toHaveBeenCalled();
    });
  
    test("successful reply calls viewMessages", async () => {
      prompt.mockReturnValueOnce("Reply!");
      fetch.mockResolvedValueOnce({ ok: true });
      await replyToMessage("1");
      expect(fetch).toHaveBeenCalled();
    });
  
    test("failed reply alerts", async () => {
      prompt.mockReturnValueOnce("Reply");
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Reply error" })
      });
  
      await replyToMessage("1");
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Reply error"));
    });
  
    test("network error alerts", async () => {
      prompt.mockReturnValueOnce("Reply");
      fetch.mockRejectedValueOnce(new Error("Network"));
      await replyToMessage("1");
      expect(alert).toHaveBeenCalledWith("Network error. Please try again.");
    });
  });

  describe("uploadPhoto", () => {
    test("alerts when no file selected", async () => {
      await uploadPhoto();
      expect(alert).toHaveBeenCalledWith("Please select a photo to upload.");
    });
  
    test("successful photo upload", async () => {
      const input = document.getElementById("photoInput");
      Object.defineProperty(input, "files", {
        value: [new Blob(["test"], { type: "image/png" })]
      });
  
      fetch
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) })
        .mockResolvedValueOnce({ json: async () => ({ name: "John" }) });
  
      await uploadPhoto();
      expect(alert).toHaveBeenCalledWith("Photo uploaded successfully.");
    });
  
    test("failed upload alerts", async () => {
      const input = document.getElementById("photoInput");
      Object.defineProperty(input, "files", {
        value: [new Blob(["test"], { type: "image/png" })]
      });
  
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Upload failed" })
      });
  
      await uploadPhoto();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Upload failed"));
    });
  });
  
  describe("uploadVideo", () => {
    test("alerts when no file selected", async () => {
      await uploadVideo();
      expect(alert).toHaveBeenCalledWith("Please select a video to upload.");
    });
  
    test("successful video upload", async () => {
      const input = document.getElementById("videoInput");
      Object.defineProperty(input, "files", {
        value: [new Blob(["test"], { type: "video/mp4" })]
      });
  
      fetch
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) })
        .mockResolvedValueOnce({ json: async () => ({ name: "John" }) });
  
      await uploadVideo();
      expect(alert).toHaveBeenCalledWith("Video uploaded successfully.");
    });
  
    test("failed upload alerts", async () => {
      const input = document.getElementById("videoInput");
      Object.defineProperty(input, "files", {
        value: [new Blob(["test"], { type: "video/mp4" })]
      });
  
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Video fail" })
      });
  
      await uploadVideo();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Video fail"));
    });
  });

  describe("viewMessages", () => {
    test("renders messages, reply + photo + video + edited", async () => {
      const sample = {
        messages: [
          {
            _id: "1",
            author: "John",
            authorType: 1,
            message: "Hello",
            edited: true,
            dateEdited: Date.now(),
            photo: "photo.jpg",
            video: "video.mp4",
            replies: [
              { email: "test@example.com", message: "Hi!", date: Date.now() }
            ]
          }
        ]
      };
  
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => sample })
        .mockResolvedValueOnce({ json: async () => ({ name: "John" }) });
  
      await viewMessages();
  
      const list = document.getElementById("messageList");
      expect(list.innerHTML).toContain("John");
      expect(list.innerHTML).toContain("Hello");
      expect(list.innerHTML).toContain("img");
      expect(list.innerHTML).toContain("video");
      expect(list.innerHTML).toContain("reply");
    });
  
    test("server error alerts", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server down" })
      });
  
      await viewMessages();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Server down"));
    });
  
    test("network error alerts", async () => {
      fetch.mockRejectedValueOnce(new Error("Network"));
      await viewMessages();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining("Network"));
    });
  });