
const TeamDao = require('../model/TeamDao.js');

class TeamController {
    constructor (){
        this.teamData = {};
    }

    // Create a new team with validation
    async createNewTeam (req, res){
        try {
            // Validate request is not null
            if (req == null) {
                res.status = 400;
                res.send = { error: "Request is empty" };
                return;
            }

            // Validate required fields
            if (!req.coach || !req.players || !Array.isArray(req.players)) {
                res.status = 400;
                res.send = { error: "Team must have a coach and players array" };
                return;
            }

            // Validate players array is not empty
            if (req.players.length === 0) {
                res.status = 400;
                res.send = { error: "Team must have at least one player" };
                return;
            }

            // Validate coach is not empty string
            if (req.coach.trim() === "") {
                res.status = 400;
                res.send = { error: "Coach name cannot be empty" };
                return;
            }

            // Create team payload
            const teamPayload = {
                players: req.players,
                coach: req.coach.trim(),
                games: req.games || []
            };

            let team = await TeamDao.create(teamPayload);
            this.teamData = team;

            res.status = 200;
            res.send = { success: true, message: "Team has been created", team: team};

        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to create team" };
        }
    }

    // Get all teams
    async getAllTeams (req, res) {

        try {
            let allTeams = await TeamDao.readAll();
            res.status = 200;
            res.send = { success: true, teams: allTeams };

            
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to fetch teams" };
        }
    }

    // Get team by ID
    // async getTeamById (req, res) {
    //     try {
    //         if (!req.params || !req.params.id) {
    //             res.status = 400;
    //             res.send = { error: "Team ID is required" };
    //             return;
    //         }

    //         let team = await TeamDao.read(req.params.id);
            
    //         if (!team) {
    //             res.status = 404;
    //             res.send = { error: "Team not found" };
    //             return;
    //         }

    //         res.status = 200;
    //         res.send = { success: true, team: team };
    //     } catch (error) {
    //         res.status = 500;
    //         res.send = { error: "Failed to fetch team" };
    //     }
    // }

