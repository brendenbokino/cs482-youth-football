/**
 * @jest-environment jsdom
 */

const { postMessage, deleteMessage, updateMessage, viewMessages, toggleMessages } = require('../src/Comms_frontend');

global.fetch = jest.fn();
global.alert = jest.fn();

describe('Comms Frontend', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div>
                <form id="messageForm">
                    <textarea id="messageBody"></textarea>
                </form>
                <div id="confirmationMessage" style="display: none;"></div>
                <div id="messageList"></div>
                <button class="hide-btn"></button>
            </div>
        `;
        fetch.mockClear();
    });

    test('postMessage should display confirmation message on success', async () => {
        fetch.mockResolvedValueOnce({ ok: true });

        document.getElementById('messageBody').value = 'Test Message';
        await postMessage();

        expect(fetch).toHaveBeenCalledWith('/comms/postMessage', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ message: 'Test Message' }),
        }));
        expect(document.getElementById('confirmationMessage').style.display).toBe('block');
    });

    test('deleteMessage should call fetch with DELETE method', async () => {
        fetch.mockResolvedValueOnce({ ok: true });

        await deleteMessage('12345');

        expect(fetch).toHaveBeenCalledWith('/comms/deleteMessage/12345', expect.objectContaining({
            method: 'DELETE',
        }));
    });

    test('updateMessage should call fetch with PUT method', async () => {
        fetch.mockResolvedValueOnce({ ok: true });
        global.prompt = jest.fn().mockReturnValue('Updated Message');

        await updateMessage('12345');

        expect(fetch).toHaveBeenCalledWith('/comms/updateMessage/12345', expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ message: 'Updated Message' }),
        }));
    });

    test('viewMessages should populate messageList with messages', async () => {
        const mockMessages = [
            { _id: '1', author: 'User1', authorType: 1, message: 'Hello', edited: false },
            { _id: '2', author: 'User2', authorType: 2, message: 'Hi', edited: true, dateEdited: new Date() },
        ];
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ messages: mockMessages }) });
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ name: 'User1' }) });

        await viewMessages();

        const messageList = document.getElementById('messageList');
        expect(messageList.children.length).toBe(2);
        expect(messageList.innerHTML).toContain('Hello');
        expect(messageList.innerHTML).toContain('Hi');
    });

    test('toggleMessages should toggle visibility of messageList', () => {
        const messageList = document.getElementById('messageList');
        const hideBtn = document.querySelector('.hide-btn');

        messageList.style.display = 'none';
        toggleMessages();
        expect(messageList.style.display).toBe('block');
        expect(hideBtn.textContent).toBe('Hide Messages');

        toggleMessages();
        expect(messageList.style.display).toBe('none');
        expect(hideBtn.textContent).toBe('View Messages');
    });
});
