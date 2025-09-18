// Map Management
const MapManager = {
    maps: {},
    currentLocation: null,

    // Initialize map manager
    init() {
        console.log('MapManager initialized');
    },

    // Initialize user map for location selection
    initializeUserMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer || this.maps.userMap) return;

        this.maps.userMap = L.map('mapContainer').setView([40.7128, -74.0060], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.maps.userMap);
        
        // Add click handler for location selection
        this.maps.userMap.on('click', (e) => {
            this.selectLocation(e.latlng);
        });

        // Add current location button
        this.addCurrentLocationButton(this.maps.userMap);
    },

    // Initialize admin map
    initializeAdminMap() {
        const mapContainer = document.getElementById('adminMapContainer');
        if (!mapContainer) return;

        if (this.maps.adminMap) {
            this.maps.adminMap.remove();
        }

        this.maps.adminMap = L.map('adminMapContainer').setView([40.7128, -74.0060], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.maps.adminMap);
        
        this.addIssueMarkers(this.maps.adminMap, DataManager.getAllIssues());
    },

    // Initialize officer map
    initializeOfficerMap() {
        const mapContainer = document.getElementById('officerMapContainer');
        if (!mapContainer) return;

        if (this.maps.officerMap) {
            this.maps.officerMap.remove();
        }

        this.maps.officerMap = L.map('officerMapContainer').setView([40.7128, -74.0060], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.maps.officerMap);
        
        const currentUser = App.getCurrentUser();
        const assignedIssues = DataManager.getIssuesByOfficer(currentUser.email);
        this.addIssueMarkers(this.maps.officerMap, assignedIssues);
    },

    // Add issue markers to map
    addIssueMarkers(map, issues) {
        // Clear existing markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each issue
        issues.forEach(issue => {
            if (issue.coordinates && issue.coordinates.length === 2) {
                const color = Utils.getUrgencyColor(issue.urgency);
                const marker = L.circleMarker(issue.coordinates, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    radius: 8,
                    weight: 2
                }).addTo(map);
                
                // Add popup with issue details
                marker.bindPopup(`
                    <div class="map-popup">
                        <h4>${Utils.sanitizeHtml(issue.title)}</h4>
                        <p><strong>Status:</strong> <span class="status-${issue.status}">${Utils.formatStatus(issue.status)}</span></p>
                        <p><strong>Urgency:</strong> <span class="urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span></p>
                        <p><strong>Location:</strong> ${Utils.sanitizeHtml(issue.location)}</p>
                        <p><strong>Submitted:</strong> ${Utils.formatDate(issue.submittedDate)}</p>
                        <button onclick="App.getModule('adminDashboard').viewIssueDetails(${issue.id})" class="btn-primary btn-sm">View Details</button>
                    </div>
                `);
            }
        });

        // Fit map to show all markers
        if (issues.length > 0) {
            const group = new L.featureGroup();
            issues.forEach(issue => {
                if (issue.coordinates) {
                    group.addLayer(L.marker(issue.coordinates));
                }
            });
            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }
    },

    // Select location on map
    selectLocation(latlng) {
        this.currentLocation = [latlng.lat, latlng.lng];
        
        // Update location input
        const locationInput = document.getElementById('issueLocation');
        if (locationInput) {
            locationInput.value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        }
        
        // Clear existing markers
        this.maps.userMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.maps.userMap.removeLayer(layer);
            }
        });
        
        // Add new marker
        L.marker([latlng.lat, latlng.lng]).addTo(this.maps.userMap)
            .bindPopup('Selected Location').openPopup();
    },

    // Add current location button
    addCurrentLocationButton(map) {
        const button = L.control({ position: 'topright' });
        
        button.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'current-location-btn');
            div.innerHTML = '<i class="fas fa-crosshairs"></i>';
            div.title = 'Get current location';
            
            div.onclick = function() {
                MapManager.getCurrentLocation();
            };
            
            return div;
        };
        
        button.addTo(map);
    },

    // Get current location
    getCurrentLocation() {
        if (!navigator.geolocation) {
            Notifications.error('Geolocation is not supported by this browser');
            return;
        }

        Notifications.info('Getting your location...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                this.selectLocation({ lat, lng });
                this.maps.userMap.setView([lat, lng], 15);
                
                Notifications.success('Location found!');
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                Notifications.error(message);
            }
        );
    },

    // Get current location coordinates
    getCurrentLocationCoords() {
        return this.currentLocation;
    },

    // Clear current location
    clearCurrentLocation() {
        this.currentLocation = null;
    },

    // Update map markers
    updateMapMarkers(mapType) {
        switch (mapType) {
            case 'admin':
                this.initializeAdminMap();
                break;
            case 'officer':
                this.initializeOfficerMap();
                break;
        }
    },

    // Show location map
    showLocationMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.display = mapContainer.style.display === 'none' ? 'block' : 'none';
            
            if (!this.maps.userMap) {
                setTimeout(() => {
                    this.initializeUserMap();
                }, 100);
            }
        }
    },

    // Hide location map
    hideLocationMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.display = 'none';
        }
    }
};

// Make MapManager globally available
window.MapManager = MapManager;
