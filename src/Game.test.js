const Game = require('./Game.js');

test("create a game", function() {
    const game = new Game("hi","hi2","2024-08-12","mi casa");
    
    // Test initial state
    expect(game.team1).toBe("hi");
    expect(game.team2).toBe("hi2");
    expect(game.date).toBe("2024-08-12");
    expect(game.location).toBe("mi casa");
});

test("create a game function", function() {
    const game = new Game("","","","");
    
    // Test initial state make sure it's all empty 
    expect(game.team1).toBe("");
    expect(game.team2).toBe("");
    expect(game.date).toBe("");
    expect(game.location).toBe("");


    // now use the create game function
    ret  = game.createGame(["Bears","Goats"], "Oct-20-2025", "Metlife");

    expect(game.team1).toBe("Bears");
    expect(game.team2).toBe("Goats");
    expect(game.date).toBe("Oct-20-2025");
    expect(game.location).toBe("Metlife");
    
    expect(ret).toBe(0); // successful return value 
});


test("create a game function 1 team", function() {
    const game = new Game("","","","");
    
    // Test initial state make sure it's all empty 
    expect(game.team1).toBe("");
    expect(game.team2).toBe("");
    expect(game.date).toBe("");
    expect(game.location).toBe("");


    // now use the create game function
    ret  = game.createGame(["Bears"], "Oct-20-2025", "Metlife");

    
    
    expect(ret).toBe(-1); // unsuccessful return value 
});


test("Change date one day ahead", function() {
    const game = new Game("","","","");
    
    // Test initial state make sure it's all empty 
    expect(game.team1).toBe("");
    expect(game.team2).toBe("");
    expect(game.date).toBe("");
    expect(game.location).toBe("");


    // now use the create game function
    ret  = game.createGame(["Bears","Goats"], "Oct-20-2025", "Metlife");

    expect(game.date).toBe("Oct-20-2025");


    game.changeDate("Oct-21,2025")


    expect(game.date).toBe("Oct-21,2025");
    
});

test("Change location", function() {
    const game = new Game("","","","");
    
    // Test initial state make sure it's all empty 
    expect(game.team1).toBe("");
    expect(game.team2).toBe("");
    expect(game.date).toBe("");
    expect(game.location).toBe("");


    // now use the create game function
    ret  = game.createGame(["Bears","Goats"], "Oct-20-2025", "Metlife");

    expect(game.location).toBe("Metlife");


    game.changeLocation("The KAC")


    expect(game.location).toBe("The KAC");
});


