const gameDao = require('../model/GameDao.js'); // Assuming GameDao exports an object with readAll()

// Will leverage this package for our game calendar display 
// https://fullcalendar.io/demos


// #### 1. Installation
// ```bash
// npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction
// ```

// #### 2. Data Transformation
// Transform game documents into FullCalendar event format:
// ```javascript

// #### 3. Calendar Initialization
// Note: FullCalendar imports won't work in Node without bundling
// These will be undefined in Node but should work in browser with bundler
let Calendar, dayGridPlugin, interactionPlugin;
try {
    const fcCore = require('@fullcalendar/core');
    const fcDayGrid = require('@fullcalendar/daygrid');
    const fcInteraction = require('@fullcalendar/interaction');
    Calendar = fcCore.Calendar;
    dayGridPlugin = fcDayGrid.default || fcDayGrid;
    interactionPlugin = fcInteraction.default || fcInteraction;
} catch (e) {
    // In browser or if modules not available, these will be handled by bundler
    console.log('FullCalendar modules not available - requires browser bundling');
}

async function loadGameChats(gameId) {
    try {
        const res = await fetch(`/gameChat/${gameId}`);
        const data = await res.json();
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        data.chats.forEach(chat => {
            const chatDiv = document.createElement('div');
            chatDiv.innerHTML = `<strong>${chat.author}:</strong> ${chat.message}`;
            chatMessages.appendChild(chatDiv);
        });
    } catch (error) {
        console.error('Error loading game chats:', error);
    }
}

document.getElementById('chatForm').onsubmit = async function (e) {
    e.preventDefault();
    const chatMessage = document.getElementById('chatMessage').value.trim();
    if (!chatMessage) return;

    try {
        const res = await fetch(`/gameChat/${currentGameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: chatMessage }),
        });

        if (res.ok) {
            document.getElementById('chatMessage').value = '';
            loadGameChats(currentGameId);
        } else {
            const result = await res.json();
            alert(result.error || "Failed to send message.");
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
    }
}

class CalendarManager {
    
    async makeCalendar() {
        try {
            // 1. Fetch all games from the database
            const games = await gameDao.readAll();

            const calendarEvents = games.map(game => ({
                title: `${game.team1} vs ${game.team2}`,
                start: new Date(game.date).toISOString(), 
                extendedProps: {
                    location: game.location,
                    team1: game.team1,
                    team2: game.team2,
                    startTime: game.date,
                    endTime: new Date(new Date(game.date).getTime() + 2 * 60 * 60 * 1000), 
                }
            }));

            if (!Calendar || !dayGridPlugin || !interactionPlugin) {
                throw new Error('FullCalendar modules not available');
            }

            const calendar = new Calendar(document.getElementById('calendar'), {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                events: calendarEvents,
                eventClick: function(info) {
                    // Display game details modal
                    showGameDetails(info.event.extendedProps);
                },
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }
            });
            
            calendar.render();

        } catch (error) {
            console.error("Error creating calendar:", error);
            return [];
        }
    }

    // You can add other utility methods here, like getGames()
    getGames() {
        return this.games;
    }
}

function showGameDetails(game) {
    const now = new Date();
    const gameStart = new Date(game.startTime);
    const gameEnd = new Date(game.endTime);

    const liveGameChat = document.getElementById('liveGameChat');
    if (now >= gameStart && now <= gameEnd) {
        liveGameChat.style.display = 'block';
        document.getElementById('chatForm').style.display = 'block';
    } else {
        liveGameChat.style.display = 'block';
        document.getElementById('chatForm').style.display = 'none';
    }

    loadGameChats(game._id);
}

module.exports = CalendarManager; // Export the class for use elsewhere
