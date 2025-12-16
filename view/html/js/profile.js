import { USER_PERMISSIONS, PERM_TO_STRING } from './constants.js';

let active = "accinfo";
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

async function fetchLoggedUser() {
    let response = await fetch('/loggeduser');
    let user =  await response.json();   
    return user;
}

async function fetchProfileUser() {
    if (userId == null) {
        return null;
    }
    let response = await fetch(`/user/${userId}`);
    let user =  await response.json();
    
    if (user.permission) {
        if (user.permission == USER_PERMISSIONS.YOUTH) {
            let youthInfo = await fetch(`/youth/${user._id}`);
            let youthData = await youthInfo.json();
            user.youthInfo = youthData;
        } else if (user.permission == USER_PERMISSIONS.COACH) {
            let teamResp = await fetch(`/teams/coach/${user._id}`);
            if (teamResp.ok) {
                let teamData = await teamResp.json();
                user.coachInfo = {team: teamData.team || null};
            } else {
                user.coachInfo = {team: null};
            }
        }
    }
    
    return user;
}

function disableActiveTab() {
    if (active === "accinfo") {
        toggleAccInfo(false);
    } else if (active === "gamestats") {
        toggleGameStats(false);
    } else if (active === "actions") {
        toggleActions(false);
    }
}

function toggleSection(link, section, visible) {
    if (visible) {
        section.style.display = "block";
        link.classList.add("active");
        link.setAttribute("aria-current", "true");
    } else {
        link.classList.remove("active");
        link.setAttribute("aria-current", "false");
        section.style.display = "none";
    }
}

function toggleAccInfo(visible) {
    if (active === "accinfo" && visible) {
        return;
    }

    let link = document.getElementById("profile-accinfo-link");
    let element = document.getElementById("profile-accinfo");
    toggleSection(link, element, visible);
    if (visible) {
        disableActiveTab();
        active = "accinfo";
    }
}

async function toggleGameStats(visible) {
    if (active === "gamestats" && visible) {
        return;
    }

    let link = document.getElementById("profile-gamestats-link");
    let user = await fetchProfileUser();
    if (user != null) {

        if (user.permission == USER_PERMISSIONS.YOUTH) { // Youth
                let element = document.getElementById("profile-gamestats");
                toggleSection(link, element, visible);
                if (visible) {
                    disableActiveTab();
                    active = "gamestats";
                }
        }
    }
}

async function toggleActions(visible) {
    if (active === "actions" && visible) {
        return;
    }

    let link = document.getElementById("profile-actions-link");
    let elements = {
        admin: document.getElementById("profile-actions-admin"),
        adult: document.getElementById("profile-actions-adult"),
        coach: document.getElementById("profile-actions-coach"),
        youth: document.getElementById("profile-actions-youth")   
    }

    let user = await fetchProfileUser();
    if (user == null) {
        return;
    }

    let element = null;
    if (user.permission == USER_PERMISSIONS.ADMIN) { // Admin
        element = elements.admin;
    } else if (user.permission == USER_PERMISSIONS.ADULT) { // Adult
        element = elements.adult;
    } else if (user.permission == USER_PERMISSIONS.COACH) { // Coach
        element = elements.coach;
    } else if (user.permission == USER_PERMISSIONS.YOUTH) { // Youth
        element = elements.youth;
    }

    toggleSection(link, element, visible);
    if (visible) {
        disableActiveTab();
        active = "actions";
    }
}

async function setupProfileTabs() {
    let accInfoTab = document.getElementById("profile-accinfo-tab");
    let gameStatsTab = document.getElementById("profile-gamestats-tab");
    let actionsTab = document.getElementById("profile-actions-tab");
    let viewingUser = await fetchLoggedUser();
    let user = await fetchProfileUser();
    if (user == null) {
        return;
    }

    if (user.permission == USER_PERMISSIONS.ADMIN) { // Admin
        // Admin has no special tabs
    } else if (user.permission == USER_PERMISSIONS.COACH) { // Coach
        // Coach has no special tabs
    } else if (user.permission == USER_PERMISSIONS.ADULT) { // Adult
        // Adult has no special tabs
    } else if (user.permission == USER_PERMISSIONS.YOUTH) { // Youth
        gameStatsTab.style.display = "inherit";
    }

    accInfoTab.addEventListener("click", (e) => {
        e.preventDefault();
        toggleAccInfo(true);
    });

    gameStatsTab.addEventListener("click", (e) => {
        e.preventDefault();
        toggleGameStats(true);
    });

    actionsTab.addEventListener("click", (e) => {
        e.preventDefault();
        toggleActions(true);
    });

}

