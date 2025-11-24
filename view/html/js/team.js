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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await populateCoachOptions();
});