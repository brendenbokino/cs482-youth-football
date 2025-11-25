// Interation #1
// Due Oct 23, 2025, 11:00 PM

// Loren Kim - 1/2 Coach account

/*
Permission Levels:
0 - Admin
1 - Coach
2 - Adult
3 - Youth
4 - Guest?
*/



const readline = require('readline');
const UserDao = require('../model/UserDao');
const YouthDao = require('../model/YouthDao');
const TeamInviteDao = require('../model/TeamInviteDao');
const hash = require('../util/Hashing');

class User {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};
    }

    // async prompt for user input
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    
    // functions to get user input for coach account creation
    async name(){
        const name = await this.ask("Enter your name: ");
        this.userInput.name = name;
    }

    async username(){
        const username = await this.ask("Enter your username: ");
        this.userInput.username = username;
    }

    async email(){
        const email = await this.ask("Enter your email: ");
        this.userInput.email = email;
    }

    async permission(){
        const account_type = Number(await this.ask("Enter your account type. The types are Admin (0), Coach (1), Adult (2), Youth (3) and Guest (4)."));
        if (account_type.isNaN || account_type < 0 || account_type > 4) {
            console.log("Please enter a valid option, a number 1-4.");
            return this.permission();
        }
        this.userInput.permission = account_type;
    }

    async phone(){
        const phone = await this.ask("Enter your phone (only numbers): ");
        if (phone.length < 10 || isNaN(phone)) {
            console.log("Phone number must be at least 10 digits and only numbers.");
            return this.phone();
        }
        this.userInput.phone = phone;
    }

    async password(){
        const password = await this.ask("Enter your password (4+ characters): ");
        if (password.length < 4) {
            console.log("Password must be at least 4 characters long.");
            return this.password();
        }
        hashedpwd = hash.hashString(password)
        this.userInput.password = hashedpwd;
    }
    

    async createAccount() {
        await this.permission();
        await this.email();
        await this.username();
        await this.password();
        await this.name();
        await this.phone();
        
    
        await UserDao.create(this.userInput);
    
        console.log("Account created:", this.userInput);
        console.log("-------------------------");
    }

    async viewAccountInfo(){
        const email = await this.ask("Enter your email to view account info: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (user) {
            console.log("Account Info:", user);
        } else {
            console.log("No account found with that email.");
        }
    }

    async deleteAccount(){
        const email = await this.ask("Enter your email to delete account: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (user) {
            await UserDao.del(user._id);
            console.log("Account deleted successfully.");
        } else {
            console.log("No account found with that email.");
        }
    }

    // update user account info & need to refactor in next iteration
    async updateAccount(){
        const email = await this.ask("Enter your email to update account: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (!user) {
            console.log("No account found with that email.");
            return;
        }
        console.log("To update your account, please enter a corresponding number:");
        console.log("1. Update Name");
        console.log("2. Update Email");
        console.log("3. Update Phone Number");
        console.log("4. Update Password");
        console.log("5. Update Username");
        console.log("6. Update Permission Level");

        const choice = await this.ask("Enter the number of the field you want to update: ");
        let updates = {};
        switch(choice){
            case '1':
                updates.name = await this.ask("Enter new name: ");
                break;
            case '2':
                updates.email = await this.ask("Enter new email: ");
                break;
            case '3':
                updates.phone = await this.ask("Enter new phone: ");
                break;
            case '4':
                updates.password = await this.ask("Enter new password: ");
                updates.password = hash.hashString(updates.password);
                break;
            case '5':
                updates.username = await this.ask("Enter a new username: ");
                break;
            case '6':
                updates.permission = await this.ask("Enter new permission level (0 Admin, 1 Coach, 2 Adult, 3 Youth, 4 Guest): ")
            default:
                console.log("Invalid choice");
                break; 
        }

        const updatedUser = await UserDao.update(user._id, updates);
        console.log("Account updated to:", updatedUser);
    }

    async menu(){
        console.log("User CRUD Menu:");
        console.log("1. Create Account");
        console.log("2. Update Account");
        console.log("3. Delete Account");
        console.log("4. View Account Info");
        console.log("5. Exit");
    }

    async choice(userChoice) {
        switch (userChoice) {
            case '1': 
                await this.createAccount(); 
                break;
            case '2': 
                await this.updateAccount(); 
                break;
            case '3': 
                await this.deleteAccount(); 
                break;
            case '4': 
                await this.viewAccountInfo(); 
                break;
            case '5': 
                console.log("Goodbye!"); 
                this.rl.close(); 
                return true;
            default: 
                console.log("Invalid choice");
        }
        return false;
    }

    async run() {
        let exit = false;
        while (!exit) {
            await this.menu();
            const userChoice = await this.ask("Enter your choice: ");
            exit = await this.choice(userChoice);

        }
        this.rl.close();
    }   
}