async function populateProfileInfo() {
    let user = await fetchProfileUser();
    if (user == null) {
        return;
    }

    if (user.permission == USER_PERMISSIONS.YOUTH) {
        if (user.youthInfo?.id_team) {
            try {
                let teamResp = await fetch(`/teams/${user.youthInfo.id_team}`);
                if (teamResp.ok) {
                    let teamData = await teamResp.json();
                    let team = teamData.team || teamData;
                    user.team = team.teamName || "No team assigned";
                } else {
                    user.team = "No team assigned";
                }
            } catch (error) {
                user.team = "No team assigned";
            }
        } else {
            user.team = "No team assigned";
        }
        user.position = user.youthInfo?.position || "N/A";
    } else if (user.permission == USER_PERMISSIONS.COACH) {
        user.team = user.coachInfo?.team?.teamName || "No team assigned";
    }

    $('[data-restrictview]').each(function() {
        var elementPermission = $(this).attr('data-restrictview');
        var userPermString = PERM_TO_STRING[user.permission].toLowerCase();
        var permittedGroups = elementPermission.split(' ');
        if (!permittedGroups.includes(userPermString)) {
            $(this).css('display', 'none');
        }
    });

    $('.user_name').text(user.username);
    $('.user_team').text(user.team || "N/A");
    $('.user_acctype').text(PERM_TO_STRING[user.permission]);
    $('.user_position').text(user.position || "N/A");

    if (user.permission == USER_PERMISSIONS.ADULT) {
        await viewYouthsTab();
        await approveYouthInvitesTab();
    } else if (user.permission == USER_PERMISSIONS.COACH) {
        await populateCoachYouthAccounts();
    }
}

async function viewYouthsTab() {
    let user = await fetchProfileUser();
    if (user == null) {
        return;
    }
    if (user.permission != USER_PERMISSIONS.ADULT) {
        return;
    }
    let response = await fetch(`/adult/viewyouths`);
    let youths =  await response.json();
    if (youths == null || youths.length == 0) {
        return;
    }

    let tbody = document.getElementById("adult-viewyouth-tbody");

    // Create composite youth user data
    let youth_user_data = [];
    for (let youth of youths) {
        let youth_user_resp = await fetch(`/user/${youth.id_user}`);
        let youth_user = await youth_user_resp.json();
        let composite_data = {
            user_id: youth_user._id,
            name: youth_user.name,
            position: youth.position,
            dob: youth.dob
        };
        youth_user_data.push(composite_data);
    }

    // Populate table
    for (let yud of youth_user_data) {
        let tr = document.createElement("tr");
        for (let attr of Object.keys(yud)) {
            if (attr == "user_id") {
                continue;
            }

            
            let td = document.createElement("td");
            td.innerText = yud[attr];
            tr.appendChild(td);
        }
        
        let profileTd = document.createElement("td");
        let profileLink = document.createElement("a");
        profileLink.href = `/profile.html?id=${yud.user_id}`;
        profileLink.innerText = "View Profile";
        profileTd.appendChild(profileLink);
        tr.appendChild(profileTd);
        tbody.appendChild(tr);
    }
}

async function approveYouthInvitesTab() {
    let user = await fetchProfileUser();
    if (user == null) {
        return;
    }
    if (user.permission != USER_PERMISSIONS.ADULT) {
        return;
    }
    
    // Get invites for all youths under this adult
    let invitesResp = await fetch(`/adult/viewinvites`);
    if (!invitesResp.ok) {
        console.error('Failed to fetch invites');
        return;
    }
    let invites = await invitesResp.json();
    if (invites == null || invites.length == 0) {
        return;
    }

    let tbody = document.getElementById("adult-approveyouthinvites-tbody");
    tbody.innerHTML = ''; // Clear existing rows
    
    // Populate table - one row per invite
    for (let invite of invites) {    
        let tr = document.createElement("tr");
        
        // Youth Name
        let youth_user_resp = await fetch(`/user/${invite.youth.id_user}`);
        if (!youth_user_resp.ok) continue;
        let youth_user = await youth_user_resp.json();
        let tdName = document.createElement("td");
        tdName.innerText = youth_user.name || youth_user.username;
        tr.appendChild(tdName);

        // Team Name
        let tdTeam = document.createElement("td");
        tdTeam.innerText = invite.team.teamName || "Unknown Team";
        tr.appendChild(tdTeam);

        // Coach Name
        let tdCoach = document.createElement("td");
        if (invite.coach) {
            tdCoach.innerText = invite.coach.name || invite.coach.username || "Unknown Coach";
        } else {
            tdCoach.innerText = "No Coach Assigned";
        }
        tr.appendChild(tdCoach);

        // Approve Button
        let tdApprove = document.createElement("td");
        let approveButton = document.createElement("button");
        approveButton.classList.add("btn", "btn-purple");
        approveButton.innerText = "Approve";
        approveButton.addEventListener("click", async () => {
            // Add youth to team
            let approveResp = await fetch('/adult/approveinvite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    youthId: invite.youth._id,
                    teamId: invite.id_team
                })
            });
            if (approveResp.ok) {
                // Delete the invite after successful approval
                let deleteResp = await fetch(`/invites/${invite._id}`, { method: 'DELETE' });
                if (deleteResp.ok) {
                    alert("Youth added to team successfully!");
                } else {
                    alert("Youth added but failed to remove invite.");
                }
                await approveYouthInvitesTab();
            } else {
                let errorText = await approveResp.text();
                alert(`Failed to approve invite: ${errorText}`);
            }
        });
        tdApprove.appendChild(approveButton);
        tr.appendChild(tdApprove);

        // Deny Button
        let tdDeny = document.createElement("td");
        let denyButton = document.createElement("button");
        denyButton.classList.add("btn", "btn-purple");
        denyButton.innerText = "Deny";
        denyButton.addEventListener("click", async () => {
            // Just delete the invite without adding to team
            let denyResp = await fetch(`/invites/${invite._id}`, { method: 'DELETE' });
            if (denyResp.ok) {
                alert("Invite denied.");
                await approveYouthInvitesTab();
            } else {
                let errorText = await denyResp.text();
                alert(`Failed to deny invite: ${errorText}`);
            }
        });
        tdDeny.appendChild(denyButton);
        tr.appendChild(tdDeny);

        tbody.appendChild(tr);
    }

}

