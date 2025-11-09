function getAuthorType(permission) {
    switch (permission) {
        case 1: return 'Coach';
        case 2: return 'Parent';
        case 3: return 'Player';
        default: return 'User';
    }
}

async function checkLoginStatus() {
    return true; 
}

async function postMessage() {
    const messageBody = document.getElementById('messageBody').value;
    if (!messageBody) {
        alert("Message cannot be empty.");
        return;
    }

    try {
        const response = await fetch('/comms/postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageBody }),
            credentials: 'include', 
        });

        if (response.ok) {
            document.getElementById("confirmationMessage").style.display = "block";
            setTimeout(() => {
                document.getElementById("confirmationMessage").style.display = "none";
            }, 3000);
            document.getElementById("messageForm").reset();
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

async function deleteMessage(messageId) {
    try {
        const response = await fetch(`/comms/deleteMessage/${messageId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            alert("Message deleted successfully.");
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
    const newMessage = prompt("Enter the updated message:");
    if (!newMessage) return;

    try {
        const response = await fetch(`/comms/updateMessage/${messageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: newMessage }),
            credentials: 'include',
        });

        if (response.ok) {
            alert("Message updated successfully.");
            viewMessages();
        } else {
            const result = await response.json();
            alert("Failed to update message: " + (result.error || "Unknown error."));
        }
    } catch (error) {
        console.error('Network error during update:', error);
        alert("Network error. Please try again.");
    }
}

async function viewMessages() {
    try {
        const response = await fetch('/comms/viewMessages', {
            method: 'GET',
            credentials: 'include', 
        });

        console.log("Response status:", response.status); 

        if (response.ok) {
            const data = await response.json();
            console.log("Fetched messages:", data); 
            const messageList = document.getElementById('messageList');
            messageList.innerHTML = '';

            const user = await fetch('/loggedUser', { credentials: 'include' }).then(res => res.json());

            data.messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('message');

                const authorType = getAuthorType(msg.authorType);
                const updatedAt = msg.edited ? ` (updated at ${new Date(msg.dateEdited).toLocaleString()})` : '';

                msgDiv.innerHTML = `
                    <p><strong>${msg.author} (${authorType})${updatedAt}:</strong></p>
                    <p>${msg.message}</p>
                `;

                if (user.name === msg.author) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.onclick = () => deleteMessage(msg._id);

                    const updateBtn = document.createElement('button');
                    updateBtn.textContent = 'Update';
                    updateBtn.onclick = () => updateMessage(msg._id);

                    msgDiv.appendChild(deleteBtn);
                    msgDiv.appendChild(updateBtn);
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
        alert("Network error. Please try again.");
    }
}

function toggleMessages() {
    const messageList = document.getElementById('messageList');
    const hideBtn = document.querySelector('.hide-btn');

    if (messageList.style.display === 'none') {
        messageList.style.display = 'block';
        hideBtn.textContent = 'Hide Messages';
    } else {
        messageList.style.display = 'none';
        hideBtn.textContent = 'View Messages';
    }
}
