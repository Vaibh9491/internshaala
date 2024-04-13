let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
}

document.querySelectorAll(".summary-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const address = button.getAttribute("data-address");
    showAddressOnMap(address);
  });
});

function showAddressOnMap(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(12);
      clearMarkers();
      const marker = new google.maps.Marker({
        map: map,
        position: location,
      });
      markers.push(marker);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}
const loadingIndicator = document.getElementById('loadingIndicator');
const profileDetailsContainer = document.getElementById('profileDetails');

function showLoadingIndicator() {
  loadingIndicator.style.display = 'block';
}

function hideLoadingIndicator() {
  loadingIndicator.style.display = 'none';
}

// Function to display profile details
function showProfileDetails(profile) {
  const profileDetails = `
    <h2>${profile.name}</h2>
    <img src="${profile.photoUrl}" alt="${profile.name}">
    <p>${profile.description}</p>
    <p>Address: ${profile.address}</p>
    <!-- Add additional profile details here -->
  `;
  profileDetailsContainer.innerHTML = profileDetails;
  profileDetailsContainer.style.display = 'block';
}

// Function to hide profile details
function hideProfileDetails() {
  profileDetailsContainer.innerHTML = '';
  profileDetailsContainer.style.display = 'none';
}

// Add event listeners to profile cards to show profile details on click
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('profile-card')) {
    const profile = event.target.dataset.profile;
    showProfileDetails(JSON.parse(profile));
  }
});

// Fetch profiles and update UI
async function fetchProfiles() {
  try {
    const response = await fetch('/api/profiles');
    const profiles = await response.json();
    const profilesContainer = document.querySelector('.profiles-container');
    profilesContainer.innerHTML = '';
    profiles.forEach(profile => {
      const profileCard = `
        <div class="profile-card" data-profile="${JSON.stringify(profile)}">
          <img src="${profile.photoUrl}" alt="${profile.name}">
          <h3>${profile.name}</h3>
        </div>
      `;
      profilesContainer.innerHTML += profileCard;
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
  }
}
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  photoUrl: String,
  description: String,
  address: String
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Profile = require('./models/Profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/profilesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Error connecting to MongoDB", err);
});

// Routes
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    console.error("Error fetching profiles", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error("Error creating profile", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add other routes for updating and deleting profiles

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
