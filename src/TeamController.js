const TeamDao = require('../model/TeamDao.js');

class TeamController {
    constructor (){
        this.teamData = {};
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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

            // Create team payload with unique ID
            const teamPayload = {
                _id: this.generateId(),
                players: req.players,
                coach: req.coach.trim(),
                games: req.games || [],
                record: [0,0],
                createdAt: new Date().toISOString()
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

    // Update team
    async updateTeam (req, res) {
        try {
            if (!req.params || !req.params._id) {
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

            if (req.body.record !== undefined) {
                if (!Array.isArray(req.body.players) || req.body.players.length !== 2) {
                    res.status = 400;
                    res.send = { error: "Record must be array with length 2 (wins & losses)" };
                    return;
                }
                updateData.record = req.body.record;
            }

            updateData.updatedAt = new Date().toISOString();

            let team = await TeamDao.update(req.params._id, updateData);
            
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
            if (!req.params || !req.params._id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            let team = await TeamDao.del(req.params._id);
            
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
            if (!req.params || !req.params._id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            if (!req.body || !req.body.playerName) {
                res.status = 400;
                res.send = { error: "Player name is required" };
                return;
            }

            let team = await TeamDao.read(req.params._id);
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            // Check if player already exists
            if (team.players.includes(req.playerName)) {
                res.status = 400;
                res.send = { error: "Player already exists on this team" };
                return;
            }

            team.players.push(req.playerName);
            let updatedTeam = await TeamDao.update(req._id, { 
                players: team.players,
                updatedAt: new Date().toISOString()
            });

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
            if (!req.teamName) {
                res.status = 400;
                res.send = { error: "Team name is required" };
                return;
            }

            if (!req.coach) {
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

            // Set up initial team structure with unique ID
            const teamPayload = {
                _id: this.generateId(),
                coach: req.coach.trim(),
                players: req.players || [],
                games: req.body.games || [],
                teamName: req.body.teamName.trim(),
                createdAt: new Date().toISOString()
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
        console.log('Team created successfully. Redirecting...'); 
        console.log('Generated Team ID:', mockRes.send.team._id); // Log the generated ID
        return res.redirect('/team.html');
    } else {
        // if it fails then just send information back 
        console.error('Team creation failed. Sending error response.');
        return res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error during team creation' });
    }
}

exports.addPlayer = async function (req, res) {
    // Handle form data - get teamId from body
    req.params = req.params || {};
    req.params._id = req.body.teamId;
    
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.addPlayerToTeam(req, mockRes);
    
    if (mockRes.status == 200) {
        return res.redirect('/team.html');
    } else {
        return res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    }
}

exports.update = async function (req, res) {
    // Handle form data - get updateTeamId from body
    req.params = req.params || {};
    req.params._id = req.body.updateTeamId;
    
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.updateTeam(req, mockRes);
    
    if (mockRes.status == 200) {
        return res.redirect('/team.html');
    } else {
        return res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    }
}

exports.getAll = async function (req, res) {
    const controller = new TeamController();
    const mockRes = { status: null, send: null };
    await controller.getAllTeams({}, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.getById = async function (req, res) {
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.getTeamById(req, mockRes);
    
    if (mockRes.status == 200) {
        res.status(200).json(mockRes.send);
    } else {
        res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    }
}

// Export everything
module.exports.TeamController = TeamController;