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



class CalendarManager {
    
    async makeCalendar() {
        try {
            // 1. Fetch all games from the database
            const games = await gameDao.readAll();

            

            const calendarEvents = games.map(game => ({
                title: `${game.team1} vs ${game.team2}`,
                start: game.date,
                extendedProps: {
                    location: game.location,
                    team1: game.team1,
                    team2: game.team2,
                    startTime: game.startTime,
                    endTime: game.endTime,
                    link: game.link
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
            // In a real application, you might want to re-throw or return an empty array
            return [];
        }
    }

    // You can add other utility methods here, like getGames()
    getGames() {
        return this.games;
    }
}

module.exports = CalendarManager; // Export the class for use elsewhere
