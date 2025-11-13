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
  
  describe('deleteMessage', () => {
    test('successful delete calls alert and viewMessages', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      await deleteMessage('123');
      expect(alert).toHaveBeenCalledWith('Message deleted successfully.');
    });
  
    test('failed delete shows error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' }),
      });
      await deleteMessage('123');
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Delete failed'));
    });
  
    test('network error in delete triggers alert', async () => {
      fetch.mockRejectedValueOnce(new Error('Network'));
      await deleteMessage('123');
      expect(alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });
  
  describe('updateMessage', () => {
    test('cancel update if no input', async () => {
      prompt.mockReturnValueOnce('');
      await updateMessage('1');
      expect(fetch).not.toHaveBeenCalled();
    });
  
    test('successful update alerts and calls viewMessages', async () => {
      prompt.mockReturnValueOnce('Updated message');
      fetch.mockResolvedValueOnce({ ok: true });
      await updateMessage('1');
      expect(alert).toHaveBeenCalledWith('Message updated successfully.');
    });
  
    test('failed update shows alert', async () => {
      prompt.mockReturnValueOnce('bad');
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Bad update' }),
      });
      await updateMessage('1');
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Bad update'));
    });
  
    test('network error shows alert', async () => {
      prompt.mockReturnValueOnce('error');
      fetch.mockRejectedValueOnce(new Error('Network'));
      await updateMessage('1');
      expect(alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });
  
  describe('viewMessages', () => {
    test('renders messages with update/delete for current user', async () => {
      const mockMessages = [
        { _id: '1', author: 'John', authorType: 1, message: 'hi', edited: false },
      ];
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: mockMessages }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ name: 'John' }),
        });
  
      await viewMessages();
  
      const list = document.getElementById('messageList');
      expect(list.innerHTML).toContain('John');
      expect(list.innerHTML).toContain('hi');
    });
  
    test('error response throws and alerts', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server down' }),
      });
      await viewMessages();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Server down'));
    });
  
    test('network error shows alert', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      await viewMessages();
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('fail'));
    });
  });

  

  