exports.User = User;

exports.login = async function(req, res){
    let plogin = req.body.login_id;
    /**console.log('plogin: ', plogin);
    console.log('req.body.login_id: ', req.body.login_id);
    console.log('req.body: ', req.body);**/

    let user = await UserDao.findLogin(plogin); 

    if (user == null){ //login not found
        res.redirect('/login.html?error=1'); //redirect back to login, NtE error message
    } else {
        if (hash.compareHash(req.body.login_pass, user.password)){
            //passwords match
            console.log('successful login');

            req.session.user = user;
            res.redirect('/profile') 

        } else{ //passwords do not match
            res.redirect('/login.html?error=2') //redirect back to login, NtE error message

        }
    } 
}

exports.loggedUser = function(req, res){
    res.status(200) //200 = ok
    if(req.session.user) //if there is a user logged in
        res.send(req.session.user) //send the logged user
    else
        res.json(null);
    res.end();
}

exports.logout = async function(req, res){
    req.session.user = null;
    res.redirect('/');
}

exports.register = async function(req, res) {
    let existingUsername = await UserDao.findLogin(req.body.username);
    let existingEmail = await UserDao.findLogin(req.body.email);
    if (existingUsername == null && existingEmail == null) {
        if (req.body.pass != req.body.confirm_pass) {
            console.log('Confirm password failed on registration.');
            res.redirect('/register.html');
            return;
        }

        // Todo: validty checks on other input (email, username, etc.)

        let userInfo = {
            email: req.body.email,
            username: req.body.username,
            name: req.body.name,
            permission: 4, // Default to guest
            phone: req.body.phone,
            password: hash.hashString(req.body.pass)
        };

        let user = UserDao.create(userInfo);
        console.log('Successfully registered user.');
        req.session.user = user;
        res.redirect('/profile');
    } else {
        if (existingUsername) {
            console.log('User already exists with username.');
        } else {
            console.log('User already exists with email.');
        }
        
        res.redirect('/register.html');
    }
}

exports.getUserById = async function(req, res) {
    let userId = req.params.id;
    let adult = false;

    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }

    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }



    if (requester._id.toString() !== userId.toString()) {
        // Different user
        if (requester.permission == 2) {
            adult = true;
        } else if (requester.permission == 4 || requester.permission == 3) {
            res.status(403);
            res.send('Forbidden: Not authorized to view this user');
            return;
        }
    }

    let user = await UserDao.read(userId);
    if (!user) {
        res.status(404);
        res.send('User not found');
        return;
    }

    if (adult) {
        if (user.permission == 3) {
            let youth = await YouthDao.findByUserId(user._id);
            if (!youth) {
                res.status(404);
                res.send('Youth profile not found');
                return;
            }

            let isUnderAdult = youth.id_adult.toString() === requester._id.toString();
            if (!isUnderAdult) {
                res.status(403);
                res.send('Forbidden: Not authorized to view this youth');
                return;
            }
        } else {
            res.status(403);
            res.send('Forbidden: Adults can only their youths profiles and their own');
            return;
        }
    }

    res.status(200);
    res.json(user);
};

exports.getUserName = async function(req, res) {
    let userId = req.params.id;
    let user = await UserDao.read(userId);
    if (!user) {
        res.status(404);
        res.send('User not found');
        return;
    }

    // Guests can only have their name fetched by admins or themselves
    if (user.permission === 4) {
        if (!req.session || !req.session.user || (req.session.user.permission !== 0 && req.session.user._id.toString() !== userId.toString())) {
            res.status(403);
            res.send('Forbidden: Not authorized to view this user');
            return;
        }
    }

    res.status(200);
    res.json({ name: user.name || user.username });
};


exports.promoteToAdult = async function(req, res) {
    let adultId = req.body.promote_adult_id;
    if (!req.session || !req.session.user) {
        res.status(401);
        res.send('Forbidden: Not logged in');
        return;
    }

    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Promoting user not found');
        return;
    }

    if (requester.permission > 1) {
        res.status(403);
        res.send('Forbidden');
        return;
    }

    let user = await UserDao.findLogin(adultId);
    if (!user) {
        res.status(404);
        res.send('User not found');
        return;
    }

    if (user.permission != 4) {
        res.status(400);
        res.send('User is not a guest');
        return;
    }

    let updates = { permission: 2 }; // Promote to adult
    let updatedUser = await UserDao.update(user._id, updates);
    res.status(200);
    res.json(updatedUser);

}

