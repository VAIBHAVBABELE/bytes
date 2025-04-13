// Initialize Emergency Map
class EmergencyMap {
    constructor() {
        this.map = null;
        this.disasterMarkers = [];
        this.resourceMarkers = [];
        this.routeLayers = [];
        this.droneMarkers = [];
        this.dronesActive = false;
        this.initMap();
        this.loadMapData();
        this.setupEventListeners();
    }

    initMap() {
        // Initialize map centered on India
        this.map = L.map('main-map').setView([20.5937, 78.9629], 5);
        
        // Add base map layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Add scale control
        L.control.scale({ position: 'bottomleft' }).addTo(this.map);
    }

    loadMapData() {
        // Show loading indicator
        this.showLoading();
        
        // Simulate API calls
        Promise.all([
            this.fetchEmergencies(),
            this.fetchResources()
        ]).then(([emergencies, resources]) => {
            this.renderEmergencies(emergencies);
            this.renderResources(resources);
            this.hideLoading();
        }).catch(() => {
            // Fallback to demo data
            this.renderEmergencies(this.getDemoEmergencies());
            this.renderResources(this.getDemoResources());
            this.hideLoading();
        });
    }

    fetchEmergencies() {
        return fetch('api/emergencies.php')
            .then(response => response.json())
            .catch(() => this.getDemoEmergencies());
    }

    fetchResources() {
        return fetch('api/resources.php')
            .then(response => response.json())
            .catch(() => this.getDemoResources());
    }

    renderEmergencies(emergencies) {
        // Clear existing markers
        this.clearMarkers(this.disasterMarkers);
        
        // Create marker cluster group
        this.emergencyCluster = L.markerClusterGroup();
        
        emergencies.forEach(emergency => {
            const marker = L.marker(
                this.getCoordinates(emergency.location), 
                {
                    icon: this.getEmergencyIcon(emergency.type, emergency.severity),
                    riseOnHover: true
                }
            );
            
            marker.bindPopup(this.createEmergencyPopup(emergency));
            this.emergencyCluster.addLayer(marker);
            this.disasterMarkers.push(marker);
            
            // Add affected area overlay for active emergencies
            if (emergency.status === 'active') {
                const area = this.createAffectedArea(emergency);
                this.map.addLayer(area);
                this.disasterMarkers.push(area);
            }
        });
        
        this.map.addLayer(this.emergencyCluster);
    }

    renderResources(resources) {
        // Clear existing markers
        this.clearMarkers(this.resourceMarkers);
        
        // Group resources by location
        const resourceGroups = {};
        resources.forEach(resource => {
            if (!resourceGroups[resource.location]) {
                resourceGroups[resource.location] = [];
            }
            resourceGroups[resource.location].push(resource);
        });
        
        // Create cluster groups for each location
        this.resourceClusters = [];
        
        Object.entries(resourceGroups).forEach(([location, items]) => {
            const cluster = L.markerClusterGroup();
            const coords = this.getCoordinates(location);
            
            items.forEach(resource => {
                const marker = L.marker(
                    [coords[0] + (Math.random() * 0.1 - 0.05), coords[1] + (Math.random() * 0.1 - 0.05)],
                    { icon: this.getResourceIcon(resource.type) }
                );
                
                marker.bindPopup(this.createResourcePopup(resource));
                cluster.addLayer(marker);
                this.resourceMarkers.push(marker);
            });
            
            this.map.addLayer(cluster);
            this.resourceClusters.push(cluster);
        });
    }

    optimizeRoutes(disasterId) {
        this.showLoading();
        
        fetch(`api/optimize.php?disaster_id=${disasterId}`)
            .then(response => response.json())
            .then(data => {
                this.renderOptimizedRoutes(data);
                this.hideLoading();
            })
            .catch(() => {
                this.renderOptimizedRoutes(this.getDemoOptimization(disasterId));
                this.hideLoading();
            });
    }

