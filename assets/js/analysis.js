$(document).ready(function() {
    // Tab switching
    $('.analysis-tab').click(function() {
        $('.analysis-tab').removeClass('active');
        $(this).addClass('active');
        loadAnalysis($(this).data('type'));
    });

    // Refresh button
    $('#refreshAnalysisBtn').click(function() {
        const activeTab = $('.analysis-tab.active').data('type');
        loadAnalysis(activeTab);
    });

    // Run analysis button
    $('#runAnalysisBtn').click(function() {
        const activeTab = $('.analysis-tab.active').data('type');
        simulateAIProcessing(activeTab);
    });

    // Load default tab
    loadAnalysis('damage');
});

function loadAnalysis(type) {
    $('#analysisResults').html(`
        <div class="ai-processing">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h5>Loading ${type.replace(/\b\w/g, l => l.toUpperCase())} Analysis...</h5>
        </div>
    `);

    setTimeout(() => {
        switch(type) {
            case 'damage':
                showDamageAnalysis();
                break;
            case 'logistics':
                showLogisticsAnalysis();
                break;
            case 'resource':
                showResourceAnalysis();
                break;
            case 'prediction':
                showPredictionAnalysis();
                break;
        }
    }, 800);
}

function simulateAIProcessing(type) {
    $('#analysisResults').html(`
        <div class="ai-processing">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h5>AI Model Processing</h5>
            <p>Running ${type} analysis...</p>
            <div class="progress w-75">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
            </div>
            <div class="mt-2">
                <small class="text-muted">Analyzing patterns...</small>
            </div>
        </div>
    `);

    setTimeout(() => loadAnalysis(type), 2000);
}

function showDamageAnalysis() {
    $('#analysisResults').html(`
        <div class="chart-container">
            <canvas id="damageChart"></canvas>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-danger text-white">
                        <i class="fas fa-triangle-exclamation me-2"></i>Critical Areas
                    </div>
                    <div class="card-body">
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
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <i class="fas fa-lightbulb me-2"></i>AI Recommendations
                    </div>
                    <div class="card-body">
                        <p>Prioritize structural assessments in high-risk residential areas first.</p>
                        <p>Coordinate with power utility companies for emergency repairs.</p>
                        <button class="btn btn-sm btn-primary mt-2">
                            <i class="fas fa-download me-1"></i> Download Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <script>
            new Chart(document.getElementById('damageChart'), {
                type: 'bar',
                data: {
                    labels: ['Housing', 'Roads', 'Power', 'Water', 'Communication'],
                    datasets: [{
                        label: 'Damage Severity (%)',
                        data: [78, 65, 55, 40, 35],
                        backgroundColor: [
                            '#dc3545',
                            '#fd7e14',
                            '#ffc107',
                            '#20c997',
                            '#0dcaf0'
                        ]
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        </script>
    `);
}

function showLogisticsAnalysis() {
    $('#analysisResults').html(`
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="chart-container">
                    <canvas id="logisticsChart"></canvas>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <i class="fas fa-route me-2"></i>Transport Status
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>Road Network</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: 75%">75% Operational</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>Supply Routes</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-warning" style="width: 60%">60% Unaffected</div>
                            </div>
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-drone me-2"></i>
                            <strong>Recommendation:</strong> Deploy drones for critical deliveries
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header bg-dark text-white">
                <i class="fas fa-truck me-2"></i>Delivery Timeline
            </div>
            <div class="card-body">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Resource</th>
                            <th>ETA</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="badge bg-danger">High</span></td>
                            <td>Medical Supplies</td>
                            <td>2-3 hours</td>
                            <td><span class="badge bg-success">On Track</span></td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-warning">Medium</span></td>
                            <td>Food & Water</td>
                            <td>4-5 hours</td>
                            <td><span class="badge bg-warning">Delayed</span></td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-secondary">Low</span></td>
                            <td>Temporary Shelters</td>
                            <td>6-8 hours</td>
                            <td><span class="badge bg-success">On Track</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <script>
            new Chart(document.getElementById('logisticsChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Operational', 'Partially Blocked', 'Completely Blocked'],
                    datasets: [{
                        data: [75, 15, 10],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#dc3545'
                        ]
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        </script>
    `);
}

