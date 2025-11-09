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

});