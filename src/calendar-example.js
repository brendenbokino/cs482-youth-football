// Example usage of the Calendar class
const Calendar = require('./Calendar.js');

// Create a new calendar instance
const footballCalendar = new Calendar();

// Add some games to the calendar
try {
    // Add games with different properties
    footballCalendar.addGame('2024-09-15', {
        team1: 'Eagles',
        team2: 'Hawks',
        time: '2:00 PM',
        location: 'Central Field',
        division: 'U12'
    });

    footballCalendar.addGame('2024-09-15', {
        team1: 'Tigers',
        team2: 'Lions',
        time: '4:00 PM',
        location: 'North Field',
        division: 'U14'
    });

    footballCalendar.addGame('2024-09-22', {
        team1: 'Eagles',
        team2: 'Tigers',
        time: '1:00 PM',
        location: 'Central Field',
        division: 'U12'
    });

    footballCalendar.addGame('2024-09-29', {
        team1: 'Hawks',
        team2: 'Lions',
        time: '3:00 PM',
        location: 'South Field',
        division: 'U14'
    });

    console.log('=== Calendar Example ===\n');

    // Display September 2024 calendar
    console.log(footballCalendar.displayMonth(2024, 9));

    // Get games for a specific date
    console.log('\n=== Games on September 15, 2024 ===');
    const gamesOnSept15 = footballCalendar.getGamesByDate('2024-09-15');
    gamesOnSept15.forEach(game => {
        console.log(`${game.team1} vs ${game.team2} at ${game.time} (${game.location})`);
    });

    // Get games for a specific team
    console.log('\n=== Eagles Team Schedule ===');
    const eaglesGames = footballCalendar.getGamesByTeam('Eagles');
    eaglesGames.forEach(game => {
        console.log(`${game.date} - vs ${game.team1 === 'Eagles' ? game.team2 : game.team1} at ${game.time}`);
    });

    // Get calendar statistics
    console.log('\n=== Calendar Statistics ===');
    const stats = footballCalendar.getStats();
    console.log(`Total Games: ${stats.totalGames}`);
    console.log(`Total Teams: ${stats.totalTeams}`);
    console.log(`Teams: ${stats.teams.join(', ')}`);
    if (stats.dateRange) {
        console.log(`Season: ${stats.dateRange.start} to ${stats.dateRange.end}`);
    }

    // Get games in a date range
    console.log('\n=== Games in September 2024 ===');
    const septemberGames = footballCalendar.getGamesInRange('2024-09-01', '2024-09-30');
    septemberGames.forEach(game => {
        console.log(`${game.date} - ${game.team1} vs ${game.team2}`);
    });

} catch (error) {
    console.error('Error:', error.message);
}