function showResourceAnalysis() {
    $('#analysisResults').html(`
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="chart-container">
                    <canvas id="resourceChart"></canvas>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-header bg-success text-white">
                        <i class="fas fa-box-open me-2"></i>Critical Shortages
                    </div>
                    <div class="card-body">
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
                        <button class="btn btn-sm btn-outline-primary w-100 mt-3">
                            <i class="fas fa-robot me-1"></i> Auto-Replenish
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <div class="card resource-card">
                    <div class="card-body text-center">
                        <div class="resource-icon text-primary">
                            <i class="fas fa-kit-medical"></i>
                        </div>
                        <h5>Medical</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-primary" style="width: 65%">65%</div>
                        </div>
                        <small class="text-muted">1250 units available</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card resource-card">
                    <div class="card-body text-center">
                        <div class="resource-icon text-success">
                            <i class="fas fa-bottle-water"></i>
                        </div>
                        <h5>Water</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-success" style="width: 80%">80%</div>
                        </div>
                        <small class="text-muted">3200 units available</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card resource-card">
                    <div class="card-body text-center">
                        <div class="resource-icon text-warning">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <h5>Food</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-warning" style="width: 55%">55%</div>
                        </div>
                        <small class="text-muted">1800 units available</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card resource-card">
                    <div class="card-body text-center">
                        <div class="resource-icon text-info">
                            <i class="fas fa-tents"></i>
                        </div>
                        <h5>Shelter</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-info" style="width: 70%">70%</div>
                        </div>
                        <small class="text-muted">950 units available</small>
                    </div>
                </div>
            </div>
        </div>
        <script>
            new Chart(document.getElementById('resourceChart'), {
                type: 'bar',
                data: {
                    labels: ['Medical', 'Food', 'Water', 'Shelter', 'Clothing'],
                    datasets: [{
                        label: 'Current Inventory',
                        data: [65, 55, 80, 70, 40],
                        backgroundColor: '#3498db'
                    }, {
                        label: 'Projected Need',
                        data: [85, 75, 90, 60, 50],
                        backgroundColor: '#e74c3c'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        </script>
    `);
}

function showPredictionAnalysis() {
    $('#analysisResults').html(`
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-danger text-white">
                        <i class="fas fa-clock me-2"></i>Next 72 Hours
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>Flood Risk</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-danger" style="width: 68%">68% Probability</div>
                            </div>
                            <p class="small">Coastal areas at highest risk</p>
                        </div>
                        <div class="mb-3">
                            <h6>Earthquake Risk</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-warning" style="width: 42%">42% Probability</div>
                            </div>
                            <p class="small">Northern regions most vulnerable</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-warning text-dark">
                        <i class="fas fa-map-marked-alt me-2"></i>Risk Hotspots
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="hotspotChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header bg-primary text-white">
                <i class="fas fa-lightbulb me-2"></i>AI Recommendations
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5><i class="fas fa-warehouse me-2"></i>Pre-Positioning</h5>
                                <p>Move 30% of medical supplies to coastal warehouses</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5><i class="fas fa-users me-2"></i>Personnel</h5>
                                <p>Alert 5 additional response teams for standby</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5><i class="fas fa-bullhorn me-2"></i>Early Warning</h5>
                                <p>Activate community alert system in high-risk zones</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            new Chart(document.getElementById('hotspotChart'), {
                type: 'radar',
                data: {
                    labels: ['Mumbai', 'Chennai', 'Delhi', 'Kolkata', 'Bangalore'],
                    datasets: [{
                        label: 'Risk Score',
                        data: [85, 65, 55, 45, 40],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)'
                    }]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
        </script>
    `);
}