    // Update team
    async updateTeam (req, res) {
        try {
            if (!req.params || !req.params.id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            if (!req.body) {
                res.status = 400;
                res.send = { error: "Update data is required" };
                return;
            }

            // Validate update data
            const updateData = {};
            if (req.body.coach !== undefined) {
                if (req.body.coach.trim() === "") {
                    res.status = 400;
                    res.send = { error: "Coach name cannot be empty" };
                    return;
                }
                updateData.coach = req.body.coach.trim();
            }

            if (req.body.players !== undefined) {
                if (!Array.isArray(req.body.players) || req.body.players.length === 0) {
                    res.status = 400;
                    res.send = { error: "Players must be a non-empty array" };
                    return;
                }
                updateData.players = req.body.players;
            }

            if (req.body.games !== undefined) {
                if (!Array.isArray(req.body.games)) {
                    res.status = 400;
                    res.send = { error: "Games must be an array" };
                    return;
                }
                updateData.games = req.body.games;
            }

            let team = await TeamDao.update(req.params.id, updateData);
            
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            res.status = 200;
            res.send = { success: true, message: "Team updated successfully", team: team };
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to update team" };
        }
    }

    // Delete team
    async deleteTeam (req, res) {
        try {
            if (!req.params || !req.params.id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            let team = await TeamDao.del(req.params.id);
            
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            res.status = 200;
            res.send = { success: true, message: "Team deleted successfully" };
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to delete team" };
        }
    }

    // Delete all teams
    async deleteAllTeams (req, res) {
        try {
            await TeamDao.deleteAll();
            res.status = 200;
            res.send = { success: true, message: "All teams deleted successfully" };
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to delete all teams" };
        }
    }

    // Get teams by coach
    async getTeamsByCoach (req, res) {
        try {
            if (!req.query || !req.query.coach) {
                res.status = 400;
                res.send = { error: "Coach name is required" };
                return;
            }

            let allTeams = await TeamDao.readAll();
            let filteredTeams = allTeams.filter(team => 
                team.coach.toLowerCase().includes(req.query.coach.toLowerCase())
            );

            res.status = 200;
            res.send = { success: true, teams: filteredTeams };
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to fetch teams by coach" };
        }
    }

    // Add player to team
    async addPlayerToTeam (req, res) {
        try {
            if (!req.params || !req.params.id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            if (!req.body || !req.body.playerName) {
                res.status = 400;
                res.send = { error: "Player name is required" };
                return;
            }

            let team = await TeamDao.read(req.params.id);
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            // Check if player already exists
            if (team.players.includes(req.body.playerName)) {
                res.status = 400;
                res.send = { error: "Player already exists on this team" };
                return;
            }

            team.players.push(req.body.playerName);
            let updatedTeam = await TeamDao.update(req.params.id, { players: team.players });

            res.status = 200;
            res.send = { success: true, message: "Player added successfully", team: updatedTeam };
        } catch (error) {
            res.status = 500;
            res.send = {error: "Failed to add player to team" };
        }
    }

    // Register a new team
    async registerTeam(req, res) {
        try {
            // Validate required fields
            if (!req.body || !req.body.teamName) {
                res.status = 400;
                res.send = { error: "Team name is required" };
                return;
            }

            if (!req.body.coach) {
                res.status = 400;
                res.send = { error: "Coach name is required" };
                return;
            }

            // Validate coach is not empty string
            if (req.body.coach.trim() === "") {
                res.status = 400;
                res.send = { error: "Coach name cannot be empty" };
                return;
            }

            // Set up initial team structure
            const teamPayload = {
                coach: req.body.coach.trim(),
                players: req.body.players || [],
                games: req.body.games || [],
                teamName: req.body.teamName.trim()
            };

            let team = await TeamDao.create(teamPayload);
            this.teamData = team;

            res.status = 200;
            res.send = { success: true, message: "Team has been registered", team: team };


        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to register team" };
        }
    }

    // Get team by ID
    async getTeamById (req, res) {
        try {
            if (!req.params || !req.params.id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            let team = await TeamDao.read(req.params.id);
            
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            res.status = 200;
            res.send = { success: true, team: team };
        } catch (error) {
            res.status = 500;
            res.send = { error: "Failed to fetch team" };
        }
    }
}



exports.register = async function (req, res) {
    // Create an instance of TeamController and leverage the functions
    const team = new TeamController();
    
    // Create a mock response object
    const mockRes = { status: null, send: null };
    
    // Take the inputs from the html in req and generate a team
    await team.registerTeam(req, mockRes);

    // Check the status from the controller operation
    if (mockRes.status == 200) {
        // if it's a successful call then return back to a page: team html here
        console.log('Game created successfully. Redirecting...'); // Optional logging
        return res.redirect('/team.html'); // Add 'return' to stop further execution
    } else {
        // if it fails then just send information back 
        console.error('Team creation failed. Sending error response.'); // Optional logging
        return res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error during game creation' });
    }
}

exports.addPlayer = async function (req, res) {
    // Handle form data - get teamId from body
    req.params = req.params || {};
    req.params.id = req.body.teamId;
    
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.addPlayerToTeam(req, mockRes);
}

exports.update = async function (req, res) {
    // Handle form data - get updateTeamId from body
    req.params = req.params || {};
    req.params.id = req.body.updateTeamId;
    
    const team = new TeamController();
    const mockRes = { status: null, teams: null };
    await team.updateTeam(req, mockRes);
    

}

exports.getAll = async function (req, res) {

    const controller = new TeamController();
    const mockRes = { status: null, send: null };
    await controller.getAllTeams({}, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
    
    return;
}

exports.getById = async function (req, res) {
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.getTeamById(req, mockRes);


}

// Export everything
module.exports.TeamController = TeamController;
