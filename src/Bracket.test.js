// We import the entire file, which includes both the class and the exported handlers
const bracket = require('./Bracket');
//const {higherSeed, seedTeams} = require('./Bracket')
/**const controllerFile = require('./TeamController.js');
const { TeamController } = controllerFile; // The class
// Import all the exported handlers
const { register, addPlayer, update, getAll, getById } = controllerFile;

// We import the dao so we can control its mock implementation
const TeamDao = require('../model/TeamDao.js');

// Tell Jest to use the mock we created in 'model/__mocks__/TeamDao.js'
jest.mock('../model/TeamDao.js');**/

// A sample team object to use in tests
const MockTeam1 = {
  _id: 'team1',
  coach: 'Coach K',
  players: ['Player 1', 'Player 2'],
  games: [],
  record: [0,4],
  teamName: 'Blue Devils'
};

const MockTeam2 = {
    _id: 'team2',
  coach: 'Coach Sirianni',
  players: ['Player 3', 'Player 4'],
  games: [],
  record: [1,3],
  teamName: 'Eagles'
}

const MockTeam3 = {
    _id: 'team3',
  coach: 'Coach Vrabel',
  players: ['Player 5', 'Player 6'],
  games: [],
  record: [1,3],
  teamName: 'Patriots'
}

const MockTeam4 = {
    _id: 'team4',
  coach: 'Coach Johnson',
  players: ['Player 7', 'Player 8'],
  games: [],
  record: [4,0],
  teamName: 'Bears'
}

/**describe('Playoff Bracket tests', () => {

    // Reset mocks before each test to ensure test independence
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('higherSeed should return the team with more wins no matter the ordering', async () => {
        
    });
});**/

test('higherSeed should return the team with a better no matter the ordering', async function(){
    let team1 = bracket.higherSeed(MockTeam1, MockTeam4);
    let team2 = bracket.higherSeed(MockTeam2, MockTeam1);

    expect(team1).toEqual(MockTeam4);
    expect(team2).toEqual(MockTeam2);
});

test('higherSeed should return the first team in function call if teams have the same record', async function(){
    let team1 = bracket.higherSeed(MockTeam2, MockTeam3);
    let team2 = bracket.higherSeed(MockTeam3, MockTeam2);

    expect(team1).toEqual(MockTeam2);
    expect(team2).toEqual(MockTeam3);
});

test('seedTeams should return the teams with the highest record, in order, with ties based on order in original array', async function(){
    let teams = new Array(4);
    teams[0] = MockTeam1;
    teams[1] = MockTeam2;
    teams[2] = MockTeam3;
    teams[3] = MockTeam4;

    let seeding = bracket.seedTeams(teams, 4);

    expect(seeding[0]).toEqual(MockTeam4);
    expect(seeding[1]).toEqual(MockTeam2);
    expect(seeding[2]).toEqual(MockTeam3);
    expect(seeding[3]).toEqual(MockTeam1);
});