function showPredictionAnalysis() {
    $('#analysisResults').html(`
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-danger text-white">
                        <i class="fas fa-clock me-2"></i>Next 72 Hours
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>Flood Risk <span class="badge bg-danger float-end">68%</span></h6>
                            <div class="progress mb-2" style="height: 20px;">
                                <div class="progress-bar bg-danger progress-bar-striped" style="width: 68%"></div>
                            </div>
                            <p class="small">Coastal areas at highest risk due to monsoon patterns</p>
                        </div>
                        <div class="mb-3">
                            <h6>Earthquake Risk <span class="badge bg-warning float-end">42%</span></h6>
                            <div class="progress mb-2" style="height: 20px;">
                                <div class="progress-bar bg-warning progress-bar-striped" style="width: 42%"></div>
                            </div>
                            <p class="small">Northern regions showing increased seismic activity</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100" id="detailedForecastBtn">
                            <i class="fas fa-search me-1"></i> Show Detailed Forecast
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-warning text-dark">
                        <i class="fas fa-map-marked-alt me-2"></i>Risk Hotspots
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="hotspotChart"></canvas>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100 mt-2" id="viewHeatmapBtn">
                            <i class="fas fa-map me-1"></i> View Heatmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card mb-4" id="detailedForecastCard" style="display: none;">
            <div class="card-header bg-info text-white">
                <i class="fas fa-chart-line me-2"></i>Detailed Forecast Analysis
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-water me-2"></i>Flood Risk Breakdown</h5>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Risk</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Mumbai Coastal</td>
                                    <td><span class="badge bg-danger">High</span></td>
                                    <td><i class="fas fa-arrow-up text-danger"></i> Increasing</td>
                                </tr>
                                <tr>
                                    <td>Kerala</td>
                                    <td><span class="badge bg-warning">Medium</span></td>
                                    <td><i class="fas fa-arrow-up text-warning"></i> Increasing</td>
                                </tr>
                                <tr>
                                    <td>West Bengal</td>
                                    <td><span class="badge bg-success">Low</span></td>
                                    <td><i class="fas fa-arrow-right text-success"></i> Stable</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5><i class="fas fa-mountain me-2"></i>Earthquake Risk Breakdown</h5>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Risk</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Himalayan Belt</td>
                                    <td><span class="badge bg-warning">Medium</span></td>
                                    <td><i class="fas fa-arrow-up text-warning"></i> Increasing</td>
                                </tr>
                                <tr>
                                    <td>Delhi-NCR</td>
                                    <td><span class="badge bg-warning">Medium</span></td>
                                    <td><i class="fas fa-arrow-right text-warning"></i> Stable</td>
                                </tr>
                                <tr>
                                    <td>Southern Plateau</td>
                                    <td><span class="badge bg-success">Low</span></td>
                                    <td><i class="fas fa-arrow-right text-success"></i> Stable</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="mt-3">
                    <canvas id="forecastTrendChart" height="150"></canvas>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header bg-primary text-white">
                <i class="fas fa-lightbulb me-2"></i>AI Recommendations
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5><i class="fas fa-warehouse me-2"></i>Pre-Positioning</h5>
                                <p>Move 30% of medical supplies to coastal warehouses by <strong>Friday</strong></p>
                                <button class="btn btn-sm btn-outline-primary">View Plan</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5><i class="fas fa-users me-2"></i>Personnel</h5>
                                <p>Alert 5 additional response teams for standby in <strong>Mumbai</strong></p>
                                <button class="btn btn-sm btn-outline-primary">Notify Teams</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5><i class="fas fa-bullhorn me-2"></i>Early Warning</h5>
                                <p>Activate community alert system in <strong>3 coastal districts</strong></p>
                                <button class="btn btn-sm btn-outline-primary">Send Alerts</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            // Hotspot Radar Chart
            new Chart(document.getElementById('hotspotChart'), {
                type: 'radar',
                data: {
                    labels: ['Mumbai', 'Chennai', 'Delhi', 'Kolkata', 'Bangalore'],
                    datasets: [{
                        label: 'Risk Score',
                        data: [85, 65, 55, 45, 40],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)'
                    }]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: { display: true },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
            
            // Forecast Trend Chart (will be shown when detailed forecast is opened)
            const forecastTrendCtx = document.getElementById('forecastTrendChart').getContext('2d');
            const forecastTrendChart = new Chart(forecastTrendCtx, {
                type: 'line',
                data: {
                    labels: ['6am', '12pm', '6pm', '12am', '6am', '12pm', '6pm'],
                    datasets: [
                        {
                            label: 'Flood Risk',
                            data: [45, 50, 55, 60, 65, 68, 70],
                            borderColor: '#0d6efd',
                            backgroundColor: 'rgba(13, 110, 253, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Earthquake Risk',
                            data: [30, 35, 38, 40, 42, 45, 42],
                            borderColor: '#fd7e14',
                            backgroundColor: 'rgba(253, 126, 20, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
            
            // Button event handlers
            document.getElementById('detailedForecastBtn').addEventListener('click', function() {
                $('#detailedForecastCard').slideToggle();
                $(this).html(
                    $('#detailedForecastCard').is(':visible') 
                    ? '<i class="fas fa-times me-1"></i> Hide Details' 
                    : '<i class="fas fa-search me-1"></i> Show Detailed Forecast'
                );
            });
            
            document.getElementById('viewHeatmapBtn').addEventListener('click', function() {
                alert('Heatmap visualization would open in a full-screen mode with interactive risk layers');
            });
        </script>
    `);
}