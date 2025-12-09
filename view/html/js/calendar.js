let currentGameId = null;
let calendarInstance = null;

console.log('calendar.js loaded');

// Generate unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Popup management - will be initialized when DOM is ready
let popup, 
closeBtn, 
viewGameBtn, 
editBtn,
deleteBtn, 
cancelEditBtn, 
editForm, 
updateGameForm, 
actionButtons, 
createGameForm;

async function populateTeamOptions() {
    let teamResp = await fetch('/teams');
    
    let teams = await teamResp.json();
    if (teams.error) {  
        console.error('Error fetching teams:', teams.error);
        return;
    }

    console.log('Fetched teams:', teams);

    let team1Select = document.getElementById('team1');
    let team2Select = document.getElementById('team2');
    let editTeam1Select = document.getElementById('edit-team1');
    let editTeam2Select = document.getElementById('edit-team2');

    for (let team of teams) {
        let option1 = document.createElement('option');
        option1.value = team._id.toString();
        option1.textContent = team.teamName;
        team1Select.appendChild(option1);
        editTeam1Select.appendChild(option1.cloneNode(true));

        let option2 = document.createElement('option');
        option2.value = team._id.toString();
        option2.textContent = team.teamName;
        team2Select.appendChild(option2);
        editTeam2Select.appendChild(option2.cloneNode(true));
    }
}

function showGameDetails(game) {
    currentGameId = game._id; // Update currentGameId when a game is clicked
    console.log(`Showing details for gameId: ${currentGameId}`); // Debugging log

    // Populate display fields
    document.getElementById('popup-team1').textContent = game.team1;
    document.getElementById('popup-team2').textContent = game.team2;
    document.getElementById('popup-date').textContent = new Date(game.date).toLocaleDateString();
    document.getElementById('popup-startTime').textContent = new Date(game.startTime).toLocaleDateString();
    document.getElementById('popup-endTime').textContent = new Date(game.endTime).toLocaleDateString();
    document.getElementById('popup-location').textContent = game.location || 'TBD';

    // Handle live link
    const linkContainer = document.getElementById('popup-link-container');
    const linkElement = document.getElementById('popup-link');
    if (game.link && game.link.trim() !== '') {
        linkElement.href = game.link;
        linkContainer.style.display = 'block';
    } else {
        linkContainer.style.display = 'none';
    }

    // Populate edit form
    document.getElementById('edit-game-id').value = game._id;
    // Get the initial team info from the existing select options from populateTeamOptions
    document.getElementById('edit-team1').value = game.team1_id;
    document.getElementById('edit-team2').value = game.team2_id;


    // Format date for input (YYYY-MM-DD)
    const dateObj = new Date(game.date);
    const dateStr = dateObj.toISOString().split('T')[0];
    document.getElementById('edit-date').value = dateStr;
    document.getElementById('edit-startTime').value = game.startTime || '';
    document.getElementById('edit-endTime').value = game.endTime || '';

    document.getElementById('edit-location').value = game.location || '';
    document.getElementById('edit-link').value = game.link || '';

    // Show chat feature
    const liveGameChat = document.getElementById('liveGameChat');
    liveGameChat.style.display = 'block';

    // Show popup
    popup.style.display = 'block';
    editForm.style.display = 'none';
    actionButtons.style.display = 'flex';

    // Automatically load messages for the selected game
    viewMessages(); // Call viewMessages to fetch messages for the selected game
}

