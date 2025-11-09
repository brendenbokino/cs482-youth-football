/**
 * @jest-environment jsdom
 */

const {
    postMessage,
    deleteMessage,
    updateMessage,
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
  
  describe('getAuthorType & toggleMessages', () => {
    test('toggleMessages hides and shows list correctly', () => {
      const list = document.getElementById('messageList');
      const btn = document.querySelector('.hide-btn');
  
      toggleMessages();
      expect(list.style.display).toBe('none');
      expect(btn.textContent).toBe('View Messages');
  
      toggleMessages();
      expect(list.style.display).toBe('block');
      expect(btn.textContent).toBe('Hide Messages');
    });
  });
  
  

  