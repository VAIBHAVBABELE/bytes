<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db_connect.php';

try {
    // Check if it's a request for a specific emergency
    if (isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT * FROM disasters WHERE id = :id");
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            echo json_encode($result);
        } else {
            echo json_encode(['error' => 'Emergency not found']);
        }
    } 
    // Check if it's a request to create new emergency
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO disasters (type, location, severity, description) 
                               VALUES (:type, :location, :severity, :description)");
        $stmt->bindParam(':type', $input['type']);
        $stmt->bindParam(':location', $input['location']);
        $stmt->bindParam(':severity', $input['severity']);
        $stmt->bindParam(':description', $input['description']);
        $stmt->execute();
        
        $emergencyId = $conn->lastInsertId();
        
        // Return the newly created emergency with prediction
        $response = [
            'id' => $emergencyId,
            'type' => $input['type'],
            'location' => $input['location'],
            'severity' => $input['severity'],
            'status' => 'active',
            'prediction' => $this->generatePrediction($input['type'], $input['location'])
        ];
        
        echo json_encode($response);
    }
    // Default case - return all active emergencies
    else {
        $status = isset($_GET['status']) ? $_GET['status'] : 'active';
        $stmt = $conn->prepare("SELECT * FROM disasters WHERE status = :status ORDER BY start_time DESC");
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Enhance with AI predictions for demo
        foreach ($results as &$result) {
            $result['prediction'] = $this->generatePrediction($result['type'], $result['location']);
            $result['recommended_resources'] = $this->getRecommendedResources($result['type']);
        }
        
        echo json_encode($results);
    }
} catch(PDOException $e) {
    // For demo purposes, return sample data if database fails
    echo json_encode($this->getSampleEmergencies());
}

function generatePrediction($type, $location) {
    // Simulate AI prediction
    $patterns = [
        'Flood' => ['coastal areas', 'river basins', 'low-lying regions'],
        'Earthquake' => ['fault lines', 'seismic zones', 'mountainous areas'],
        'Cyclone' => ['coastal regions', 'islands', 'peninsular areas']
    ];
    
    $riskFactors = [
        'high' => ['heavy rainfall', 'seismic activity', 'high tides'],
        'medium' => ['moderate rainfall', 'soil erosion', 'wind patterns'],
        'low' => ['seasonal changes', 'urban drainage', 'construction activity']
    ];
    
    $pattern = $patterns[$type] ?? $patterns['Flood'];
    $riskFactor = $riskFactors[rand(0, 1) ? 'high' : (rand(0, 1) ? 'medium' : 'low')];
    
    return [
        'risk_level' => $riskFactor,
        'next_72_hours' => rand(30, 90),
        'pattern' => $pattern[array_rand($pattern)],
        'factors' => array_slice($riskFactor, 0, rand(1, 3))
    ];
}

function getRecommendedResources($type) {
    $resources = [
        'Flood' => ['rescue boats', 'water purifiers', 'medical kits'],
        'Earthquake' => ['heavy equipment', 'tents', 'search dogs'],
        'Cyclone' => ['generators', 'tarpaulins', 'dry food'],
        'Fire' => ['fire extinguishers', 'protective gear', 'water tankers'],
        'default' => ['medical supplies', 'food packets', 'blankets']
    ];
    
    return $resources[$type] ?? $resources['default'];
}

function getSampleEmergencies() {
    return [
        [
            'id' => 1,
            'type' => 'Flood',
            'location' => 'Mumbai',
            'severity' => 75,
            'status' => 'active',
            'start_time' => date('Y-m-d H:i:s', strtotime('-2 days')),
            'prediction' => [
                'risk_level' => 'high',
                'next_72_hours' => 68,
                'pattern' => 'river basins',
                'factors' => ['heavy rainfall', 'high tides']
            ],
            'recommended_resources' => ['rescue boats', 'water purifiers', 'medical kits']
        ],
        [
            'id' => 2,
            'type' => 'Earthquake',
            'location' => 'Delhi',
            'severity' => 90,
            'status' => 'active',
            'start_time' => date('Y-m-d H:i:s', strtotime('-1 day')),
            'prediction' => [
                'risk_level' => 'high',
                'next_72_hours' => 85,
                'pattern' => 'fault lines',
                'factors' => ['seismic activity', 'soil liquefaction']
            ],
            'recommended_resources' => ['heavy equipment', 'tents', 'search dogs']
        ],
        [
            'id' => 3,
            'type' => 'Cyclone',
            'location' => 'Chennai',
            'severity' => 60,
            'status' => 'active',
            'start_time' => date('Y-m-d H:i:s', strtotime('-6 hours')),
            'prediction' => [
                'risk_level' => 'medium',
                'next_72_hours' => 45,
                'pattern' => 'coastal regions',
                'factors' => ['wind patterns', 'high tides']
            ],
            'recommended_resources' => ['generators', 'tarpaulins', 'dry food']
        ]
    ];
}
?>