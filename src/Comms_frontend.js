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
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
        const response = await fetch(`/comms/deleteMessage/${messageId}`, {
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
        const response = await fetch(`/comms/updateMessage/${messageId}`, {
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
        const response = await fetch(`/comms/addReply/${messageId}`, {
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

        const response = await fetch('/comms/uploadPhoto', {
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

                if (msg.photo) {
                    const photo = document.createElement('img');
                    photo.src = msg.photo;
                    photo.alt = "Attached photo";
                    photo.style.maxWidth = "100%";
                    msgDiv.appendChild(photo);
                }

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
        alert("Network error. Please try again.");
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

window.getAuthorType = getAuthorType;
window.checkLoginStatus = checkLoginStatus;
window.postMessage = postMessage;
window.deleteMessage = deleteMessage;
window.updateMessage = updateMessage;
window.replyToMessage = replyToMessage;
window.uploadPhoto = uploadPhoto;
window.viewMessages = viewMessages;
window.toggleMessages = toggleMessages;