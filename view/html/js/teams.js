let currentUser = {
    permission: null,
    name: '',
    coachName: '',
    coachId: ''
};
let teamsData = [];
let gamesData = [];
let currentTeam = null;
let youthUsers = [];
let coachFilterId = ''; // Store the filter coach ID
let allCoaches = []; // Store all coaches for dropdown

// Fetch logged-in user
async function fetchLoggedUser() {
    try {
        const response = await fetch('/loggeduser');
        if (response.ok) {
            const user = await response.json();
            currentUser.permission = user.permission;
            currentUser.name = user.name || '';
            currentUser.coachName = user.name || user.username || '';
            currentUser.coachId = user._id || '';
            console.log('Current user:', currentUser);
        }
    } catch (error) {
        console.error('Error fetching logged user:', error);
    }
}

// Load all coaches for dropdown
async function loadCoaches() {
    try {
        const response = await fetch('/coaches');
        if (response.ok) {
            allCoaches = await response.json();
            populateCoachDropdown();
        }
    } catch (error) {
        console.error('Error loading coaches:', error);
    }
}

// Populate coach dropdown
function populateCoachDropdown() {
    const select = document.getElementById('coachSelect');
    select.innerHTML = '<option value="">Select a coach...</option>';
    
    allCoaches.forEach(coach => {
        const option = document.createElement('option');
        option.value = coach._id;
        option.textContent = coach.name || coach.username || coach._id;
        select.appendChild(option);
    });
}

// Check if user can edit team
function canEditTeam(team) {
    // Permission 0 or 1 allows editing
    if (currentUser.permission === 0) return true;
    if (currentUser.permission === 1) return true;
    // Coach can edit their own team
    if (currentUser.coachId && team.id_coach && 
        team.id_coach.toString() === currentUser.coachId.toString()) {
        return true;
    }
    // If coach filter is active, allow editing teams matching the filter
    if (coachFilterId && team.id_coach && 
        team.id_coach.toString() === coachFilterId.toString()) {
        return true;
    }
    return false;
}

// Apply coach filter
function applyCoachFilter() {
    const select = document.getElementById('coachSelect');
    const filterId = select.value;
    
    if (!filterId) {
        alert('Please select a coach');
        return;
    }
    
    coachFilterId = filterId;
    
    const selectedCoach = allCoaches.find(c => c._id === filterId);
    const coachName = selectedCoach ? (selectedCoach.name || selectedCoach.username) : 'Unknown';
    
    const filterStatus = document.getElementById('filterStatus');
    filterStatus.style.display = 'block';
    filterStatus.textContent = `Filtering teams for coach: ${coachName}`;
    
    // Filter and display teams
    const filteredTeams = teamsData.filter(team => 
        team.id_coach && team.id_coach.toString() === filterId.toString()
    );
    
    if (filteredTeams.length === 0) {
        filterStatus.textContent = `No teams found for coach: ${coachName}`;
        filterStatus.style.backgroundColor = '#fff3cd';
        filterStatus.style.color = '#856404';
    } else {
        filterStatus.style.backgroundColor = '#d1ecf1';
        filterStatus.style.color = '#0c5460';
    }
    
    displayTeams(filteredTeams);
}

// Clear coach filter
function clearCoachFilter() {
    coachFilterId = '';
    document.getElementById('coachSelect').value = '';
    
    const filterStatus = document.getElementById('filterStatus');
    filterStatus.style.display = 'none';
    
    // Display all teams
    displayTeams(teamsData);
}