async function populateCoachYouthAccounts() {
    let user = await fetchProfileUser();
    if (user == null) {
        return;
    } else if (user.permission != USER_PERMISSIONS.COACH) {
        return;
    }
    let response = await fetch(`/coach/viewyouths`);
    let youths =  await response.json();
    if (youths == null || youths.length == 0) {
        return;
    }

    let tbody = document.getElementById("coach-viewyouth-tbody");
    // Clear existing rows
    tbody.innerHTML = '';
    // Create composite youth user data
    let youth_user_data = [];
    for (let youth of youths) {
        let youth_user_resp = await fetch(`/user/${youth.id_user}`);
        if (!youth_user_resp.ok) {
            continue;
        }
        let youth_user = await youth_user_resp.json();
        let adult_user_resp = await fetch(`/user/${youth.id_adult}`);
        if (!adult_user_resp.ok) {
            continue;
        }
        let adult_user = await adult_user_resp.json();
        //TODO: Handle cases where adult user or youth user might not exist
        let composite_data = {
            id: youth._id,
            name: youth_user.name,
            adult_name: adult_user.name,
            adult_email: adult_user.email
        };
        youth_user_data.push(composite_data);
    }
    // Populate table
    for (let yud of youth_user_data) {
        // Check if the youth has already been invited to the coach's team
        let inviteResp = await fetch(`/coach/viewinvites/${yud.id}`);
        let invites = await inviteResp.json();
        let alreadyInvited = null;
        for (let inv of invites) {
            if (inv.id_team === user.coachInfo.team?._id) {
                alreadyInvited = inv._id;
                break;
            }
        }

        let tr = document.createElement("tr");
        for (let attr of Object.keys(yud)) {
            if (attr == "id") {
                continue;
            }
            let td = document.createElement("td");
            td.innerText = yud[attr];
            tr.appendChild(td);
        }
        // Invite to team button
        let buttonTd = document.createElement("td");
        let button = document.createElement("button");
        
        if (alreadyInvited) {
            button.classList.add("btn", "btn-danger");
            button.innerText = "Retract";
            button.addEventListener("click", async () => {
                // Find the invite to retract
                let retractResp = await fetch(`/invites/${alreadyInvited}`, { method: 'DELETE' });
                if (retractResp.ok) {
                    alert("Invitation retracted successfully!");
                    await populateCoachYouthAccounts();
                } else {
                    let errorText = await retractResp.text();
                    alert(`Failed to retract invitation: ${errorText}`);
                }
            });
        } else {
            button.classList.add("btn", "btn-purple");
            button.innerText = "Send";
            button.addEventListener("click", async () => {
                let response = await fetch('/coach/inviteyouth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        youthId: yud.id,
                        teamId: user.coachInfo.team?._id
                    })
                });
                if (response.ok) {
                    alert("Invitation sent successfully!");
                    await populateCoachYouthAccounts();
                } else {
                    let errorText = await response.text();
                    alert(`Failed to send invitation: ${errorText}`);
                }
            });
        }
        buttonTd.appendChild(button);
        tr.appendChild(buttonTd);
        tbody.appendChild(tr);
    }
}


setupProfileTabs();
populateProfileInfo();