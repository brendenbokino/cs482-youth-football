let currentGame = null;
let currentUser = { permission: null };
let team1Data = null;
let team2Data = null;
let gameId = null;

// Get game ID from URL
function getGameIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch logged-in user
async function fetchLoggedUser() {
    try {
        const response = await fetch('/loggeduser');
        if (response.ok) {
            const user = await response.json();
            if (user && user.permission !== undefined) {
                currentUser.permission = user.permission;
                console.log('Current user permission:', currentUser.permission);
                
                // Enable admin controls if user is admin (permission 0)
                if (currentUser.permission === 0) {
                    document.getElementById('scoreControls').classList.add('enabled');
                    document.getElementById('addYouthStatSection').classList.add('enabled');
                    document.querySelectorAll('.add-stat-form').forEach(form => {
                        form.classList.add('enabled');
                    });
                }
            } else {
                console.log('No user logged in');
                currentUser.permission = null;
            }
        } else {
            console.log('Failed to fetch logged user, status:', response.status);
            currentUser.permission = null;
        }
    } catch (error) {
        console.error('Error fetching logged user:', error);
        currentUser.permission = null;
    }
}

// Load game details
async function loadGameDetails() {
    gameId = getGameIdFromUrl();
    console.log('Frontend: Getting game ID from URL');
    console.log('Frontend: Extracted game ID:', gameId);
    
    if (!gameId) {
        console.error('Frontend: No game ID provided in URL');
        showError('No game ID provided in URL');
        return;
    }

    try {
        console.log('Frontend: Fetching game details from:', `/games/${gameId}`);
        const response = await fetch(`/games/${gameId}`);
        console.log('Frontend: Response status:', response.status);
        console.log('Frontend: Response ok:', response.ok);
        
        const result = await response.json();
        console.log('Frontend: Response data:', result);

        if (result.success && result.game) {
            console.log('Frontend: Game found successfully');
            currentGame = result.game;
            
            // Fetch team names from team IDs
            await loadTeamNames();
            
            displayGameDetails();
            await loadTeams();
        } else {
            console.error('Frontend: Game not found or error:', result.error);
            showError(result.error || 'Game not found');
        }
    } catch (error) {
        console.error('Frontend: Error loading game:', error);
        console.error('Frontend: Error message:', error.message);
        showError('Failed to load game details');
    }
}

// Load team names from team IDs
async function loadTeamNames() {
    try {
        // Fetch team1 name
        if (currentGame.id_team1) {
            const team1Response = await fetch(`/teams/${currentGame.id_team1}`);
            if (team1Response.ok) {
                const team1Result = await team1Response.json();
                currentGame.team1 = team1Result.team?.teamName || 'Unknown Team';
            } else {
                currentGame.team1 = 'Unknown Team';
            }
        }
        
        // Fetch team2 name
        if (currentGame.id_team2) {
            const team2Response = await fetch(`/teams/${currentGame.id_team2}`);
            if (team2Response.ok) {
                const team2Result = await team2Response.json();
                currentGame.team2 = team2Result.team?.teamName || 'Unknown Team';
            } else {
                currentGame.team2 = 'Unknown Team';
            }
        }
        
        console.log('Team names loaded:', currentGame.team1, 'vs', currentGame.team2);
    } catch (error) {
        console.error('Error loading team names:', error);
        currentGame.team1 = 'Unknown Team';
        currentGame.team2 = 'Unknown Team';
    }
}