// Load all teams
async function loadTeams() {
    const loadingDiv = document.getElementById('loadingMessage');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const teamsGrid = document.getElementById('teamsGrid');

    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    teamsGrid.innerHTML = '';

    try {
        // Load teams and games in parallel
        const [teamsResponse, gamesResponse] = await Promise.all([
            fetch('/teams'),
            fetch('/games')
        ]);

        const teams = await teamsResponse.json();
        const gamesResult = await gamesResponse.json();

        loadingDiv.style.display = 'none';

        if (Array.isArray(teams)) {
            teamsData = teams;
            gamesData = gamesResult.games || gamesResult || [];
            
            // If filter is active, apply it
            if (coachFilterId) {
                const filteredTeams = teamsData.filter(team => 
                    team.id_coach && team.id_coach.toString() === coachFilterId.toString()
                );
                displayTeams(filteredTeams);
            } else {
                displayTeams(teamsData);
            }
        } else {
            throw new Error('Failed to load teams');
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error loading teams: ${error.message}`;
    }
}

// Display teams
async function displayTeams(teams) {
    const teamsGrid = document.getElementById('teamsGrid');
    teamsGrid.innerHTML = '';

    for (let team of teams) {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        
        const canEdit = canEditTeam(team);
        if (canEdit) {
            teamCard.classList.add('editable');
            teamCard.onclick = () => openTeamPopup(team);
        }

        // Get coach name
        let coachName = 'No coach assigned';
        if (team.id_coach) {
            const coach = allCoaches.find(c => c._id === team.id_coach.toString());
            if (coach) {
                coachName = coach.name || coach.username || 'Unknown Coach';
            } else {
                coachName = 'Unknown Coach';
            }
        }

        // Fetch players for this team
        let playersHTML = '';
        let playerCount = 0;
        
        try {
            console.log('Fetching players for team:', team.teamName, 'ID:', team._id);
            const playersResponse = await fetch(`/teams/${team._id}/players`);
            console.log('Players response status:', playersResponse.status);
            if (playersResponse.ok) {
                const playersResult = await playersResponse.json();
                console.log('Players result:', playersResult);
                const youths = playersResult.youths || [];
                playerCount = youths.length;
                console.log('Number of youths found:', playerCount);
                
                if (youths && youths.length > 0) {
                    // Build players list
                    for (let youth of youths) {
                        console.log('Fetching user for youth:', youth);
                        let youth_user_resp = await fetch(`/user/${youth.id_user}`);
                        if (youth_user_resp.ok) {
                            let youth_user = await youth_user_resp.json();
                            console.log('Youth user:', youth_user);
                            const playerName = youth_user.name || youth_user.username || 'Unknown Player';
                            playersHTML += `<li class="player-item">${escapeHtml(playerName)}</li>`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching players for team:', team.teamName, error);
        }
        
        // If no players were added, show "no players" message
        if (playersHTML === '') {
            playersHTML = '<div class="no-players">No players registered</div>';
        }

        // Get games for this team
        const teamGames = gamesData.filter(game => 
            game.team1 === team.teamName || game.team2 === team.teamName
        );

        const gamesHTML = teamGames.length > 0
            ? teamGames.map(game => {
                const gameDate = game.date ? new Date(game.date).toLocaleDateString() : 'TBD';
                const location = game.location || 'TBD';
                const opponent = game.team1 === team.teamName ? game.team2 : game.team1;
                return `
                    <li class="game-item">
                        <strong>vs ${escapeHtml(opponent)}</strong><br>
                        Date: ${gameDate} | Location: ${escapeHtml(location)}
                    </li>
                `;
            }).join('')
            : '<div class="no-games">No games scheduled</div>';

        teamCard.innerHTML = `
            <div class="team-header">
                <h3 class="team-name">${escapeHtml(team.teamName || 'Unnamed Team')}</h3>
                <p class="record">${team.record ? `${escapeHtml(team.record[0])}-${escapeHtml(team.record[1])}` : '0-0'}</p>
            </div>
            
            <div class="coach-section">
                <div class="coach-label">Coach:</div>
                <div class="coach-name">${escapeHtml(coachName)}</div>
            </div>
            
            <div class="players-section">
                <div class="players-label">Players (${playerCount}):</div>
                <ul class="players-list">
                    ${playersHTML}
                </ul>
            </div>
            
            <div class="games-section">
                <div class="games-label">Games (${teamGames.length}):</div>
                <ul class="games-list">
                    ${gamesHTML}
                </ul>
            </div>
        `;
        
        teamsGrid.appendChild(teamCard);
    }
}

// Open team popup for editing
async function openTeamPopup(team) {
    currentTeam = team;
    const popup = document.getElementById('teamPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupContent = document.getElementById('popupContent');
    
    popupTitle.textContent = `Edit Team: ${team.teamName}`;
    
    // Get coach name for display
    let coachName = 'No coach assigned';
    if (team.id_coach) {
        const coach = allCoaches.find(c => c._id === team.id_coach.toString());
        if (coach) {
            coachName = coach.name || coach.username || 'Unknown Coach';
        } else {
            coachName = 'Unknown Coach';
        }
    }
    
    // Fetch all youth users for the dropdown
    try {
        const response = await fetch('/coach/viewyouths');
        const youthRelationships = await response.json();
        
        // Fetch full user details for each youth
        const userPromises = youthRelationships.map(async (relationship) => {
            try {
                const userResponse = await fetch(`/user/${relationship.id_user}`);
                const userData = await userResponse.json();
                return userData;
            } catch (err) {
                console.error(`Failed to fetch user ${relationship.id_user}:`, err);
                return null;
            }
        });
        
        const users = await Promise.all(userPromises);
        youthUsers = users.filter(user => user !== null);
    } catch (error) {
        console.error('Failed to fetch youth users:', error);
        youthUsers = [];
    }
    
    // Filter out users already on the team
    const existingPlayerIds = team.players ? team.players.map(p => {
        if (typeof p === 'object') return p._id || p;
        return p;
    }) : [];
    
    const availableUsers = youthUsers.filter(user => !existingPlayerIds.includes(user._id));
    
    const playersListHTML = team.players && team.players.length > 0
        ? team.players.map((player, idx) => {
            const playerName = typeof player === 'object' ? (player.name || player._id) : player;
            const playerId = typeof player === 'object' ? (player._id || player) : player;
            return `
                <div class="player-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${escapeHtml(playerName)}</span>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="removePlayer('${playerId}')">Remove</button>
                </div>
            `;
        }).join('')
        : '<div class="no-players">No players registered</div>';
    
    // Create dropdown options
    const dropdownOptions = availableUsers.length > 0
        ? availableUsers.map(user => 
            `<option value="${user._id}">${escapeHtml(user.name || user.username || user._id)}</option>`
        ).join('')
        : '<option value="">No available players</option>';

    popupContent.innerHTML = `
        <div class="form-section">
            <label>Team Name:</label>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                ${escapeHtml(team.teamName || 'Unnamed Team')}
            </div>
        </div>
        
        <div class="form-section">
            <label>Coach:</label>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                ${escapeHtml(coachName)}
            </div>
        </div>
        
        <div class="form-section">
            <label>Players (${team.players ? team.players.length : 0}):</label>
            <div id="editPlayersList" style="margin-bottom: 10px;">
                ${playersListHTML}
            </div>
            <div class="add-player-section">
                <select id="youthUserSelect" ${availableUsers.length === 0 ? 'disabled' : ''}>
                    <option value="">Select a player...</option>
                    ${dropdownOptions}
                </select>
                <button class="btn btn-primary" onclick="addPlayer()" ${availableUsers.length === 0 ? 'disabled' : ''}>
                    Add Player
                </button>
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="saveTeamChanges()">Save Changes</button>
            <button class="btn btn-secondary" onclick="closeTeamPopup()">Cancel</button>
        </div>
    `;
    
    popup.style.display = 'block';
}

// Add player to team
async function addPlayer() {
    if (!currentTeam) return;

    const playerId = document.getElementById('youthUserSelect').value.trim();
    
    if (!playerId) {
        alert('Please select a player');
        return;
    }

    // Check if player already exists
    const existingPlayerIds = currentTeam.players ? currentTeam.players.map(p => {
        if (typeof p === 'object') return p._id || p;
        return p;
    }) : [];
    
    if (existingPlayerIds.includes(playerId)) {
        alert('Player already exists on this team');
        return;
    }

    // Find the user object
    const user = youthUsers.find(u => u._id === playerId);
    const playerToAdd = user ? user._id : playerId;

    // Add to current team's players array
    if (!currentTeam.players) {
        currentTeam.players = [];
    }
    currentTeam.players.push(playerToAdd);
    
    // Update the display
    updatePlayersList();
    document.getElementById('youthUserSelect').value = '';
}

// Remove player from team
function removePlayer(playerId) {
    if (!currentTeam || !currentTeam.players) return;
    
    if (confirm('Remove this player from the team?')) {
        currentTeam.players = currentTeam.players.filter(p => {
            const id = typeof p === 'object' ? (p._id || p) : p;
            return id !== playerId;
        });
        
        updatePlayersList();
    }
}

// Update players list display
function updatePlayersList() {
    if (!currentTeam) return;
    
    const playersListHTML = currentTeam.players && currentTeam.players.length > 0
        ? currentTeam.players.map((player, idx) => {
            const playerName = typeof player === 'object' ? (player.name || player._id) : player;
            const playerId = typeof player === 'object' ? (player._id || player) : player;
            const displayName = youthUsers.find(u => u._id === playerId)?.name || playerName;
            return `
                <div class="player-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${escapeHtml(displayName)}</span>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="removePlayer('${playerId}')">Remove</button>
                </div>
            `;
        }).join('')
        : '<div class="no-players">No players registered</div>';
    
    document.getElementById('editPlayersList').innerHTML = playersListHTML;
}

// Save team changes
async function saveTeamChanges() {
    if (!currentTeam) return;

    try {
        const payload = {
            updateTeamId: currentTeam._id,
            coach: currentTeam.coach,
            players: currentTeam.players || [],
            teamName: currentTeam.teamName,
            games: currentTeam.games || []
        };
        
        console.log('Saving team changes:', payload);

        const response = await fetch('/teamsupdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', data);

        if (response.ok || response.status === 200 || (data && data.success === true)) {
            showSuccess('Team updated successfully!');
            closeTeamPopup();
            await loadTeams();
        } else {
            const errorMsg = data.error || data.message || 'Unknown error occurred';
            alert('Error updating team: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error details:', error);
        alert('Error updating team: ' + error.message);
    }
}

// Close popup
function closeTeamPopup() {
    document.getElementById('teamPopup').style.display = 'none';
    currentTeam = null;
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close popup when clicking outside
window.onclick = function(event) {
    const popup = document.getElementById('teamPopup');
    if (event.target === popup) {
        closeTeamPopup();
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
    await fetchLoggedUser();
    await loadCoaches();
    await loadTeams();
});