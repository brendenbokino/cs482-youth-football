
async function checkLoggedUser(){
    let response = await fetch('/loggeduser');
    let user =  await response.json();   

    if (user != null) {
        /**if (user.permission >= 1 && user.permission <= 3) { // User is an adult, coach, or youth
            document.getElementById("team-page").style.display = "inherit";
        }*/

        if (user.permission == 0) { // User is an admin
            document.getElementById("admin-page").style.display = "inherit";
        }

        document.getElementById("menu-profile").style.display ="inherit";
        document.getElementById("menu-logout").style.display = "inherit";
        document.getElementById("menu-login").style.display = "none";
        document.getElementById("menu-register").style.display = "none";
    } 
}

checkLoggedUser();