<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db_connect.php';

try {
    // Check for new emergencies first
    $emergencyAlerts = $this->getEmergencyAlerts();
    
    // Get system alerts
    $systemAlerts = $this->getSystemAlerts();
    
    // Get weather alerts
    $weatherAlerts = $this->getWeatherAlerts();
    
    // Combine all alerts
    $allAlerts = array_merge($emergencyAlerts, $systemAlerts, $weatherAlerts);
    
    // Sort by priority and timestamp
    usort($allAlerts, function($a, $b) {
        if ($a['priority'] === $b['priority']) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        }
        return $b['priority'] - $a['priority'];
    });
    
    echo json_encode($allAlerts);
    
} catch(PDOException $e) {
    // Fallback to demo alerts
    echo json_encode($this->getDemoAlerts());
}

function getEmergencyAlerts() {
    global $conn;
    
    $stmt = $conn->prepare("
        SELECT id, type, location, severity, start_time as timestamp 
        FROM disasters 
        WHERE status = 'active' 
        AND start_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY start_time DESC
    ");
    $stmt->execute();
    $emergencies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return array_map(function($e) {
        return [
            'id' => 'emer-' . $e['id'],
            'type' => 'emergency',
            'title' => ucfirst($e['type']) . ' Alert: ' . $e['location'],
            'message' => $this->getEmergencyAlertMessage($e['type'], $e['severity']),
            'priority' => $e['severity'] >= 70 ? 3 : ($e['severity'] >= 40 ? 2 : 1),
            'timestamp' => $e['timestamp'],
            'icon' => $this->getAlertIcon('emergency'),
            'actions' => [
                [
                    'text' => 'View Details',
                    'url' => 'map.html?disaster_id=' . $e['id'],
                    'class' => 'btn-primary'
                ],
                [
                    'text' => 'Optimize Response',
                    'url' => 'javascript:optimizeResponse(' . $e['id'] . ')',
                    'class' => 'btn-warning'
                ]
            ]
        ];
    }, $emergencies);
}

function getSystemAlerts() {
    global $conn;
    
    // Simulate resource alerts
    $stmt = $conn->prepare("
        SELECT r.id, r.name, r.type, r.quantity, r.location, 
               r.last_updated as timestamp,
               t.threshold
        FROM resources r
        JOIN resource_thresholds t ON r.type = t.resource_type
        WHERE r.quantity < t.threshold
        AND r.last_updated >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ");
    
    $alerts = [];
    
    try {
        $stmt->execute();
        $lowResources = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $alerts = array_map(function($r) {
            $percent = round(($r['quantity'] / $r['threshold']) * 100);
            return [
                'id' => 'res-' . $r['id'],
                'type' => 'resource',
                'title' => 'Low Inventory: ' . $r['name'],
                'message' => sprintf(
                    'Only %d %s remaining at %s (%d%% of threshold)',
                    $r['quantity'],
                    $r['type'],
                    $r['location'],
                    $percent
                ),
                'priority' => $percent < 30 ? 2 : 1,
                'timestamp' => $r['timestamp'],
                'icon' => $this->getAlertIcon('resource'),
                'actions' => [
                    [
                        'text' => 'Replenish',
                        'url' => 'javascript:replenishResource(' . $r['id'] . ')',
                        'class' => 'btn-info'
                    ]
                ]
            ];
        }, $lowResources);
    } catch (PDOException $e) {
        // If thresholds table doesn't exist, simulate some alerts
        $alerts = [
            [
                'id' => 'res-1',
                'type' => 'resource',
                'title' => 'Low Inventory: Medical Kit A',
                'message' => 'Only 15 Medical Kit A remaining at Warehouse A (30% of threshold)',
                'priority' => 2,
                'timestamp' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'icon' => getAlertIcon('resource'),
                'actions' => [
                    [
                        'text' => 'Replenish',
                        'url' => 'javascript:replenishResource(1)',
                        'class' => 'btn-info'
                    ]
                ]
            ]
        ];
    }
    
    return $alerts;
}

function getWeatherAlerts() {
    // Simulate weather API integration
    $locations = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bangalore'];
    $weatherTypes = ['heavy rain', 'cyclone', 'heat wave', 'flood warning', 'severe storm'];
    
    $alerts = [];
    $count = rand(0, 2); // 0-2 weather alerts
    
    for ($i = 0; $i < $count; $i++) {
        $location = $locations[array_rand($locations)];
        $weather = $weatherTypes[array_rand($weatherTypes)];
        $severity = rand(1, 3);
        
        $alerts[] = [
            'id' => 'weather-' . uniqid(),
            'type' => 'weather',
            'title' => 'Weather Alert: ' . ucfirst($weather) . ' in ' . $location,
            'message' =>getWeatherAlertMessage($weather, $severity),
            'priority' => $severity,
            'timestamp' => date('Y-m-d H:i:s', strtotime('-' . rand(0, 6) . ' hours')),
            'icon' => getAlertIcon('weather'),
            'actions' => [
                [
                    'text' => 'View Forecast',
                    'url' => 'https://weather.com',
                    'class' => 'btn-secondary',
                    'target' => '_blank'
                ]
            ]
        ];
    }
    
    return $alerts;
}

function getEmergencyAlertMessage($type, $severity) {
    $messages = [
        'Flood' => [
            'high' => 'Severe flooding reported with water levels rising rapidly. Evacuations in progress.',
            'medium' => 'Moderate flooding affecting several areas. Prepare for possible evacuations.',
            'low' => 'Minor flooding reported. Monitor local advisories.'
        ],
        'Earthquake' => [
            'high' => 'Major earthquake with significant damage reported. Search and rescue operations underway.',
            'medium' => 'Strong earthquake reported. Structural damage likely in affected areas.',
            'low' => 'Minor earthquake reported. Assessing potential damage.'
        ],
        'Cyclone' => [
            'high' => 'Severe cyclone making landfall. Extreme winds and flooding expected.',
            'medium' => 'Cyclone approaching coast. Prepare for strong winds and heavy rain.',
            'low' => 'Tropical storm developing. Monitor for updates.'
        ]
    ];
    
    $severityLevel = $severity >= 70 ? 'high' : ($severity >= 40 ? 'medium' : 'low');
    return $messages[$type][$severityLevel] ?? 'Emergency situation reported. Response teams activated.';
}

function getWeatherAlertMessage($type, $severity) {
    $messages = [
        'heavy rain' => [
            'Flash flooding possible',
            'Road closures likely',
            'Seek higher ground if in flood-prone areas'
        ],
        'cyclone' => [
            'Secure outdoor objects',
            'Prepare emergency kits',
            'Follow evacuation orders if issued'
        ],
        'heat wave' => [
            'Stay hydrated',
            'Avoid outdoor activities',
            'Check on vulnerable neighbors'
        ],
        'flood warning' => [
            'Do not attempt to cross flooded roads',
            'Move to higher ground if necessary',
            'Follow local emergency instructions'
        ],
        'severe storm' => [
            'Take shelter indoors',
            'Stay away from windows',
            'Prepare for possible power outages'
        ]
    ];
    
    $actions = $messages[$type] ?? ['Monitor local news for updates'];
    return 'Potential impact: ' . implode('. ', $actions) . '.';
}

function getAlertIcon($type) {
    $icons = [
        'emergency' => 'exclamation-triangle',
        'resource' => 'box-open',
        'weather' => 'cloud-showers-heavy'
    ];
    return $icons[$type] ?? 'bell';
}

function getDemoAlerts() {
    return [
        [
            'id' => 'emer-1',
            'type' => 'emergency',
            'title' => 'Flood Alert: Mumbai',
            'message' => 'Severe flooding reported with water levels rising rapidly. Evacuations in progress.',
            'priority' => 3,
            'timestamp' => date('Y-m-d H:i:s', strtotime('-1 hour')),
            'icon' => 'exclamation-triangle',
            'actions' => [
                [
                    'text' => 'View Details',
                    'url' => 'map.html?disaster_id=1',
                    'class' => 'btn-primary'
                ],
                [
                    'text' => 'Optimize Response',
                    'url' => 'javascript:optimizeResponse(1)',
                    'class' => 'btn-warning'
                ]
            ]
        ],
        [
            'id' => 'res-1',
            'type' => 'resource',
            'title' => 'Low Inventory: Medical Kit A',
            'message' => 'Only 15 Medical Kit A remaining at Warehouse A (30% of threshold)',
            'priority' => 2,
            'timestamp' => date('Y-m-d H:i:s', strtotime('-2 hours')),
            'icon' => 'box-open',
            'actions' => [
                [
                    'text' => 'Replenish',
                    'url' => 'javascript:replenishResource(1)',
                    'class' => 'btn-info'
                ]
            ]
        ],
        [
            'id' => 'weather-1',
            'type' => 'weather',
            'title' => 'Weather Alert: Heavy rain in Delhi',
            'message' => 'Potential impact: Flash flooding possible. Road closures likely. Seek higher ground if in flood-prone areas.',
            'priority' => 1,
            'timestamp' => date('Y-m-d H:i:s', strtotime('-3 hours')),
            'icon' => 'cloud-showers-heavy',
            'actions' => [
                [
                    'text' => 'View Forecast',
                    'url' => 'https://weather.com',
                    'class' => 'btn-secondary',
                    'target' => '_blank'
                ]
            ]
        ]
    ];
}
?>