exports.createYouthAccount = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }
    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }
    if (requester.permission != 2) {
        res.status(403);
        res.send('Forbidden: Not an adult');
        return;
    }
    let youthInfo = {
        username: req.body.username,
        name: req.body.name,
        permission: 3, // Youth
        password: hash.hashString(req.body.pass)
    };

    let youthUser = await UserDao.create(youthInfo);
    let newYouth = {
        id_user: youthUser._id,
        id_adult: requester._id
    };

    let youthProfile = await YouthDao.create(newYouth);
    res.status(200);
    res.send('Youth account created successfully, nagivate to profile to view.');
}

// Add stat to youth (admin only)
exports.addYouthStat = async function(req, res) {
    // Check if user is admin (permission 0)
    if (!req.session || !req.session.user || req.session.user.permission !== 0) {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    try {
        const YouthGameRecordDao = require('../model/YouthGameRecordDao');
        const { youthId, statType, value, gameId } = req.body;

        console.log('UserController.addYouthStat: Request received');
        console.log('UserController.addYouthStat: Data:', { youthId, statType, value, gameId });

        if (!youthId || !statType || value === undefined || !gameId) {
            console.log('UserController.addYouthStat: Missing required fields');
            return res.status(400).json({ error: "youthId, statType, value, and gameId are required" });
        }

        // Find youth by user ID
        console.log('UserController.addYouthStat: Looking up youth for userId:', youthId);
        let youth = await YouthDao.read(youthId);
        if (!youth) {
            console.log('UserController.addYouthStat: Youth not found for userId:', youthId);
            return res.status(404).json({ error: "Youth not found for this user" });
        }

        console.log('UserController.addYouthStat: Found youth:', youth._id);

        // Check if a game record already exists for this youth and game
        let existingRecord = await YouthGameRecordDao.getYouthRecordForGame(youth._id, gameId);
        
        let gameRecord;
        if (existingRecord) {
            // Update existing record by adding to the stat
            console.log('UserController.addYouthStat: Updating existing game record:', existingRecord._id);
            
            let updates = {};
            let currentValue = existingRecord[statType] || 0;
            updates[statType] = currentValue + parseInt(value);
            
            gameRecord = await YouthGameRecordDao.update(existingRecord._id, updates);
        } else {
            // Create new game record
            console.log('UserController.addYouthStat: Creating new game record');
            
            let newRecord = {
                id_game: gameId,
                id_youth: youth._id
            };
            newRecord[statType] = parseInt(value);
            
            gameRecord = await YouthGameRecordDao.create(newRecord);
        }
        
        if (gameRecord) {
            console.log('UserController.addYouthStat: Game record saved successfully');
            return res.status(200).json({ success: true, record: gameRecord });
        } else {
            console.log('UserController.addYouthStat: Failed to save game record');
            return res.status(500).json({ error: "Failed to save stat" });
        }
    } catch (error) {
        console.error('UserController.addYouthStat: Error:', error);
        return res.status(500).json({ error: "Failed to add stat: " + error.message });
    }
}

exports.getYouths = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }

    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }
    if (requester.permission == 2) {
        let youths = await YouthDao.findByAdultId(requester._id);
        res.status(200);
        res.json(youths);    
    } else if (requester.permission == 1) {
        let youths = await YouthDao.readAllYouth();
        let noTeamYouth = [];
        for (youth of youths) {
            if (youth.id_team == null) {
                noTeamYouth.push(youth);
            }
        }
        res.status(200);
        res.json(noTeamYouth);
    } else {
        res.status(403);
        res.send('Forbidden: Not an adult or coach');
        return;
    }
}

exports.inviteYouthToTeam = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }
    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }
    if (requester.permission != 1) {
        res.status(403);
        res.send('Forbidden: Not a coach');
        return;
    }

    let youthId = req.body.youthId;
    let teamId = req.body.teamId;
    let youth = await YouthDao.read(youthId);
    if (!youth) {
        res.status(404);
        res.send('Youth not found');
        return;
    }
    let newInvite = {
        id_youth: youth._id,
        id_team: teamId
    };
    let createdInvite = await TeamInviteDao.create(newInvite);
    res.status(200);
    res.json(createdInvite);
}


