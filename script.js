//to save the selected mood and journal entry in local storage
document.addEventListener('DOMContentLoaded', function() {
    const moodbtns = document.querySelectorAll(".moodbtns button");
    const journaltxtarea = document.querySelector(".journal textarea");
    const savebtn = document.querySelector(".journalbtn button");
    const savedMood = localStorage.getItem("selectedMood");
    const journalEntry = localStorage.getItem("journalEntry");

    if (savedMood) {
        moodbtns.forEach(button => {
            if (button.innerText.trim() === savedMood) {
                button.classList.add("selected");
            }
        });
    }
    if (journalEntry) {
        journaltxtarea.value = journalEntry;
    }
    moodbtns.forEach(button => {
        button.addEventListener("click", function() {
            moodbtns.forEach(btn => btn.classList.remove("selected")); 
            this.classList.add("selected"); 
            localStorage.setItem("selectedMood", this.innerText.trim()); 
        });
    });
    savebtn.addEventListener("click", function() {
        const journaltext = journaltxtarea.value.trim();
        localStorage.setItem("journalEntry", journaltext); 
        alert("Journal Entry Saved!");
    });

    //to generate playlist based on the selected mood
    const playlistBtn = document.querySelector("#authorizeSpotify");
    const clientId = "06fc26421880412b89d5ef7a6de6b8a5";
    const redirectUri = "http://localhost:5501/";
    let accessToken = localStorage.getItem("spotifyAccessToken");
    // Authenticate with Spotify
    function authenticateSpotify() {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=playlist-read-private%20playlist-read-collaborative%20user-read-private%20user-read-email`;
        window.location.href = authUrl;
    }

    // Extract access token from URL
    function getAccessToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        if (params.has("access_token")) {
            accessToken = params.get("access_token");
            localStorage.setItem("spotifyAccessToken", accessToken);
            window.location.hash = "";
        }
    }

    // Fetch Mood-Based Playlist
    async function fetchPlaylist() {
        const mood = localStorage.getItem("selectedMood");
        if (!mood) {
            alert("Please select a mood first!");
            return;
        }
        if (!accessToken) {
            authenticateSpotify();
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${mood}&type=playlist&limit=1`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();
            if (data.playlists.items.length > 0) {
                const playlist = data.playlists.items[0];
                displayPlaylist(playlist);
            } else {
                alert("No playlists found for this mood.");
            }
        } catch (error) {
            console.error("Error fetching playlist:", error);
        }
    }

    // Display the Playlist
    function displayPlaylist(playlist) {
        const playlistContainer = document.querySelector(".playlist");
        playlistContainer.innerHTML = `
            <h3>${playlist.name}</h3>
            <a href="${playlist.external_urls.spotify}" target="_blank">
                <img src="${playlist.images[0].url}" alt="Playlist Cover" width="200">
            </a>
            <p><a href="${playlist.external_urls.spotify}" target="_blank"><i class="fa-solid fa-circle-play"></i></a></p>
        `;
    }

    // Event Listeners
    playlistBtn.addEventListener("click", fetchPlaylist);
    getAccessToken(); // Check for access token on page load
});

