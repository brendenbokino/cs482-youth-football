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

    
    // async updateTeam (req, res) {
    //     try {
    //         if (!req.params || !req.params._id) {
    //             res.status = 400;
    //             res.send = { error: "Team ID is required" };
    //             return;
    //         }

    //         if (!req.body) {
    //             res.status = 400;
    //             res.send = { error: "Update data is required" };
    //             return;
    //         }

    //         // Validate update data
    //         const updateData = {};
    //         if (req.body.coach !== undefined) {
    //             if (req.body.coach.trim() === "") {
    //                 res.status = 400;
    //                 res.send = { error: "Coach name cannot be empty" };
    //                 return;
    //             }
    //             updateData.coach = req.body.coach.trim();
    //         }

    //         if (req.body.players !== undefined) {
    //             if (!Array.isArray(req.body.players) || req.body.players.length === 0) {
    //                 res.status = 400;
    //                 res.send = { error: "Players must be a non-empty array" };
    //                 return;
    //             }
    //             updateData.players = req.body.players;
    //         }

    //         if (req.body.games !== undefined) {
    //             if (!Array.isArray(req.body.games)) {
    //                 res.status = 400;
    //                 res.send = { error: "Games must be an array" };
    //                 return;
    //             }
    //             updateData.games = req.body.games;
    //         }

    //         let team = await TeamDao.update(req.params._id, updateData);
            
    //         if (!team) {
    //             res.status = 404;
    //             res.send = { error: "Team not found" };
    //             return;
    //         }

    //         res.status = 200;
    //         res.send = { success: true, message: "Team updated successfully", team: team };
    //     } catch (error) {
    //         res.status = 500;
    //         res.send = { error: "Failed to update team" };
    //     }
    // }



// Fixed updateTeam method in TeamController
    async updateTeam (req, res) {
        try {
            console.log('Update request params:', req.params); // Debug log
            console.log('Update request body:', req.body); // Debug log
            
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
                if (typeof req.body.coach === 'string' && req.body.coach.trim() === "") {
                    res.status = 400;
                    res.send = { error: "Coach name cannot be empty" };
                    return;
                }
                updateData.coach = typeof req.body.coach === 'string' ? req.body.coach.trim() : req.body.coach;
            }

            if (req.body.players !== undefined) {
                if (!Array.isArray(req.body.players)) {
                    res.status = 400;
                    res.send = { error: "Players must be an array" };
                    return;
                }
                // Allow empty array for players (team might not have players yet)
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
                if (req.body.record.length !== 2) {
                    res.status = 400;
                    res.send = { error: "Record must be array with length 2 (wins & losses)" };
                    return;
                }
                updateData.record = req.body.record;
            }

            if (req.body.teamName !== undefined) {
                updateData.teamName = req.body.teamName;
            }

            console.log('Attempting to update team:', req.params._id); // Debug log
            console.log('Update data:', updateData); // Debug log

            let team = await TeamDao.update(req.params._id, updateData);
            
            if (!team) {
                console.log('Team not found for ID:', req.params._id); // Debug log
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            // Convert Mongoose document to plain object for JSON serialization
            const teamObject = team.toObject ? team.toObject() : team;
            
            res.status = 200;
            res.send = { success: true, message: "Team updated successfully", team: teamObject };
        } catch (error) {
            console.error('Error in updateTeam:', error); // Debug log
            res.status = 500;
            res.send = { error: "Failed to update team: " + error.message };
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

    

    // Fix for registerTeam method
    async registerTeam(req, res) {
        try {
            // Validate required fields
            if (!req.body.teamName) {
                res.status = 400;
                res.send = { error: "Team name is required" };
                return;
            }

            if (!req.body.coach) {
                res.status = 400;
                res.send = { error: "Coach name is required" };
                return;
            }

            // FIX: Changed from req.body.coach to req.coach
            if (req.body.coach.trim() === "") {
                res.status = 400;
                res.send = { error: "Coach name cannot be empty" };
                return;
            }

            // Set up initial team structure with unique ID
            const teamPayload = {
                _id: this.generateId(),
                coach: req.body.coach.trim(),
                players: req.body.players || [],
                games: req.body.games || [],  // FIX: Changed from req.body.games
                teamName: req.body.teamName.trim(),  // FIX: Changed from req.body.teamName
                record: [0,0],
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

    // Fix for addPlayerToTeam method
    async addPlayerToTeam (req, res) {
        try {
            if (!req.params || !req.params._id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            if (!req.body || !req.body.playerName) {
                res.status = 400;
                res.send = { error: "Player name is required" };  // FIX: Changed error message
                return;
            }

            let team = await TeamDao.read(req.params._id);
            if (!team) {
                res.status = 404;
                res.send = { error: "Team not found" };
                return;
            }

            // Check if player already exists
            const playerToAdd = req.body.playerName;
            const playerId = typeof playerToAdd === 'object' ? playerToAdd._id : playerToAdd;
            
            const existingPlayerIds = team.players.map(p => 
                typeof p === 'object' ? p._id : p
            );
            
            if (existingPlayerIds.includes(playerId)) {
                res.status = 400;
                res.send = { error: "Player already exists on this team" };
                return;
            }

            team.players.push(playerToAdd);
            
            // FIX: Changed from req._id to req.params._id
            let updatedTeam = await TeamDao.update(req.params._id, { 
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

    
    // async registerTeam(req, res) {
    //     try {
    //         // Validate required fields
    //         if (!req.teamName) {
    //             res.status = 400;
    //             res.send = { error: "Team name is required" };
    //             return;
    //         }

    //         if (!req.coach) {
    //             res.status = 400;
    //             res.send = { error: "Coach name is required" };
    //             return;
    //         }

    //         // Validate coach is not empty string
    //         if (req.body.coach.trim() === "") {
    //             res.status = 400;
    //             res.send = { error: "Coach name cannot be empty" };
    //             return;
    //         }

    //         // Set up initial team structure with unique ID
    //         const teamPayload = {
    //             _id: this.generateId(),
    //             coach: req.coach.trim(),
    //             players: req.players || [],
    //             games: req.body.games || [],
    //             teamName: req.body.teamName.trim(),
    //             createdAt: new Date().toISOString()
    //         };

    //         let team = await TeamDao.create(teamPayload);
    //         this.teamData = team;

    //         res.status = 200;
    //         res.send = { success: true, message: "Team has been registered", team: team };

    //     } catch (error) {
    //         res.status = 500;
    //         res.send = { error: "Failed to register team" };
    //     }
    // }

    // Get team by ID
    async getTeamById (req, res) {
        try {
            if (!req.params || !req.params._id) {
                res.status = 400;
                res.send = { error: "Team ID is required" };
                return;
            }

            let team = await TeamDao.read(req.params._id);
            
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



    // Fixed exports.update function
exports.update = async function (req, res) {
    // Handle JSON data - map updateTeamId from body to params
    req.params = req.params || {};
    req.params._id = req.body.updateTeamId;
    
    // Keep the body data intact for updateTeam to use
    // The body should have: coach, players, games, etc.
    
    const team = new TeamController();
    const mockRes = { status: null, send: null };
    await team.updateTeam(req, mockRes);
    
    // For JSON requests, return JSON response (not redirect)
    if (mockRes.status == 200) {
        return res.redirect('/team.html');
    } else {
        return res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    }
}

exports.updateRecord = async function (req, res) {
    req.body.record = [req.body.wins, req.body.losses];
    exports.update(req, res);
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