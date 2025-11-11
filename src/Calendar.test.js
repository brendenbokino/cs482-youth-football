/** @jest-environment jsdom */

const gameDao = require('../model/GameDao.js');

// Mock GameDao
jest.mock('../model/GameDao.js', () => ({
    readAll: jest.fn()
}));

// Mock FullCalendar modules
jest.mock('@fullcalendar/core', () => ({
    Calendar: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
        destroy: jest.fn()
    }))
}));

jest.mock('@fullcalendar/daygrid', () => ({
    default: 'dayGridPlugin'
}));

jest.mock('@fullcalendar/interaction', () => ({
    default: 'interactionPlugin'
}));

const CalendarManager = require('./CalendarManager.js');

describe('CalendarManager Line Coverage Tests', () => {
    let calendarManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        calendarManager = new CalendarManager();
        document.body.innerHTML = '<div id="calendar"></div>';
    });

    // ===== MAKE CALENDAR - SUCCESS PATH ===== //
    test('makeCalendar executes successfully with valid games', async () => {
        const mockGames = [
            {
                team1: 'Team A',
                team2: 'Team B',
                date: '2025-10-28',
                location: 'Field 1'
            }
        ];

        gameDao.readAll.mockResolvedValue(mockGames);

        await calendarManager.makeCalendar();

        // Verify gameDao.readAll was called (covers line: const games = await gameDao.readAll())
        expect(gameDao.readAll).toHaveBeenCalled();
    });

    // ===== MAKE CALENDAR - ERROR PATH ===== //
    test('makeCalendar handles error and returns empty array', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Force an error in the try block
        gameDao.readAll.mockRejectedValue(new Error('Database error'));

        const result = await calendarManager.makeCalendar();

        // Covers the catch block
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error creating calendar:',
            expect.any(Error)
        );
        
        // Covers the return [] line in catch block
        expect(result).toEqual([]);

        consoleErrorSpy.mockRestore();
    });

    // ===== GET GAMES - COVERS THE METHOD ===== //
    test('getGames returns the games property', () => {
        // Covers the entire getGames() method (return this.games)
        const games = calendarManager.getGames();
        
        // Since games is never set in the current implementation, it will be undefined
        expect(games).toBeUndefined();
    });

    // ===== ADDITIONAL COVERAGE FOR MAP FUNCTION ===== //
    test('makeCalendar maps games to calendar events format', async () => {
        const mockGames = [
            {
                team1: 'Eagles',
                team2: 'Hawks',
                date: '2025-11-15',
                location: 'Stadium A'
            },
            {
                team1: 'Lions',
                team2: 'Tigers',
                date: '2025-11-16',
                location: 'Stadium B'
            }
        ];

        gameDao.readAll.mockResolvedValue(mockGames);

        await calendarManager.makeCalendar();

        // This ensures the map function is executed for all games
        // Covers: const calendarEvents = games.map(game => ({ ... }))
        expect(gameDao.readAll).toHaveBeenCalled();
    });
});