exports.addYouthToTeam = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }
    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }
    if (requester.permission != 0 && requester.permission != 2) {
        res.status(403);
        res.send('Forbidden: Not permitted to add youth to team');
        return;
    }

    let youthId = req.body.youthId;
    let teamId = req.body.teamId;
    let youth = await YouthDao.read(youthId);
    if (!youth) {
        res.status(404);
        res.send('Youth not found');
        return;
    }
    
    // Verify adult owns this youth (if adult)
    if (requester.permission == 2 && youth.id_adult.toString() !== requester._id.toString()) {
        res.status(403);
        res.send('Forbidden: You can only approve invites for your own youths');
        return;
    }
    
    let updates = { id_team: teamId };
    let updatedYouth = await YouthDao.update(youth._id, updates);
    res.status(200);
    res.json(updatedYouth);
}


exports.getAllCoaches = async function(req, res) {
    try {
        let allCoaches = await UserDao.findByPermission(1); // 1 is the permission level for coaches
        res.status(200);
        res.json(allCoaches);
    } catch (error) {
        console.error('Error in getAllCoaches:', error);
        res.status(500);
        res.json({ error: "Failed to fetch coaches" });
    }
}

exports.getYouthByUserId = async function(req, res) {
    try {
        const userId = req.params.userId;
        console.log('getYouthByUserId: Looking up youth for userId:', userId);
        
        const youth = await YouthDao.findByUserId(userId);
        
        if (!youth) {
            console.log('getYouthByUserId: Youth not found for userId:', userId);
            return res.status(404).json({ error: "Youth profile not found" });
        }
        
        console.log('getYouthByUserId: Found youth:', youth);
        res.status(200);
        res.json(youth);
    } catch (error) {
        console.error('Error in getYouthByUserId:', error);
        res.status(500);
        res.json({ error: "Failed to fetch youth data" });
    }
}


exports.getAdultYouthInvites = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }
    let requester = await UserDao.read(req.session.user._id);
    if (!requester) {
        res.status(404);
        res.send('Requesting user not found');
        return;
    }
    if (requester.permission != 2) {
        res.status(403);
        res.send('Forbidden: Not an adult');
        return;
    }
    
    try {
        // Get all youths under this adult
        let youths = await YouthDao.findByAdultId(requester._id);
        
        const TeamDao = require('../model/TeamDao');
        
        // Get invites for each youth with team and coach info
        let allInvites = [];
        for (let youth of youths) {
            let invites = await TeamInviteDao.getInvitesByYouthId(youth._id);
            for (let invite of invites) {
                // Fetch team info
                let team = await TeamDao.read(invite.id_team);
                let teamInfo = null;
                let coachInfo = null;
                
                if (team) {
                    teamInfo = {
                        _id: team._id,
                        teamName: team.teamName,
                        id_coach: team.id_coach
                    };
                    
                    // Fetch coach info
                    if (team.id_coach) {
                        let coach = await UserDao.read(team.id_coach);
                        if (coach) {
                            coachInfo = {
                                _id: coach._id,
                                name: coach.name,
                                username: coach.username
                            };
                        }
                    }
                }
                
                allInvites.push({
                    _id: invite._id,
                    id_youth: invite.id_youth,
                    id_team: invite.id_team,
                    createdAt: invite.createdAt,
                    youth: youth,
                    team: teamInfo,
                    coach: coachInfo
                });
            }
        }
        
        res.status(200);
        res.json(allInvites);
    } catch (error) {
        console.error('Error in getAdultYouthInvites:', error);
        res.status(500);
        res.json({ error: 'Failed to fetch invites' });
    }
}

exports.deleteInvite = async function(req, res) {
    if (!req.session || !req.session.user) {
        res.status(403);
        res.send('Forbidden: Not logged in');
        return;
    }
    
    try {
        let inviteId = req.params.id;
        let invite = await TeamInviteDao.read(inviteId);
        
        if (!invite) {
            res.status(404);
            res.json({ error: 'Invite not found' });
            return;
        }
        
        // Verify adult owns the youth (if not admin)
        let requester = await UserDao.read(req.session.user._id);
        if (requester.permission == 2) {
            let youth = await YouthDao.read(invite.id_youth);
            if (!youth || youth.id_adult.toString() !== requester._id.toString()) {
                res.status(403);
                res.json({ error: 'Forbidden: You can only delete invites for your own youths' });
                return;
            }
        }
        
        let deletedInvite = await TeamInviteDao.del(inviteId);
        res.status(200);
        res.json({ success: true, message: 'Invite deleted successfully' });
    } catch (error) {
        console.error('Error in deleteInvite:', error);
        res.status(500);
        res.json({ error: 'Failed to delete invite' });
    }
}