    renderOptimizedRoutes(routeData) {
        // Clear existing routes
        this.clearRoutes();
        
        routeData.routes.forEach(route => {
            const coordinates = [
                this.getCoordinates(route.from),
                this.getRandomMidpoint(route.from, routeData.disaster.location),
                this.getCoordinates(routeData.disaster.location)
            ];
            
            const routeLayer = L.polyline(coordinates, {
                color: route.has_blockage ? '#e74c3c' : '#2ecc71',
                weight: 5,
                opacity: 0.7,
                dashArray: route.has_blockage ? '10, 10' : null
            }).addTo(this.map);
            
            // Add markers for start and end points
            L.marker(coordinates[0], {
                icon: L.divIcon({
                    className: 'resource-marker',
                    html: '<i class="fas fa-warehouse"></i>',
                    iconSize: [30, 30]
                })
            }).addTo(this.map);
            
            L.marker(coordinates[2], {
                icon: L.divIcon({
                    className: 'emergency-marker',
                    html: '<i class="fas fa-exclamation"></i>',
                    iconSize: [30, 30]
                })
            }).addTo(this.map);
            
            // Add blockage marker if needed
            if (route.has_blockage) {
                const blockagePos = coordinates[1];
                const blockageMarker = L.marker(blockagePos, {
                    icon: L.divIcon({
                        className: 'blockage-marker',
                        html: '<i class="fas fa-road-barrier"></i>',
                        iconSize: [30, 30]
                    })
                }).addTo(this.map);
                
                blockageMarker.bindPopup(`
                    <h6>Route Obstruction</h6>
                    <p>${route.blockage_reason || 'Road damage detected'}</p>
                    <p><strong>Alternate Route:</strong> ${route.alternate_route}</p>
                `);
                
                this.routeLayers.push(blockageMarker);
            }
            
            this.routeLayers.push(routeLayer);
        });
        
        // Fit map to show all routes
        const bounds = L.featureGroup(this.routeLayers).getBounds();
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    deployDrones(disasterLocation) {
        if (this.dronesActive) return;
        
        this.dronesActive = true;
        $('#activeDronesCount').text('3');
        $('#droneControlPanel').show();
        
        // Create 3 drones
        for (let i = 0; i < 3; i++) {
            const dronePos = [
                disasterLocation.lat + (Math.random() * 0.3 - 0.15),
                disasterLocation.lng + (Math.random() * 0.3 - 0.15)
            ];
            
            const droneMarker = L.marker(dronePos, {
                icon: L.divIcon({
                    className: 'drone-marker',
                    html: `<i class="fas fa-drone-alt"></i><span class="drone-id">${i+1}</span>`,
                    iconSize: [30, 30]
                }),
                zIndexOffset: 1000
            }).addTo(this.map);
            
            // Make drone move randomly
            this.animateDrone(droneMarker, disasterLocation);
            this.droneMarkers.push(droneMarker);
        }
        
        // Start battery drain simulation
        this.simulateBatteryDrain();
    }

    recallDrones() {
        if (!this.dronesActive) return;
        
        this.dronesActive = false;
        $('#droneControlPanel').hide();
        
        // Remove all drones
        this.clearMarkers(this.droneMarkers);
    }

    // Helper Methods
    getEmergencyIcon(type, severity) {
        const iconClass = {
            'Flood': 'fa-water',
            'Earthquake': 'fa-house-crack',
            'Cyclone': 'fa-wind',
            'Fire': 'fa-fire',
            'Landslide': 'fa-hill-rockslide'
        }[type] || 'fa-triangle-exclamation';
        
        const severityClass = severity >= 70 ? 'danger' : severity >= 40 ? 'warning' : 'success';
        
        return L.divIcon({
            className: `emergency-marker bg-${severityClass}`,
            html: `<i class="fas ${iconClass}"></i>`,
            iconSize: [30, 30],
            popupAnchor: [0, -15]
        });
    }

    getResourceIcon(type) {
        const iconClass = {
            'Medical': 'fa-kit-medical',
            'Food': 'fa-utensils',
            'Water': 'fa-bottle-water',
            'Shelter': 'fa-tents',
            'Transport': 'fa-truck'
        }[type] || 'fa-box';
        
        return L.divIcon({
            className: 'resource-marker bg-primary',
            html: `<i class="fas ${iconClass}"></i>`,
            iconSize: [25, 25],
            popupAnchor: [0, -12]
        });
    }

    createEmergencyPopup(emergency) {
        return `
            <div class="emergency-popup">
                <h6>${emergency.type} Emergency</h6>
                <p><i class="fas fa-map-marker-alt me-1"></i> ${emergency.location}</p>
                <div class="progress mb-2">
                    <div class="progress-bar bg-${emergency.severity >= 70 ? 'danger' : emergency.severity >= 40 ? 'warning' : 'success'}" 
                         style="width: ${emergency.severity}%"></div>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-primary optimize-btn" 
                            data-id="${emergency.id}">
                        <i class="fas fa-robot me-1"></i>Optimize Response
                    </button>
                    <button class="btn btn-sm btn-outline-danger deploy-drones-btn" 
                            data-id="${emergency.id}">
                        <i class="fas fa-drone-alt me-1"></i>Deploy Drones
                    </button>
                </div>
            </div>
        `;
    }

    createResourcePopup(resource) {
        return `
            <div class="resource-popup">
                <h6>${resource.name}</h6>
                <p><i class="fas fa-${resource.type === 'Medical' ? 'kit-medical' : resource.type === 'Food' ? 'utensils' : 'box'}" me-1"></i> ${resource.type}</p>
                <p><i class="fas fa-cubes me-1"></i> ${resource.quantity} available</p>
                <p><i class="fas fa-warehouse me-1"></i> ${resource.location}</p>
            </div>
        `;
    }

    createAffectedArea(emergency) {
        const center = this.getCoordinates(emergency.location);
        const radius = emergency.severity * 100; // meters
        
        return L.circle(center, {
            radius: radius,
            color: emergency.severity >= 70 ? '#e74c3c' : emergency.severity >= 40 ? '#f39c12' : '#27ae60',
            fillColor: emergency.severity >= 70 ? '#e74c3c' : emergency.severity >= 40 ? '#f39c12' : '#27ae60',
            fillOpacity: 0.1,
            weight: 2
        });
    }

    animateDrone(droneMarker, disasterPos) {
        let angle = 0;
        
        const moveDrone = () => {
            if (!this.dronesActive) return;
            
            angle += 0.02;
            const radius = 0.1 + Math.sin(angle * 2) * 0.05;
            const newLat = disasterPos.lat + radius * Math.cos(angle);
            const newLng = disasterPos.lng + radius * Math.sin(angle);
            
            droneMarker.setLatLng([newLat, newLng]);
            
            if (this.dronesActive) {
                requestAnimationFrame(moveDrone);
            }
        };
        
        moveDrone();
    }

    simulateBatteryDrain() {
        let battery = 100;
        const batteryInterval = setInterval(() => {
            if (!this.dronesActive) {
                clearInterval(batteryInterval);
                return;
            }
            
            battery -= 1;
            $('#droneBattery')
                .css('width', battery + '%')
                .text(battery + '%')
                .toggleClass('bg-warning', battery < 30)
                .toggleClass('bg-danger', battery < 15);
            
            if (battery <= 0) {
                clearInterval(batteryInterval);
                this.recallDrones();
                this.showAlert('Drones automatically recalled due to low battery', 'warning');
            }
        }, 3000);
    }

    getCoordinates(location) {
        const locations = {
            'Mumbai': [19.0760, 72.8777],
            'Delhi': [28.7041, 77.1025],
            'Chennai': [13.0827, 80.2707],
            'Bangalore': [12.9716, 77.5946],
            'Kolkata': [22.5726, 88.3639],
            'Warehouse A': [19.0760, 72.8777],
            'Warehouse B': [28.7041, 77.1025],
            'Warehouse C': [13.0827, 80.2707]
        };
        return locations[location] || [20.5937, 78.9629];
    }

    getRandomMidpoint(from, to) {
        const fromCoords = this.getCoordinates(from);
        const toCoords = this.getCoordinates(to);
        
        return [
            (fromCoords[0] + toCoords[0]) / 2 + (Math.random() * 0.2 - 0.1),
            (fromCoords[1] + toCoords[1]) / 2 + (Math.random() * 0.2 - 0.1)
        ];
    }

    clearMarkers(markers) {
        markers.forEach(marker => this.map.removeLayer(marker));
        markers = [];
    }

    clearRoutes() {
        this.routeLayers.forEach(layer => this.map.removeLayer(layer));
        this.routeLayers = [];
    }

    showLoading() {
        if (!this.loadingControl) {
            this.loadingControl = L.control({ position: 'topright' });
            this.loadingControl.onAdd = () => {
                const div = L.DomUtil.create('div', 'loading-control');
                div.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
                return div;
            };
            this.loadingControl.addTo(this.map);
        }
    }

    hideLoading() {
        if (this.loadingControl) {
            this.map.removeControl(this.loadingControl);
            this.loadingControl = null;
        }
    }

    showAlert(message, type) {
        const alert = L.control({ position: 'topright' });
        alert.onAdd = () => {
            const div = L.DomUtil.create('div', `alert alert-${type} alert-dismissible`);
            div.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            return div;
        };
        alert.addTo(this.map);
        
        setTimeout(() => {
            this.map.removeControl(alert);
        }, 5000);
    }

    setupEventListeners() {
        // Handle optimize and drone buttons in popups
        this.map.on('popupopen', (e) => {
            const popup = e.popup;
            const content = popup.getElement();
            
            if (content) {
                content.querySelectorAll('.optimize-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const disasterId = btn.dataset.id;
                        this.optimizeRoutes(disasterId);
                        popup.close();
                    });
                });
                
                content.querySelectorAll('.deploy-drones-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const disasterId = btn.dataset.id;
                        const disasterLocation = e.target.getLatLng();
                        this.deployDrones(disasterLocation);
                        popup.close();
                    });
                });
            }
        });
        
        // UI controls
        $('#toggleEmergencies').change(() => {
            if ($('#toggleEmergencies').is(':checked')) {
                this.map.addLayer(this.emergencyCluster);
            } else {
                this.map.removeLayer(this.emergencyCluster);
            }
        });
        
        $('#toggleResources').change(() => {
            this.resourceClusters.forEach(cluster => {
                if ($('#toggleResources').is(':checked')) {
                    this.map.addLayer(cluster);
                } else {
                    this.map.removeLayer(cluster);
                }
            });
        });
        
        $('#toggleRoutes').change(() => {
            this.routeLayers.forEach(layer => {
                if ($('#toggleRoutes').is(':checked')) {
                    this.map.addLayer(layer);
                } else {
                    this.map.removeLayer(layer);
                }
            });
        });
        
        $('#toggleHeatmap').change(() => {
            // This would toggle a heatmap layer in a real implementation
            this.showAlert('Heatmap visualization would be displayed here', 'info');
        });
        
        $('#refreshMapBtn').click(() => {
            this.loadMapData();
            this.showAlert('Map data refreshed', 'success');
        });
        
        $('#toggleDroneBtn').click(() => {
            $('#droneControlPanel').toggle();
        });
        
        $('#deployDronesBtn').click(() => {
            const center = this.map.getCenter();
            this.deployDrones(center);
        });
        
        $('#recallDronesBtn').click(() => {
            this.recallDrones();
        });
    }

    // Demo Data Methods
    getDemoEmergencies() {
        return [
            { id: 1, type: 'Flood', location: 'Mumbai', severity: 75, status: 'active' },
            { id: 2, type: 'Earthquake', location: 'Delhi', severity: 90, status: 'active' },
            { id: 3, type: 'Cyclone', location: 'Chennai', severity: 60, status: 'active' },
            { id: 4, type: 'Fire', location: 'Bangalore', severity: 45, status: 'resolved' }
        ];
    }

    getDemoResources() {
        return [
            { id: 1, name: 'Medical Kit A', type: 'Medical', quantity: 50, location: 'Warehouse A' },
            { id: 2, name: 'Water Bottles', type: 'Water', quantity: 200, location: 'Warehouse A' },
            { id: 3, name: 'Emergency Tents', type: 'Shelter', quantity: 100, location: 'Warehouse B' },
            { id: 4, name: 'Ready-to-Eat Meals', type: 'Food', quantity: 150, location: 'Warehouse B' },
            { id: 5, name: 'First Aid Supplies', type: 'Medical', quantity: 75, location: 'Warehouse C' }
        ];
    }

    getDemoOptimization(disasterId) {
        const disasters = {
            1: { type: 'Flood', location: 'Mumbai', severity: 75 },
            2: { type: 'Earthquake', location: 'Delhi', severity: 90 },
            3: { type: 'Cyclone', location: 'Chennai', severity: 60 }
        };
        
        return {
            disaster: disasters[disasterId] || disasters[1],
            routes: [
                {
                    from: 'Warehouse A',
                    to: disasters[disasterId]?.location || 'Mumbai',
                    has_blockage: true,
                    blockage_reason: 'Bridge collapse on main highway',
                    alternate_route: 'Use NH48 via alternate crossing'
                },
                {
                    from: 'Warehouse B',
                    to: disasters[disasterId]?.location || 'Mumbai',
                    has_blockage: false
                }
            ]
        };
    }
}

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const emergencyMap = new EmergencyMap();
    
    // Make available globally for debugging
    window.emergencyMap = emergencyMap;
});