// Initialize the emergency form functionality
$(document).ready(function() {
    // Initialize map
    const map = L.map('locationMap').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    let marker = null;

    // Map click handler
    map.on('click', function(e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        reverseGeocode(e.latlng);
    });

    // Severity slider
    $('#emergencySeverity').on('input', function() {
        updateSeverityDisplay(this.value);
    });

    // Location detection
    $('#detectLocationBtn').click(function() {
        detectLocation();
    });

    // AI Assist button
    $('#aiAssistBtn').click(function() {
        generateAISuggestions();
    });

    // Image preview
    $('#emergencyImage').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                $('#imagePreview').attr('src', event.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    $('#emergencyForm').submit(function(e) {
        e.preventDefault();
        submitEmergencyForm();
    });

    // Preview button
    $('#previewBtn').click(function() {
        showPreview();
    });

    // Initial setup
    updateSeverityDisplay(50);
});

function updateSeverityDisplay(value) {
    let severityText = '';
    let textClass = '';
    
    if (value >= 80) {
        severityText = `${value}% - Critical`;
        textClass = 'text-danger';
    } else if (value >= 50) {
        severityText = `${value}% - Severe`;
        textClass = 'text-warning';
    } else {
        severityText = `${value}% - Moderate`;
        textClass = 'text-success';
    }
    
    $('#severityText').text(severityText).removeClass('text-danger text-warning text-success').addClass(textClass);
}

function detectLocation() {
    $('#detectLocationBtn').html('<i class="fas fa-spinner fa-spin"></i>');
    
    // Simulate location detection
    setTimeout(() => {
        const cities = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bangalore'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        
        $('#emergencyLocation').val(randomCity);
        $('#detectLocationBtn').html('<i class="fas fa-location-crosshairs"></i>');
        
        // Simulate map update
        const coordinates = {
            'Mumbai': [19.0760, 72.8777],
            'Delhi': [28.7041, 77.1025],
            'Chennai': [13.0827, 80.2707],
            'Kolkata': [22.5726, 88.3639],
            'Bangalore': [12.9716, 77.5946]
        };
        
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(coordinates[randomCity]).addTo(map);
        map.setView(coordinates[randomCity], 10);
        
        // Show success alert
        showAlert('Location detected successfully!', 'success');
    }, 1500);
}

function reverseGeocode(latlng) {
    // Simulate reverse geocoding
    const addresses = [
        'Main Road, Sector 12',
        'Near City Hospital',
        'Riverfront Area',
        'Industrial Zone',
        'Downtown District'
    ];
    
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    $('#emergencyLocation').val(randomAddress);
}

function generateAISuggestions() {
    const type = $('#emergencyType').val();
    if (!type) {
        showAlert('Please select emergency type first', 'warning');
        return;
    }
    
    $('#aiAssistBtn').html('<i class="fas fa-spinner fa-spin"></i> Analyzing');
    
    // Simulate AI processing
    setTimeout(() => {
        const suggestions = {
            'Flood': {
                severity: Math.floor(Math.random() * 30) + 70, // 70-100
                description: 'Flooding reported in the area with rising water levels. Several homes already affected. Need immediate evacuation and relief supplies.'
            },
            'Earthquake': {
                severity: Math.floor(Math.random() * 40) + 60, // 60-100
                description: 'Earthquake measuring approximately 5.8 on Richter scale. Buildings damaged and people trapped. Need search and rescue teams.'
            },
            'Cyclone': {
                severity: Math.floor(Math.random() * 30) + 50, // 50-80
                description: 'Cyclone approaching with wind speeds of 120 km/h. Storm surge expected. Need emergency shelters and medical teams.'
            },
            'Fire': {
                severity: Math.floor(Math.random() * 50) + 30, // 30-80
                description: 'Major fire reported in commercial area. Multiple buildings affected. Need firefighting teams and medical support.'
            },
            'Landslide': {
                severity: Math.floor(Math.random() * 40) + 40, // 40-80
                description: 'Landslide blocking major highway. Several vehicles buried. Need heavy equipment and rescue teams.'
            },
            'Other': {
                severity: Math.floor(Math.random() * 50) + 30, // 30-80
                description: 'Emergency situation reported. Details still emerging. Need assessment team and basic relief supplies.'
            }
        };
        
        const suggestion = suggestions[type] || suggestions['Other'];
        
        $('#emergencySeverity').val(suggestion.severity).trigger('input');
        $('#emergencyDescription').val(suggestion.description);
        
        $('#aiSuggestionBox').html(`
            <h6><i class="fas fa-robot text-primary me-2"></i>AI Suggestions</h6>
            <p><strong>Severity:</strong> ${suggestion.severity}% (${suggestion.severity >= 70 ? 'Critical' : suggestion.severity >= 50 ? 'Severe' : 'Moderate'})</p>
            <p><strong>Recommended Actions:</strong> ${suggestion.description}</p>
            <div class="alert alert-info mt-2">
                <i class="fas fa-lightbulb me-2"></i>
                <strong>Tip:</strong> Review and adjust the suggestions as needed before submitting.
            </div>
        `);
        
        $('#aiAssistBtn').html('<i class="fas fa-magic me-1"></i> Regenerate AI Suggestions');
        showAlert('AI suggestions generated successfully!', 'success');
    }, 2000);
}

function showPreview() {
    const formData = {
        type: $('#emergencyType').val(),
        location: $('#emergencyLocation').val(),
        severity: $('#emergencySeverity').val(),
        description: $('#emergencyDescription').val()
    };
    
    if (!formData.type || !formData.location || !formData.description) {
        showAlert('Please fill all required fields first', 'warning');
        return;
    }
    
    $('#responseModalTitle').html('<i class="fas fa-eye me-2"></i>Emergency Preview');
    $('#responseModalBody').html(`
        <div class="mb-3">
            <h6>Emergency Details</h6>
            <table class="table table-sm">
                <tr>
                    <th>Type:</th>
                    <td>${formData.type}</td>
                </tr>
                <tr>
                    <th>Location:</th>
                    <td>${formData.location}</td>
                </tr>
                <tr>
                    <th>Severity:</th>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar ${getSeverityClass(formData.severity)}" 
                                 style="width: ${formData.severity}%">
                                ${formData.severity}%
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th>Description:</th>
                    <td>${formData.description}</td>
                </tr>
            </table>
        </div>
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            This is only a preview. The emergency has not been reported yet.
        </div>
    `);
    
    $('#responseModal').modal('show');
}

function submitEmergencyForm() {
    const formData = {
        type: $('#emergencyType').val(),
        location: $('#emergencyLocation').val(),
        severity: $('#emergencySeverity').val(),
        description: $('#emergencyDescription').val(),
        image: $('#emergencyImage')[0].files[0] ? $('#imagePreview').attr('src') : null
    };
    
    if (!formData.type || !formData.location || !formData.description) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }
    
    $('#submitBtn').html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);
    
    // Simulate API submission
    setTimeout(() => {
        // Generate random emergency ID
        const emergencyId = 'EMG-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        $('#responseModalTitle').html('<i class="fas fa-check-circle text-success me-2"></i>Emergency Reported');
        $('#responseModalBody').html(`
            <div class="alert alert-success">
                <h5>Emergency Response Activated!</h5>
                <p>Your emergency report has been successfully submitted.</p>
                <p><strong>Emergency ID:</strong> ${emergencyId}</p>
            </div>
            <div class="mb-3">
                <h6>Next Steps</h6>
                <ol>
                    <li>AI is analyzing the situation and optimizing resource allocation</li>
                    <li>Response teams are being mobilized</li>
                    <li>You will receive updates on the dashboard</li>
                </ol>
            </div>
            <div class="alert alert-info">
                <i class="fas fa-robot me-2"></i>
                <strong>AI Recommendation:</strong> ${getAIRecommendation(formData.type, formData.severity)}
            </div>
        `);
        
        $('#responseModal').modal('show');
        $('#submitBtn').html('<i class="fas fa-paper-plane me-1"></i> Activate Emergency Response').prop('disabled', false);
        
        // Reset form after successful submission
        $('#emergencyForm')[0].reset();
        $('#imagePreview').hide();
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        updateSeverityDisplay(50);
    }, 2500);
}

function getAIRecommendation(type, severity) {
    const recommendations = {
        'Flood': [
            'Deploy water rescue teams immediately',
            'Set up emergency shelters in elevated areas',
            'Distribute water purification tablets'
        ],
        'Earthquake': [
            'Mobilize search and rescue teams',
            'Set up field hospitals near affected areas',
            'Assess structural integrity of buildings'
        ],
        'Cyclone': [
            'Evacuate coastal areas immediately',
            'Secure temporary shelters with storm protection',
            'Prepare for power outages and communication breakdowns'
        ]
    };
    
    const defaultRecs = [
        'Deploy assessment team to the area',
        'Prepare basic relief supplies for distribution',
        'Alert nearby medical facilities'
    ];
    
    const recs = recommendations[type] || defaultRecs;
    return recs[Math.floor(Math.random() * recs.length)];
}

function getSeverityClass(severity) {
    severity = parseInt(severity);
    return severity >= 70 ? 'bg-danger' : severity >= 50 ? 'bg-warning' : 'bg-success';
}

function showAlert(message, type) {
    const alert = $(`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    
    $('.emergency-form-container').prepend(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}