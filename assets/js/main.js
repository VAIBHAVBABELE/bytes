// Initialize the Emergency Dashboard
$(document).ready(function() {
    // Load initial data
    loadDisasterData();
    loadAlerts();
    loadStats();
    
    // Set up real-time updates (simulated)
    setInterval(loadAlerts, 5000);
    setInterval(loadStats, 10000);
    
    // Emergency Form Handler
    $('#emergency-form').submit(function(e) {
        e.preventDefault();
        triggerEmergencyResponse();
    });
    
    // Initialize AI Analysis Tabs
    $('.analysis-tab').click(function() {
        const analysisType = $(this).data('type');
        simulateAIAnalysis(analysisType);
    });
});

// Load Disaster Data
function loadDisasterData() {
    showLoading('#dashboard');
    
    // Simulate API call
    setTimeout(() => {
        $.get('api/emergencies.php', function(data) {
            renderDisasterData(JSON.parse(data));
        }).fail(function() {
            // Fallback to demo data
            renderDisasterData(getDemoDisasterData());
        });
    }, 800);
}

// Render Disaster Data
function renderDisasterData(disasters) {
    const $container = $('#dashboard');
    $container.empty();
    
    // Active Emergencies Section
    const activeDisasters = disasters.filter(d => d.status === 'active');
    if (activeDisasters.length > 0) {
        $container.append(`
            <div class="card mb-4">
                <div class="card-header bg-danger text-white">
                    <i class="fas fa-exclamation-triangle me-2"></i>Active Emergencies
                </div>
                <div class="card-body">
                    <div class="row" id="active-disasters"></div>
                </div>
            </div>
        `);
        
        activeDisasters.forEach(disaster => {
            $('#active-disasters').append(`
                <div class="col-md-4 mb-3">
                    <div class="card cursor-pointer disaster-card" data-id="${disaster.id}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h5 class="card-title">${disaster.type}</h5>
                                <span class="badge bg-${getSeverityClass(disaster.severity)}">
                                    Severity: ${disaster.severity}%
                                </span>
                            </div>
                            <p class="card-text">
                                <i class="fas fa-map-marker-alt me-2"></i>${disaster.location}
                            </p>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-${getSeverityClass(disaster.severity)}" 
                                     style="width: ${disaster.severity}%"></div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary optimize-btn">
                                <i class="fas fa-robot me-1"></i>Optimize Response
                            </button>
                        </div>
                    </div>
                </div>
            `);
        });
    }
    
    // Historical Data Section
    $container.append(`
        <div class="card">
            <div class="card-header bg-primary text-white">
                <i class="fas fa-history me-2"></i>Historical Data & Predictions
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <canvas id="disasterChart"></canvas>
                    </div>
                    <div class="col-md-6">
                        <div class="card prediction-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-lightbulb me-2"></i>AI Prediction
                                </h5>
                                <p class="card-text" id="prediction-text">
                                    ${generatePredictionText()}
                                </p>
                                <div class="prediction-meter mt-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span>Next Event Probability</span>
                                        <span id="prediction-percent">72%</span>
                                    </div>
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                             id="prediction-bar" style="width: 72%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Initialize chart
    renderDisasterChart();
    
    // Add event listeners
    $('.optimize-btn').click(function() {
        const disasterId = $(this).closest('.disaster-card').data('id');
        optimizeResponse(disasterId);
    });
}

// Simulate AI Analysis
function simulateAIAnalysis(type) {
    showLoading('#analysis-results');
    
    // Show processing animation
    $('#analysis-results').html(`
        <div class="text-center py-4">
            <div class="loading-spinner text-primary mb-3"></div>
            <h5>AI Model Processing</h5>
            <p class="text-muted">Running ${type} analysis...</p>
            <div class="progress mt-3">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
            </div>
        </div>
    `);
    
    // Show results after delay
    setTimeout(() => {
        let results = '';
        switch(type) {
            case 'damage':
                results = generateDamageAnalysis();
                break;
            case 'logistics':
                results = generateLogisticsAnalysis();
                break;
            case 'resource':
                results = generateResourceAnalysis();
                break;
        }
        
        $('#analysis-results').html(results);
    }, 3000);
}

// Helper Functions
function showLoading(selector) {
    $(selector).html(`
        <div class="text-center py-4">
            <div class="loading-spinner text-primary"></div>
        </div>
    `);
}

function getSeverityClass(severity) {
    if (severity >= 80) return 'danger';
    if (severity >= 50) return 'warning';
    return 'success';
}

// Demo Data Fallback
function getDemoDisasterData() {
    return [
        {id: 1, type: 'Flood', location: 'Mumbai', severity: 75, status: 'active'},
        {id: 2, type: 'Earthquake', location: 'Delhi', severity: 90, status: 'active'},
        {id: 3, type: 'Cyclone', location: 'Chennai', severity: 60, status: 'active'},
        {id: 4, type: 'Fire', location: 'Bangalore', severity: 45, status: 'resolved'},
        {id: 5, type: 'Landslide', location: 'Darjeeling', severity: 70, status: 'resolved'}
    ];
}

// More functions would be continued...
// Generate Prediction Text
function generatePredictionText() {
    const locations = ["Kolkata", "Hyderabad", "Pune", "Jaipur", "Ahmedabad"];
    const disasters = ["Flood", "Earthquake", "Cyclone", "Heat Wave", "Landslide"];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDisaster = disasters[Math.floor(Math.random() * disasters.length)];
    const probability = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    $('#prediction-percent').text(probability + '%');
    $('#prediction-bar').css('width', probability + '%');
    
    return `Our AI model predicts a <strong>${randomDisaster}</strong> event in <strong>${randomLocation}</strong> 
            within the next 72 hours with high confidence. Recommended actions: Pre-position ${getRecommendedResources(randomDisaster)} 
            in the region and alert local authorities.`;
}

function getRecommendedResources(disasterType) {
    const resources = {
        'Flood': 'rescue boats, water purifiers, and medical kits',
        'Earthquake': 'heavy lifting equipment, tents, and emergency medical teams',
        'Cyclone': 'generators, tarpaulins, and dry food packets',
        'Heat Wave': 'oral rehydration salts, cooling packs, and water tankers',
        'Landslide': 'search dogs, earth movers, and first aid kits'
    };
    return resources[disasterType] || 'medical supplies and food packets';
}

// Optimize Emergency Response
function optimizeResponse(disasterId) {
    showLoading('#optimization-results');
    
    // Simulate API call to optimization engine
    setTimeout(() => {
        $.post('api/optimize.php', { disaster_id: disasterId }, function(data) {
            renderOptimizationResults(JSON.parse(data));
        }).fail(function() {
            // Fallback to demo optimization
            renderOptimizationResults(generateDemoOptimization(disasterId));
        });
    }, 1500);
}

function renderOptimizationResults(data) {
    const $container = $('#optimization-results');
    $container.empty();
    
    $container.append(`
        <div class="card mb-3">
            <div class="card-header bg-success text-white">
                <i class="fas fa-check-circle me-2"></i>Optimization Complete
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-route me-2"></i>Recommended Routes</h5>
                        <div id="route-map" style="height: 300px;"></div>
                        <div class="mt-3">
                            ${generateRouteDetails(data.routes)}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5><i class="fas fa-boxes me-2"></i>Resource Allocation</h5>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Resource</th>
                                    <th>Quantity</th>
                                    <th>Source</th>
                                    <th>ETA</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generateResourceTable(data.resources)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-12">
                        <div class="alert alert-info">
                            <i class="fas fa-robot me-2"></i>
                            <strong>AI Recommendation:</strong> ${data.ai_recommendation}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Initialize the route map
    initializeRouteMap(data.routes);
}

function generateRouteDetails(routes) {
    let html = '';
    routes.forEach((route, index) => {
        html += `
            <div class="mb-2 p-2 border rounded ${route.has_blockage ? 'bg-warning bg-opacity-10' : ''}">
                <div class="d-flex justify-content-between">
                    <strong>Route ${index + 1}:</strong>
                    <span class="badge ${route.has_blockage ? 'bg-warning' : 'bg-success'}">
                        ${route.has_blockage ? 'Blockage Detected' : 'Clear'}
                    </span>
                </div>
                <small class="text-muted">${route.path}</small>
                ${route.has_blockage ? 
                    `<div class="mt-1">
                        <i class="fas fa-info-circle text-warning me-1"></i>
                        <small>Alternate route via ${route.alternate_path}</small>
                    </div>` : ''
                }
            </div>
        `;
    });
    return html;
}

function generateResourceTable(resources) {
    return resources.map(resource => `
        <tr>
            <td>${resource.name}</td>
            <td>${resource.quantity}</td>
            <td>${resource.source}</td>
            <td>${resource.eta}</td>
        </tr>
    `).join('');
}

function generateDemoOptimization(disasterId) {
    const disasters = {
        1: { type: 'Flood', location: 'Mumbai' },
        2: { type: 'Earthquake', location: 'Delhi' },
        3: { type: 'Cyclone', location: 'Chennai' }
    };
    
    const disaster = disasters[disasterId] || disasters[1];
    
    return {
        routes: [
            {
                path: "Warehouse A → Highway NH48 → " + disaster.location,
                has_blockage: Math.random() > 0.7,
                alternate_path: "Service Road → Village Connect → " + disaster.location
            },
            {
                path: "Warehouse B → Expressway → " + disaster.location,
                has_blockage: false
            }
        ],
        resources: [
            { name: 'Medical Kits', quantity: '50 boxes', source: 'Warehouse A', eta: '2-3 hours' },
            { name: 'Water Bottles', quantity: '200 cases', source: 'Warehouse B', eta: '1-2 hours' },
            { name: 'Tents', quantity: '100 units', source: 'Warehouse C', eta: '3-4 hours' }
        ],
        ai_recommendation: `Prioritize ${disaster.type === 'Flood' ? 'water rescue equipment' : 
            disaster.type === 'Earthquake' ? 'structural engineers' : 'emergency shelters'} deployment. 
            ${Math.random() > 0.5 ? 'Drone surveillance recommended for damage assessment.' : 
            'Mobile hospitals should be prepared for potential casualties.'}`
    };
}

// Load Alerts
function loadAlerts() {
    $.get('includes/alerts.php', function(data) {
        $('#alerts-container').html(data);
    }).fail(function() {
        $('#alerts-container').html(generateDemoAlerts());
    });
}

function generateDemoAlerts() {
    const alerts = [
        { type: 'warning', text: 'Heavy rainfall predicted in coastal areas', time: '10 mins ago' },
        { type: 'danger', text: 'Warehouse C inventory levels below threshold', time: '25 mins ago' },
        { type: 'info', text: 'New relief volunteer team registered', time: '1 hour ago' }
    ];
    
    return alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="d-flex justify-content-between">
                <span>${alert.text}</span>
                <small class="text-muted">${alert.time}</small>
            </div>
        </div>
    `).join('');
}

// Load Stats
function loadStats() {
    $.get('includes/stats.php', function(data) {
        $('#stats-container').html(data);
    }).fail(function() {
        $('#stats-container').html(generateDemoStats());
    });
}

function generateDemoStats() {
    return `
        <div class="row text-center">
            <div class="col-6 mb-3">
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(Math.random() * 5) + 2}</div>
                    <div class="stat-label">Active Emergencies</div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(Math.random() * 20) + 80}%</div>
                    <div class="stat-label">Resources Ready</div>
                </div>
            </div>
            <div class="col-6">
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(Math.random() * 30) + 10}</div>
                    <div class="stat-label">Response Teams</div>
                </div>
            </div>
            <div class="col-6">
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(Math.random() * 24)}h</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Route Map
function initializeRouteMap(routes) {
    const map = L.map('route-map').setView([20.5937, 78.9629], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for warehouses
    const warehouseLocations = [
        { name: "Warehouse A", coords: [19.0760, 72.8777] },
        { name: "Warehouse B", coords: [28.7041, 77.1025] },
        { name: "Warehouse C", coords: [13.0827, 80.2707] }
    ];
    
    warehouseLocations.forEach(warehouse => {
        L.marker(warehouse.coords)
            .addTo(map)
            .bindPopup(`<strong>${warehouse.name}</strong><br>Primary supply hub`);
    });
    
    // Add routes
    routes.forEach(route => {
        const coordinates = [
            warehouseLocations[0].coords,
            [Math.random() * 5 + 18, Math.random() * 10 + 75], // Random midpoint
            [Math.random() * 5 + 18, Math.random() * 10 + 75], // Random midpoint
            warehouseLocations[1].coords
        ];
        
        L.polyline(coordinates, {
            color: route.has_blockage ? 'red' : 'green',
            weight: 3,
            dashArray: route.has_blockage ? '10, 10' : null
        }).addTo(map);
        
        if (route.has_blockage) {
            L.circleMarker(coordinates[2], {
                radius: 8,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.8
            }).addTo(map).bindPopup('Road Blockage Detected');
        }
    });
}

// Generate Analysis Reports
function generateDamageAnalysis() {
    return `
        <div class="card">
            <div class="card-header bg-danger text-white">
                <i class="fas fa-building-circle-exclamation me-2"></i>Damage Assessment
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <canvas id="damageChart" height="200"></canvas>
                    </div>
                    <div class="col-md-6">
                        <h5><i class="fas fa-triangle-exclamation me-2"></i>Critical Areas</h5>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Residential Zones
                                <span class="badge bg-danger rounded-pill">High</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Power Infrastructure
                                <span class="badge bg-warning rounded-pill">Medium</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Road Networks
                                <span class="badge bg-danger rounded-pill">High</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="alert alert-warning">
                        <i class="fas fa-lightbulb me-2"></i>
                        <strong>AI Insight:</strong> 78% of damage concentrated in 3 key areas. 
                        Recommend prioritizing these zones for immediate relief efforts.
                    </div>
                </div>
            </div>
        </div>
        <script>
            // Initialize damage chart
            new Chart(document.getElementById('damageChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Structural', 'Infrastructure', 'Transport', 'Utilities'],
                    datasets: [{
                        data: [45, 25, 20, 10],
                        backgroundColor: ['#e74c3c', '#f39c12', '#3498db', '#2ecc71']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        </script>
    `;
}

function generateLogisticsAnalysis() {
    return `
        <div class="card">
            <div class="card-header bg-primary text-white">
                <i class="fas fa-truck-fast me-2"></i>Logistics Analysis
            </div>
            <div class="card-body">
                <h5><i class="fas fa-route me-2"></i>Transport Network Status</h5>
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="card bg-success bg-opacity-10">
                            <div class="card-body text-center">
                                <div class="stat-value text-success">78%</div>
                                <div class="stat-label">Roads Operational</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning bg-opacity-10">
                            <div class="card-body text-center">
                                <div class="stat-value text-warning">15%</div>
                                <div class="stat-label">Partially Blocked</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-danger bg-opacity-10">
                            <div class="card-body text-center">
                                <div class="stat-value text-danger">7%</div>
                                <div class="stat-label">Completely Blocked</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="alert alert-info">
                    <i class="fas fa-drone me-2"></i>
                    <strong>Drone Network:</strong> 12 drones available for aerial survey and light package delivery. 
                    <button class="btn btn-sm btn-outline-primary ms-2">Deploy Drones</button>
                </div>
                <h5 class="mt-3"><i class="fas fa-clock me-2"></i>Estimated Delivery Times</h5>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Resource Type</th>
                            <th>Avg. ETA</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="badge bg-danger">High</span></td>
                            <td>Medical Supplies</td>
                            <td>2.3 hours</td>
                            <td><span class="badge bg-success">On Track</span></td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-warning">Medium</span></td>
                            <td>Food & Water</td>
                            <td>4.1 hours</td>
                            <td><span class="badge bg-success">On Track</span></td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-secondary">Low</span></td>
                            <td>Reconstruction</td>
                            <td>12+ hours</td>
                            <td><span class="badge bg-warning">Pending</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateResourceAnalysis() {
    return `
        <div class="card">
            <div class="card-header bg-success text-white">
                <i class="fas fa-boxes-stacked me-2"></i>Resource Allocation
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <canvas id="resourceChart" height="250"></canvas>
                    </div>
                    <div class="col-md-4">
                        <h5><i class="fas fa-triangle-exclamation me-2"></i>Critical Shortages</h5>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Type O Blood
                                <span class="badge bg-danger rounded-pill">Urgent</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Water Purification Tablets
                                <span class="badge bg-warning rounded-pill">Low</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Emergency Blankets
                                <span class="badge bg-success rounded-pill">Adequate</span>
                            </li>
                        </ul>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary w-100">
                                <i class="fas fa-robot me-1"></i>Auto-Replenish
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="alert alert-success">
                        <i class="fas fa-lightbulb me-2"></i>
                        <strong>AI Recommendation:</strong> Reallocate 30% of resources from Warehouse B to Warehouse A 
                        to better serve affected areas.
                    </div>
                </div>
            </div>
        </div>
        <script>
            // Initialize resource chart
            new Chart(document.getElementById('resourceChart'), {
                type: 'bar',
                data: {
                    labels: ['Medical', 'Food', 'Water', 'Shelter', 'Clothing'],
                    datasets: [{
                        label: 'Current Inventory',
                        data: [65, 80, 45, 70, 90],
                        backgroundColor: '#3498db'
                    }, {
                        label: 'Projected Need',
                        data: [85, 75, 90, 60, 40],
                        backgroundColor: '#e74c3c'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        </script>
    `;
}

// Emergency Form Handling
function triggerEmergencyResponse() {
    const formData = {
        type: $('#emergency-type').val(),
        location: $('#emergency-location').val(),
        severity: $('#emergency-severity').val(),
        description: $('#emergency-desc').val()
    };
    
    showLoading('#emergency-response');
    
    // Simulate API submission
    setTimeout(() => {
        $('#emergency-response').html(`
            <div class="alert alert-success">
                <h4><i class="fas fa-check-circle me-2"></i>Emergency Registered!</h4>
                <p>Our AI system has initiated response protocol ER-${Math.floor(Math.random() * 1000)}.</p>
                <div class="mt-3">
                    <button class="btn btn-primary" id="view-response-plan">
                        <i class="fas fa-robot me-1"></i>View AI Response Plan
                    </button>
                </div>
            </div>
        `);
        
        $('#view-response-plan').click(function() {
            optimizeResponse(Math.floor(Math.random() * 3) + 1);
            $('html, body').animate({
                scrollTop: $('#optimization-results').offset().top
            }, 500);
        });
    }, 2000);
}