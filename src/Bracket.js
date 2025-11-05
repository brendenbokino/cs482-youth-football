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
