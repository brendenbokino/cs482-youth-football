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
  
  describe('postMessage', () => {
    test('alerts if message is empty', async () => {
      document.getElementById('messageBody').value = '  ';
      const e = { preventDefault: jest.fn() };
      await postMessage(e);
      expect(alert).toHaveBeenCalledWith('Message cannot be empty.');
    });
  
    test('successful post shows confirmation and resets form', async () => {
      document.getElementById('messageBody').value = 'Hello';
      fetch.mockResolvedValueOnce({ ok: true }); 
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) }); 
      const e = { preventDefault: jest.fn() };
  
      await postMessage(e);
  
      const confirmation = document.getElementById('confirmationMessage');
      expect(confirmation.style.display).toBe('block');
    });
  
    test('failed post alerts with error message', async () => {
      document.getElementById('messageBody').value = 'test';
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failure' }),
      });
      const e = { preventDefault: jest.fn() };
      await postMessage(e);
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Failure'));
    });
  
    test('network error triggers alert', async () => {
      document.getElementById('messageBody').value = 'test';
      fetch.mockRejectedValueOnce(new Error('Network fail'));
      const e = { preventDefault: jest.fn() };
      await postMessage(e);
      expect(alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });
  
  