function initializeEventHandlers() {
    popup = document.getElementById('gamePopup');
    closeBtn = document.getElementById('closePopup');
    viewGameBtn = document.getElementById('viewGameBtn');
    editBtn = document.getElementById('editGameBtn');
    deleteBtn = document.getElementById('deleteGameBtn');
    cancelEditBtn = document.getElementById('cancelEdit');
    editForm = document.getElementById('editForm');
    updateGameForm = document.getElementById('updateGameForm');
    actionButtons = document.getElementById('actionButtons');
    createGameForm = document.getElementById('createGameForm');

    closeBtn.onclick = function() {
        popup.style.display = 'none';
        editForm.style.display = 'none';
        actionButtons.style.display = 'flex';
    };

    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = 'none';
            editForm.style.display = 'none';
            actionButtons.style.display = 'flex';
        }
    };

    // Handle create game form submission
    createGameForm.onsubmit = async function(e) {
        e.preventDefault();
        
        const gameData = {
            team1_id: document.getElementById('team1').value,
            team2_id: document.getElementById('team2').value,
            date: document.getElementById('date').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            location: document.getElementById('location').value,
            link: document.getElementById('link').value || ''
        };

        console.log('Submitting game data:', gameData);

        try {
            const res = await fetch('/gameCreate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameData)
            });
            
            console.log('Response status:', res.status);
            const result = await res.json();
            console.log('Response body:', result);
            
            if (res.ok && result.success) {
                alert('Game created successfully!');
                createGameForm.reset();
                // Reload calendar
                const events = await loadGames();
                calendarInstance.removeAllEvents();
                calendarInstance.addEventSource(events);
            } else {
                console.error('Game creation failed:', result);
                alert('Error creating game: ' + (result.error || 'Unknown error') + (result.details ? '\nDetails: ' + result.details : ''));
            }
        } catch (error) {
            console.error('Error creating game:', error);
            alert('Failed to create game. Please try again.');
        }
    };

    viewGameBtn.onclick = function() {
        // Navigate to game detail page with game ID in URL
        window.location.href = `/game-detail.html?id=${currentGameId}`;
    };

    editBtn.onclick = function() {
        editForm.style.display = 'block';
        actionButtons.style.display = 'none';
    };

    cancelEditBtn.onclick = function() {
        editForm.style.display = 'none';
        actionButtons.style.display = 'flex';
    };

    updateGameForm.onsubmit = async function(e) {
        e.preventDefault();
        const gameId = document.getElementById('edit-game-id').value;
        
        const updateData = {
            team1: document.getElementById('edit-team1').value,
            team2: document.getElementById('edit-team2').value,
            date: document.getElementById('edit-date').value,
            startTime: document.getElementById('edit-startTime').value,
            endTime: document.getElementById('edit-endTime').value,
            location: document.getElementById('edit-location').value,
            link: document.getElementById('edit-link').value
        };

        try {
            const res = await fetch(`/games/${gameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const result = await res.json();
            if (res.ok && result.success) {
                alert('Game updated successfully!');
                popup.style.display = 'none';
                // Reload calendar
                const events = await loadGames();
                calendarInstance.removeAllEvents();
                calendarInstance.addEventSource(events);
            } else {
                alert('Error updating game: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating game:', error);
            alert('Failed to update game. Please try again.');
        }
    };

    deleteBtn.onclick = async function() {
        if (!confirm('Are you sure you want to delete this game?')) {
            return;
        }

        try {
            const res = await fetch(`/games/${currentGameId}`, {
                method: 'DELETE'
            });
            
            const result = await res.json();
            if (res.ok && result.success) {
                alert('Game deleted successfully!');
                popup.style.display = 'none';
                // Reload calendar
                const events = await loadGames();
                calendarInstance.removeAllEvents();
                calendarInstance.addEventSource(events);
            } else {
                alert('Error deleting game: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Failed to delete game. Please try again.');
        }
    };
}

async function loadGames() {
    try {
        const res = await fetch('/games');
        const data = await res.json();
        
        // Handle new response format { games: [...] }
        const gamesList = data.games || data;
        if (!Array.isArray(gamesList)) return [];
        
        // Now games already have team names from the backend
        const games = [];
        for (const g of gamesList.filter(g => !!g.date)) {
            games.push({
                title: `${g.team1 || 'Unknown'} vs ${g.team2 || 'Unknown'}`,
                start: g.date,
                extendedProps: { 
                    _id: g._id,
                    location: g.location, 
                    team1: g.team1,
                    team2: g.team2,
                    team1_id: g.id_team1,
                    team2_id: g.id_team2,
                    startTime: g.startTime,
                    endTime: g.endTime,
                    date: g.date,
                    link: g.link
                }
            });
        }
        
        return games;
    } catch (e) {
        console.error('Failed to load games', e);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function() {    
    // Initialize event handlers first
    initializeEventHandlers();
    
    // Populate team dropdowns
    await populateTeamOptions();
    
    // Finally load and render the calendar
    const events = await loadGames();
    const el = document.getElementById('calendar');
    calendarInstance = new FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        events: events,
        eventClick: function(info) { 
            showGameDetails(info.event.extendedProps); 
        },
        headerToolbar: { 
            left: 'prev,next today', 
            center: 'title', 
            right: 'dayGridMonth,dayGridWeek' 
        }
    });
    calendarInstance.render();
});

function getAuthorType(permission) {
    switch (permission) {
        case 1: return 'Coach';
        case 2: return 'Parent';
        case 3: return 'Player';
        default: return 'User';
    }
}

async function checkLoginStatus() {
    try {
        const response = await fetch('/loggedUser', { credentials: 'include' }).then(res => res.json());
        if (response.status === 401) {
            window.location.href = '../view/html/login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}
async function postMessage() {
    const messageBody = document.getElementById('messageBody').value;
    if (!messageBody) {
        alert("Message cannot be empty.");
        return;
    }

    try {
        const response = await fetch('/calendar/postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageBody, gameId: currentGameId, date: new Date() }),
            credentials: 'include', 
        });

        if (response.ok) {
            viewMessages();

            console.log("Post successful:", result);
            document.getElementById("confirmationMessage").style.display = "block";
            setTimeout(() => {
                document.getElementById("confirmationMessage").style.display = "none";
            }, 3000);
            document.getElementById("messageForm").reset();
        } else {
            const result = await response.json();
            console.error("Post failed:", result.error || "Unknown server error.");
            alert("Failed to post message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Error during postMessage execution:', error);
    }
}

async function deleteMessage(messageId) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
        const response = await fetch(`/calendar/deleteMessage/${messageId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            viewMessages();
        } else {
            const result = await response.json();
            alert("Failed to delete message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during delete:', error);
        alert("Network error. Please try again.");
    }
}

async function updateMessage(messageId) {
    const newMessage = prompt("Enter the edited message:");
    if (!newMessage) return;

    try {
        const response = await fetch(`/calendar/updateMessage/${messageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: newMessage }),
            credentials: 'include',
        });

        if (response.ok) {
            viewMessages();
        } else {
            const result = await response.json();
            alert("Failed to edit message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during update:', error);
        alert("Network error. Please try again.");
    }
}

async function replyToMessage(messageId) {
    const replyMessage = prompt("Enter your reply:");
    if (!replyMessage) return;

    try {
        const response = await fetch(`/calendar/addReply/${messageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: replyMessage }),
            credentials: 'include',
        });

        if (response.ok) {
            viewMessages();
        } else {
            const result = await response.json();
            alert("Failed to add reply: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during reply:', error);
        alert("Network error. Please try again.");
    }
}

async function uploadPhoto() {
    const photoInput = document.getElementById('photoInput');
    const messageBody = document.getElementById('messageBody').value;

    if (!photoInput.files.length || !messageBody) {
        alert("Please select a photo.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        formData.append('message', messageBody);

        const response = await fetch('/calendar/uploadPhoto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formData,
            credentials: 'include', 
        });

        if (response.ok) {
            viewMessages();
        } else {
            const result = await response.json();
            console.error("Post failed:", result.error || "Unknown server error.");
            alert("Failed to post message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during post:', error);
        alert("Network error. Please try again.");
    }
}   

async function uploadVideo() {
    const photoInput = document.getElementById('videoInput');
    const messageBody = document.getElementById('messageBody').value;

    if (!videoInput.files.length || !messageBody) {
        alert("Please select a video.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('video', videoInput.files[0]);
        formData.append('message', messageBody);

        const response = await fetch('/calendar/uploadVideo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formData,
            credentials: 'include', 
        });

        if (response.ok) {
            viewMessages();
        } else {
            const result = await response.json();
            console.error("Post failed:", result.error || "Unknown server error.");
            alert("Failed to post message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during post:', error);
        alert("Network error. Please try again.");
    }
}

async function viewMessages() {
    if (!currentGameId) {
        console.error("No game selected. currentGameId is null or undefined.");
        alert("Please select a game to view messages.");
        return;
    }

    try {

        const response = await fetch(`/calendar/viewMessages?gameId=${currentGameId}`, { 
            method: 'GET',
            credentials: 'include', 
        });

        console.log(`Response status: ${response.status}`); 

        if (response.ok) {
            // alert("Messages retrieved successfully. calendar.jss");
            const data = await response.json();
            console.log("Fetched messages:", data); 
            const messageList = document.getElementById('messageList');
            messageList.innerHTML = '';

            const user = await fetch('/loggedUser', { credentials: 'include' }).then(res => res.json());


            if (data.messages.length === 0) {
                messageList.innerHTML = '<p>No messages found for this game.</p>';
                return;
            }

            data.messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('message');
                msgDiv.innerHTML = `<p><strong>${msg.author}:</strong> ${msg.message}</p>`;
                messageList.appendChild(msgDiv);
            


                if (user.name === msg.author) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.classList.add('delete-btn');
                    deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;
                    deleteBtn.onclick = () => deleteMessage(msg._id);

                    const updateBtn = document.createElement('button');
                    updateBtn.classList.add('update-btn');
                    updateBtn.innerHTML = `<i class="bi bi-pencil"></i>`;
                    updateBtn.onclick = () => updateMessage(msg._id);

                    msgDiv.appendChild(deleteBtn);
                    msgDiv.appendChild(updateBtn);
                }

                const replyBtn = document.createElement('button');
                replyBtn.classList.add('reply-btn');
                replyBtn.innerHTML = `<i class="bi bi-reply"></i>`;
                replyBtn.onclick = () => replyToMessage(msg._id);
                msgDiv.appendChild(replyBtn);

                if (msg.replies && msg.replies.length > 0) {
                    const repliesDiv = document.createElement('div');
                    repliesDiv.classList.add('replies');
                    msg.replies.forEach(reply => {
                        const replyDiv = document.createElement('div');
                        replyDiv.classList.add('reply');
                        replyDiv.innerHTML = `
                            <p><strong>${reply.email}:</strong> ${reply.message}</p>
                            <p class="reply-date">${new Date(reply.date).toLocaleString()}</p>
                        `;
                        repliesDiv.appendChild(replyDiv);
                    });
                    msgDiv.appendChild(repliesDiv);
                }

                messageList.appendChild(msgDiv);
            });
        } else {
            const result = await response.json();
            console.error("Failed to fetch messages:", result.error || "Unknown server error.");
            alert("Failed to fetch messages: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during message retrieval:', error); 
        alert("View Messages. Network error. Please try again. View");
    }
}

function toggleMessages() {
    const messageList = document.getElementById('messageList');
    const hideBtn = document.querySelector('.hide-btn');

    if (messageList.style.display === 'none' ){ 
        messageList.style.display = 'block';
        hideBtn.textContent = 'Hide Messages';
    } else {
        messageList.style.display = 'none';
        hideBtn.textContent = 'View Messages';
    }
}