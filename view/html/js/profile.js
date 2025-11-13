  const USER_PERMISSIONS = { ADMIN: 0, ADULT: 1, COACH: 2, YOUTH: 3, GUEST: 4 };
  const PERM_TO_STRING = { 0: 'Admin', 1: 'Adult', 2: 'Coach', 3: 'Youth', 4: 'Guest' };

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

    // TODO: Adapt to use datagroups
    $('.user_name').text(user.username);
    $('.user_team').text(user.team || "N/A");
    $('.user_acctype').text(PERM_TO_STRING[user.permission]);
    $('.user_position').text(user.position || "N/A");


}

async function populateAdultYouthAccounts() {
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
            name: youth_user.name,
            adult_name: adult_user.name,
            adult_email: adult_user.email
        };
        youth_user_data.push(composite_data);
    }
    // Populate table
    for (let yud of youth_user_data) {
        let tr = document.createElement("tr");
        for (let attr of Object.keys(yud)) {
            let td = document.createElement("td");
            td.innerText = yud[attr];
            tr.appendChild(td);
        }
        // Add to team button
        let buttonTd = document.createElement("td");
        let button = document.createElement("button");
        button.classList.add("btn", "btn-purple");
        button.innerText = "Add to Team";
        buttonTd.appendChild(button);
        tr.appendChild(buttonTd);
        tbody.appendChild(tr);
    }
}

module.exports = {
    USER_PERMISSIONS,
    PERM_TO_STRING,
    toggleAccInfo,
    toggleGameStats,
    toggleActions,
    setupProfileTabs,
    populateProfileInfo,
    populateAdultYouthAccounts,
    populateCoachYouthAccounts
};

setupProfileTabs();
populateProfileInfo();
populateAdultYouthAccounts();
populateCoachYouthAccounts();