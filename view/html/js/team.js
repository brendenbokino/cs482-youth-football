async function populateCoachOptions() {
    try {
        let coachResp = await fetch('/coaches');
        
        if (!coachResp.ok) {
            console.error('populateCoachOptions: Failed to fetch coaches:', coachResp.status, coachResp.statusText);
            return;
        }
        
        let coaches = await coachResp.json();
        
        if (coaches.error) {  
            console.error('Error fetching coaches:', coaches.error);
            return;
        }

        let coachSelect = document.getElementById('coach');

        // Clear and add default option
        coachSelect.innerHTML = '<option value="">Select a Coach</option>';

        for (let coach of coaches) {
            let option = document.createElement('option');
            option.value = coach._id.toString();
            option.textContent = coach.name || coach.username;
            coachSelect.appendChild(option);
        }
        
    } catch (error) {
        console.error('populateCoachOptions Error:', error);
    }
}

async function populateTeamOptions() {
    try {
        let teamResp = await fetch('/teams');
        
        if (!teamResp.ok) {
            console.error('populateCoachOptions: Failed to fetch coaches:', teamResp.status, teamResp.statusText);
            return;
        }
        
        let teams = await teamResp.json();
        
        if (teams.error) {  
            console.error('Error fetching coaches:', teams.error);
            return;
        }

        let teamSelect = document.getElementById('updateTeamRecordID');
        

        // Clear and add default option
        teamSelect.innerHTML = '<option value="">Select a Team</option>';
        //window.alert(teamSelect.textContent);

        for (let team of teams) {
            let option = document.createElement('option');
            option.value = team._id;
            option.textContent = team.teamName;
            teamSelect.appendChild(option);
        }
    
    } catch (error) {
        console.error('populateTeamOptions Error:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await populateCoachOptions();
    await populateTeamOptions();
});