// Load teams data
async function loadTeams() {
    try {
        console.log('Loading teams for game:', currentGame);
        
        // Fetch team1 players
        if (currentGame.id_team1) {
            console.log('Fetching team1 players from:', `/teams/${currentGame.id_team1}/players`);
            const team1PlayersResponse = await fetch(`/teams/${currentGame.id_team1}/players`);
            console.log('Team1 players response status:', team1PlayersResponse.status);
            
            if (team1PlayersResponse.ok) {
                const team1PlayersResult = await team1PlayersResponse.json();
                console.log('Team1 players result:', team1PlayersResult);
                const youths = team1PlayersResult.youths || [];
                console.log('Team1 youths:', youths);
                
                // Fetch user data for each youth
                let players = [];
                for (let youth of youths) {
                    console.log('Processing youth:', youth);
                    if (youth.id_user) {
                        console.log('Fetching user data for:', youth.id_user);
                        const userResponse = await fetch(`/user/${youth.id_user}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            console.log('User data:', userData);
                            players.push({
                                _id: youth.id_user,
                                youthId: youth._id,
                                name: userData.name || userData.username || 'Unknown Player'
                            });
                        } else {
                            console.error('Failed to fetch user:', userResponse.status);
                        }
                    } else {
                        console.warn('Youth has no id_user:', youth);
                    }
                }
                console.log('Team1 final players:', players);
                team1Data = { players: players };
            } else {
                console.error('Failed to fetch team1 players:', team1PlayersResponse.status);
                team1Data = { players: [] };
            }
        }
        
        // Fetch team2 players
        if (currentGame.id_team2) {
            console.log('Fetching team2 players from:', `/teams/${currentGame.id_team2}/players`);
            const team2PlayersResponse = await fetch(`/teams/${currentGame.id_team2}/players`);
            console.log('Team2 players response status:', team2PlayersResponse.status);
            
            if (team2PlayersResponse.ok) {
                const team2PlayersResult = await team2PlayersResponse.json();
                console.log('Team2 players result:', team2PlayersResult);
                const youths = team2PlayersResult.youths || [];
                console.log('Team2 youths:', youths);
                
                // Fetch user data for each youth
                let players = [];
                for (let youth of youths) {
                    console.log('Processing youth:', youth);
                    if (youth.id_user) {
                        console.log('Fetching user data for:', youth.id_user);
                        const userResponse = await fetch(`/user/${youth.id_user}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            console.log('User data:', userData);
                            players.push({
                                _id: youth.id_user,
                                youthId: youth._id,
                                name: userData.name || userData.username || 'Unknown Player'
                            });
                        } else {
                            console.error('Failed to fetch user:', userResponse.status);
                        }
                    } else {
                        console.warn('Youth has no id_user:', youth);
                    }
                }
                console.log('Team2 final players:', players);
                team2Data = { players: players };
            } else {
                console.error('Failed to fetch team2 players:', team2PlayersResponse.status);
                team2Data = { players: [] };
            }
        }
        
        console.log('Final team1Data:', team1Data);
        console.log('Final team2Data:', team2Data);
        displayPlayers();
    } catch (error) {
        console.error('Error loading teams:', error);
        team1Data = { players: [] };
        team2Data = { players: [] };
        displayPlayers();
    }
}

// Display game details
function displayGameDetails() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('gameContent').style.display = 'block';

    // Set game header
    document.getElementById('gameTitle').textContent = `${currentGame.team1} vs ${currentGame.team2}`;
    document.getElementById('gameDate').textContent = new Date(currentGame.date).toLocaleDateString();
    document.getElementById('gameLocation').textContent = currentGame.location || 'TBD';

    // Set team names
    document.getElementById('team1Name').textContent = currentGame.team1;
    document.getElementById('team2Name').textContent = currentGame.team2;
    document.getElementById('team1Label').textContent = currentGame.team1;
    document.getElementById('team2Label').textContent = currentGame.team2;
    document.getElementById('team1PanelTitle').textContent = currentGame.team1 + ' Players';
    document.getElementById('team2PanelTitle').textContent = currentGame.team2 + ' Players';

    // Set scores
    document.getElementById('team1Score').textContent = currentGame.team1Score || 0;
    document.getElementById('team2Score').textContent = currentGame.team2Score || 0;
    document.getElementById('team1ScoreInput').value = currentGame.team1Score || 0;
    document.getElementById('team2ScoreInput').value = currentGame.team2Score || 0;

    // Set game ID in youth stat form
    document.getElementById('youthStatGameId').value = gameId;

    // Display video
    if (currentGame.link && currentGame.link.trim() !== '') {
        const videoContainer = document.getElementById('videoContainer');
        const noVideo = document.getElementById('noVideo');
        
        // Try to embed the video link
        let embedUrl = currentGame.link;
        
        // Convert YouTube URLs to embed format
        if (embedUrl.includes('youtube.com/watch')) {
            const videoId = embedUrl.split('v=')[1]?.split('&')[0];
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } else if (embedUrl.includes('youtu.be/')) {
            const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }

        videoContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videoContainer.style.display = 'block';
        noVideo.style.display = 'none';
    } else {
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('noVideo').style.display = 'block';
    }
}

