//had to move Bracket.js functions in the html file for them to work
function pickWinner(clickedTeam, nextMatchId) {
    const matchup = clickedTeam.closest('.matchup');
    // Remove 'winner' class from any other team in the same matchup
    const teamsInMatchup = matchup.querySelectorAll('.team');
    const nextMatchPlaceholder = document.getElementById(nextMatchId);
    const temp = nextMatchPlaceholder;
    let defaultText = `Winner ${teamsInMatchup[0].textContent}/${teamsInMatchup[1].textContent}`;

    //if clicked team is already a winner, remove 'winner' class from team
    if (clickedTeam.classList.contains('winner')){
        teamsInMatchup.forEach(team => {
            team.classList.remove('winner');
        });

        //reset the next round placeholder
        if (nextMatchPlaceholder) {
            nextMatchPlaceholder.textContent = defaultText;
        }
    } else{ //otherwise add 'winner'
        teamsInMatchup.forEach(team => {
            team.classList.remove('winner');
        });
        // Add 'winner' class to the clicked team
        clickedTeam.classList.add('winner');

        // Update the next round's placeholder with the winner's name

        if (nextMatchPlaceholder) {
            nextMatchPlaceholder.textContent = clickedTeam.textContent;
        }
    }
    
}

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

async function setSeeding(){
    const response = await fetch('/teams');
    const json = await response.json();
    const teams = json;
    seeding = seedTeams(teams, 8);      
    let i=1;
    for (let team of seeding){
        if (team == null){
            continue;
        }
        label = document.getElementById(`${i}seed`);
        label.innerHTML += `${team.teamName}`;
        i++;
    } 
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await setSeeding();
});

exports.higherSeed = higherSeed;
exports.setSeeding = setSeeding;