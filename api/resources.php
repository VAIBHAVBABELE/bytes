<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db_connect.php';

try {
    // Check if it's a request for resource optimization
    if (isset($_GET['optimize']) && isset($_GET['disaster_id'])) {
        $disasterId = $_GET['disaster_id'];
        $stmt = $conn->prepare("SELECT * FROM disasters WHERE id = :id");
        $stmt->bindParam(':id', $disasterId);
        $stmt->execute();
        $disaster = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$disaster) {
            echo json_encode(['error' => 'Disaster not found']);
            exit;
        }

        // Get all resources
        $stmt = $conn->prepare("SELECT * FROM resources WHERE quantity > 0");
        $stmt->execute();
        $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Simulate AI optimization
        $optimizedResources = $this->optimizeResourceAllocation($disaster, $resources);
        
        echo json_encode([
            'disaster' => $disaster,
            'resources' => $optimizedResources,
            'ai_recommendation' => $this->generateAIRecommendation($disaster, $optimizedResources)
        ]);
    }
    // Default case - return all resources
    else {
        $stmt = $conn->prepare("SELECT * FROM resources ORDER BY last_updated DESC");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no results, return sample data
        if (empty($results)) {
            $results = $this->getSampleResources();
        }
        
        echo json_encode($results);
    }
} catch(PDOException $e) {
    // Return sample data if database fails
    echo json_encode($this->getSampleResources());
}

function optimizeResourceAllocation($disaster, $resources) {
    // Simulate AI optimization based on disaster type and severity
    $allocated = [];
    $severityFactor = $disaster['severity'] / 100;
    
    foreach ($resources as $resource) {
        // Calculate distance score (simplified for demo)
        $distanceScore = 1 - (rand(1, 5) / 10); // 0.5 to 0.9
        
        // Type matching
        $typeScore = calculateTypeMatch($disaster['type'], $resource['type']);
        
        // Calculate allocation amount
        $baseAllocation = ceil($resource['quantity'] * $severityFactor * $typeScore * $distanceScore);
        $allocation = min($baseAllocation, $resource['quantity']);
        
        if ($allocation > 0) {
            $allocated[] = [
                'id' => $resource['id'],
                'name' => $resource['name'],
                'type' => $resource['type'],
                'allocated_quantity' => $allocation,
                'original_quantity' => $resource['quantity'],
                'location' => $resource['location'],
                'priority_score' => round(($typeScore + $distanceScore) / 2, 2),
                'eta' => calculateETA($resource['location'], $disaster['location'])
            ];
        }
    }
    
    // Sort by priority score
    usort($allocated, function($a, $b) {
        return $b['priority_score'] <=> $a['priority_score'];
    });
    
    return $allocated;
}

function calculateTypeMatch($disasterType, $resourceType) {
    $matchMatrix = [
        'Flood' => ['Medical' => 0.9, 'Water' => 0.8, 'Shelter' => 0.7, 'Food' => 0.6, 'Transport' => 0.5],
        'Earthquake' => ['Medical' => 1.0, 'Shelter' => 0.9, 'Transport' => 0.8, 'Food' => 0.7, 'Water' => 0.6],
        'Cyclone' => ['Shelter' => 0.9, 'Food' => 0.8, 'Medical' => 0.7, 'Water' => 0.6, 'Transport' => 0.5],
        'Fire' => ['Medical' => 0.8, 'Shelter' => 0.7, 'Water' => 0.9, 'Food' => 0.6, 'Transport' => 0.7],
        'default' => ['Medical' => 0.7, 'Shelter' => 0.6, 'Food' => 0.5, 'Water' => 0.5, 'Transport' => 0.5]
    ];
    
    return $matchMatrix[$disasterType][$resourceType] ?? $matchMatrix['default'][$resourceType] ?? 0.5;
}

function calculateETA($fromLocation, $toLocation) {
    // Simplified ETA calculation based on distance
    $locations = [
        'Mumbai' => 1,
        'Delhi' => 2,
        'Chennai' => 3,
        'Bangalore' => 4,
        'Kolkata' => 5,
        'Warehouse A' => 1,
        'Warehouse B' => 2,
        'Warehouse C' => 3
    ];
    
    $from = $locations[$fromLocation] ?? 0;
    $to = $locations[$toLocation] ?? 0;
    $distance = abs($from - $to) + 1;
    
    return ($distance * 2) . '-' . ($distance * 3) . ' hours';
}

function generateAIRecommendation($disaster, $resources) {
    $recommendations = [
        'Flood' => [
            'high' => 'Prioritize water rescue equipment and medical supplies. Consider deploying boats and water purification systems first.',
            'medium' => 'Focus on clean water distribution and temporary shelters. Monitor for waterborne diseases.',
            'low' => 'Provide basic medical support and assess infrastructure damage.'
        ],
        'Earthquake' => [
            'high' => 'Deploy search and rescue teams immediately. Prioritize medical personnel and heavy equipment for debris removal.',
            'medium' => 'Set up field hospitals and assess structural damage. Be prepared for aftershocks.',
            'low' => 'Conduct damage assessment and provide temporary shelter.'
        ],
        'Cyclone' => [
            'high' => 'Secure temporary shelters and emergency power. Prioritize medical teams for injuries from flying debris.',
            'medium' => 'Distribute food and water supplies. Restore communication lines.',
            'low' => 'Assess property damage and clear roads.'
        ]
    ];
    
    $severityLevel = $disaster['severity'] >= 70 ? 'high' : ($disaster['severity'] >= 40 ? 'medium' : 'low');
    $baseRecommendation = $recommendations[$disaster['type']][$severityLevel] ?? 'Deploy standard emergency response protocol.';
    
    // Add resource-specific notes
    $topResource = count($resources) > 0 ? $resources[0]['type'] : 'medical';
    $resourceNote = "The AI model recommends prioritizing {$topResource} resources based on current availability and demand.";
    
    return "{$baseRecommendation} {$resourceNote}";
}

function getSampleResources() {
    return [
        [
            'id' => 1,
            'name' => 'Medical Kit A',
            'type' => 'Medical',
            'quantity' => 50,
            'location' => 'Warehouse A',
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 2,
            'name' => 'Water Bottles',
            'type' => 'Water',
            'quantity' => 200,
            'location' => 'Warehouse A',
            'last_updated' => date('Y-m-d H:i:s', strtotime('-2 hours'))
        ],
        [
            'id' => 3,
            'name' => 'Emergency Tents',
            'type' => 'Shelter',
            'quantity' => 100,
            'location' => 'Warehouse B',
            'last_updated' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ],
        [
            'id' => 4,
            'name' => 'Ready-to-Eat Meals',
            'type' => 'Food',
            'quantity' => 150,
            'location' => 'Warehouse B',
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 5,
            'name' => 'First Aid Supplies',
            'type' => 'Medical',
            'quantity' => 75,
            'location' => 'Warehouse C',
            'last_updated' => date('Y-m-d H:i:s', strtotime('-3 hours'))
        ]
    ];
}
?>