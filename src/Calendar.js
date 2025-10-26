const gameDao = require('../model/GameDao.js'); // Assuming GameDao exports an object with readAll()

class Calendar {
    constructor(){
        // Initialize the array to hold game objects
        this.games = [];
    }

    /**
     * Fetches all games, filters for future games, 
     * and sorts them chronologically.
     * @returns {Array} The sorted array of upcoming games.
     */
    async makeCalendar() {
        try {
            // 1. Fetch all games from the database
            const tempGames = await gameDao.readAll();

            // 2. Define the cutoff date (today's date at midnight)
            const today = new Date();
            // Set time to 00:00:00 to include games scheduled for today
            today.setHours(0, 0, 0, 0); 
            
            // 3. Filter for future games
            const futureGames = tempGames.filter(game => {
                // Assuming each game object has a date/time field (e.g., 'date')
                // and it's either an ISO string or a Date object.
                const gameDate = new Date(game.date);
                
                // Compare the game's date/time against the 'today' cutoff
                return gameDate >= today;
            });
            
            // 4. Sort the future games chronologically
            // The JavaScript sort() method works well with Date objects
            futureGames.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                
                return dateA - dateB; // For ascending order (earlier dates first)
            });

            // 5. Update the instance property and return
            this.games = futureGames;
            return this.games;

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

module.exports = Calendar; // Export the class for use elsewhere