// Display players
function displayPlayers() {
    displayTeamPlayers('team1', team1Data);
    displayTeamPlayers('team2', team2Data);
    populateYouthStatPlayerDropdown();
}

// Populate the player dropdown for youth stat section
function populateYouthStatPlayerDropdown() {
    const dropdown = document.getElementById('youthStatPlayer');
    dropdown.innerHTML = '<option value="">Select a player...</option>';

    // Add players from team 1
    if (team1Data && team1Data.players) {
        team1Data.players.forEach(player => {
            const playerId = typeof player === 'object' ? (player._id || player) : player;
            const playerName = typeof player === 'object' ? (player.name || player._id) : player;
            const option = document.createElement('option');
            option.value = playerId;
            option.textContent = `${playerName} (${currentGame.team1})`;
            dropdown.appendChild(option);
        });
    }

    // Add players from team 2
    if (team2Data && team2Data.players) {
        team2Data.players.forEach(player => {
            const playerId = typeof player === 'object' ? (player._id || player) : player;
            const playerName = typeof player === 'object' ? (player.name || player._id) : player;
            const option = document.createElement('option');
            option.value = playerId;
            option.textContent = `${playerName} (${currentGame.team2})`;
            dropdown.appendChild(option);
        });
    }
}

function displayTeamPlayers(teamPrefix, teamData) {
    const playersList = document.getElementById(`${teamPrefix}Players`);
    playersList.innerHTML = '';

    if (!teamData || !teamData.players || teamData.players.length === 0) {
        playersList.innerHTML = '<li class="player-item">No players registered</li>';
        return;
    }

    teamData.players.forEach(player => {
        const playerId = typeof player === 'object' ? (player._id || player) : player;
        const playerName = typeof player === 'object' ? (player.name || player._id) : player;

        // Get stats for this player from the game
        const playerStats = (currentGame.playerStats || []).filter(stat => stat.playerId === playerId);

        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <div class="player-name">${escapeHtml(playerName)}</div>
            <div class="player-stats">
                ${playerStats.length > 0 
                    ? playerStats.map(stat => `
                        <div class="stat-item">
                            <span>${escapeHtml(stat.statType)}:</span>
                            <strong>${stat.value}</strong>
                        </div>
                    `).join('')
                    : '<div style="color: #999; font-style: italic;">No stats yet</div>'
                }
            </div>
            ${currentUser.permission === 0 ? `
                <button class="btn btn-primary" onclick="showAddStatForm('${teamPrefix}', '${playerId}')" style="margin-top: 10px;">Add Stat</button>
                <div class="add-stat-form admin-only" id="statForm-${teamPrefix}-${playerId}" style="display: none;">
                    <div class="form-group">
                        <label>Stat Type:</label>
                        <select id="statType-${teamPrefix}-${playerId}">
                            <option value="points">Points</option>
                            <option value="goals">Goals</option>
                            <option value="assists">Assists</option>
                            <option value="rebounds">Rebounds</option>
                            <option value="steals">Steals</option>
                            <option value="blocks">Blocks</option>
                            <option value="fouls">Fouls</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Value:</label>
                        <input type="number" id="statValue-${teamPrefix}-${playerId}" min="0" value="1">
                    </div>
                    <button class="btn btn-success" onclick="addPlayerStat('${teamPrefix}', '${playerId}')">Add Stat</button>
                </div>
            ` : ''}
        `;
        playersList.appendChild(li);
    });
}

// Show add stat form
function showAddStatForm(teamPrefix, playerId) {
    if (currentUser.permission !== 0) {
        alert('Only admins can add stats');
        return;
    }
    const form = document.getElementById(`statForm-${teamPrefix}-${playerId}`);
    if (form) {
        form.style.display = form.style.display === 'block' ? 'none' : 'block';
    }
}

// Update score
async function updateScore() {
    if (currentUser.permission !== 0) {
        alert('Only admins can update scores');
        return;
    }

    const team1Score = parseInt(document.getElementById('team1ScoreInput').value) || 0;
    const team2Score = parseInt(document.getElementById('team2ScoreInput').value) || 0;

    try {
        const response = await fetch(`/games/${gameId}/score`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                team1Score: team1Score,
                team2Score: team2Score
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess('Score updated successfully!');
            currentGame.team1Score = team1Score;
            currentGame.team2Score = team2Score;
            document.getElementById('team1Score').textContent = team1Score;
            document.getElementById('team2Score').textContent = team2Score;
        } else {
            alert('Error updating score: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating score:', error);
        alert('Failed to update score');
    }
}

// Add player stat
async function addPlayerStat(teamPrefix, playerId) {
    if (currentUser.permission !== 0) {
        alert('Only admins can add stats');
        return;
    }

    const statType = document.getElementById(`statType-${teamPrefix}-${playerId}`).value;
    const value = parseInt(document.getElementById(`statValue-${teamPrefix}-${playerId}`).value) || 0;

    try {
        const response = await fetch(`/games/${gameId}/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerId: playerId,
                statType: statType,
                value: value
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess('Stat added successfully!');
            currentGame = result.game;
            displayPlayers();
            const form = document.getElementById(`statForm-${teamPrefix}-${playerId}`);
            if (form) form.style.display = 'none';
        } else {
            alert('Error adding stat: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding stat:', error);
        alert('Failed to add stat');
    }
}

// Show error message
function showError(message) {
    document.getElementById('loadingMessage').style.display = 'none';
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
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

// Add stat to youth profile
async function addYouthStat() {
    if (currentUser.permission !== 0) {
        alert('Only admins can add stats to youth profiles');
        return;
    }

    const playerId = document.getElementById('youthStatPlayer').value;
    const statType = document.getElementById('youthStatType').value;
    const value = parseInt(document.getElementById('youthStatValue').value) || 0;
    const gameIdValue = document.getElementById('youthStatGameId').value;

    if (!playerId) {
        alert('Please select a player');
        return;
    }

    if (!statType) {
        alert('Please select a stat type');
        return;
    }

    if (!gameIdValue) {
        alert('Game ID is missing');
        return;
    }

    try {
        console.log('Frontend: Adding youth stat:', { playerId, statType, value, gameId: gameIdValue });
        const response = await fetch('/youth/addstat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: playerId,
                statType: statType,
                value: value,
                gameId: gameIdValue
            })
        });

        const result = await response.json();
        console.log('Frontend: Youth stat response:', result);

        if (response.ok && result.success) {
            showSuccess('Stat added to player profile successfully!');
            // Clear form
            document.getElementById('youthStatPlayer').value = '';
            document.getElementById('youthStatValue').value = 1;
        } else {
            alert('Error adding stat: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding youth stat:', error);
        alert('Failed to add stat to player profile');
    }
}

// Escape HTML
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
    await fetchLoggedUser();
    await loadGameDetails();
});