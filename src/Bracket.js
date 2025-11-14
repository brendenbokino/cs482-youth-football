/**function pickWinner(clickedTeam, nextMatchId) {
    console.log(clickedTeam);
    const matchup = clickedTeam.closest('.matchup');
    // Remove 'winner' class from any other team in the same matchup
    const teamsInMatchup = matchup.querySelectorAll('.team');
    teamsInMatchup.forEach(team => {
        team.classList.remove('winner');
    });

    // Add 'winner' class to the clicked team
    clickedTeam.classList.add('winner');

    // Update the next round's placeholder with the winner's name
    const nextMatchPlaceholder = document.getElementById(nextMatchId);
    if (nextMatchPlaceholder) {
        nextMatchPlaceholder.textContent = clickedTeam.textContent;
    }
}**/

const TeamController = require('./TeamController');

//return team with more wins
//if teams have the same number of wins, team1 is default return
//could include a tie breaker once stats are implemented
function higherSeed(team1, team2) {
    if (team2.record[0] > team1.record[0]) {
        return team2;
    }
    return team1;
}

//find the playoff seeding
//param teams: array of all teams in league
//param numSeeds: number of playoff teams

function seedTeams(teams, numSeeds) {
    let seeding = new Array(numSeeds);
    //copy teams to a temp array to not mess with the original data
    let temp = teams;
    for (let i = 0; i < numSeeds; i++){
        maxIndex = 0;
        max = temp[maxIndex];
        
        //iterate through the teams to find the highest remaining seed
        for (let j = 1; j < temp.length; j++){
            max = higherSeed(max, temp[j])
            if (max._id === temp[j]._id){
                maxIndex = j;
            }
        }
        //add team to playoff array
        seeding[i] = max

        //remove the highest
        temp.splice(maxIndex,1)
    }
    return seeding;
}

function pickWinner(clickedTeam, nextRoundTeamId) {
    console.log(clickedTeam);
    const match = clickedTeam.parentElement;
    // Remove 'winner' class from any other team in the same match
    const teamsInMatch = match.querySelectorAll('.team');
    teamsInMatch.forEach(team => {
    team.classList.remove('winner');
    });

    // Add 'winner' class to the clicked team
    clickedTeam.classList.add('winner');

    // Update the next round with the winner's name
    const winnerName = clickedTeam.textContent;
    const nextRoundTeam = document.getElementById(nextRoundTeamId);
    if (nextRoundTeam) {
        nextRoundTeam.textContent = winnerName;
        // Optional: add a class to the next round team to indicate it's filled
        nextRoundTeam.classList.add('filled'); 
    }
}

exports.higherSeed = higherSeed;
exports.seedTeams = seedTeams;
exports.pickWinner = pickWinner;

