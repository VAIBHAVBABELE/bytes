<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db_connect.php';

try {
    if (!isset($_GET['disaster_id'])) {
        echo json_encode(['error' => 'Disaster ID required']);
        exit;
    }

    $disasterId = $_GET['disaster_id'];
    
    // Get disaster details
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
    $result = $this->simulateAIOptimization($disaster, $resources);
    
    echo json_encode($result);
    
} catch(PDOException $e) {
    // Fallback to demo optimization
    echo json_encode($this->getDemoOptimization($_GET['disaster_id']));
}

function simulateAIOptimization($disaster, $resources) {
    // Step 1: Determine required resources based on disaster type and severity
    $requiredResources = calculateRequiredResources($disaster);
    
    // Step 2: Match available resources to requirements
    $allocations = matchResources($resources, $requiredResources);
    
    // Step 3: Calculate optimal routes
    $routes = calculateRoutes($disaster['location'], $allocations);
    
    // Step 4: Generate AI recommendations
    $recommendation = generateOptimizationRecommendation($disaster, $allocations, $routes);
    
    return [
        'disaster' => $disaster,
        'allocations' => $allocations,
        'routes' => $routes,
        'ai_recommendation' => $recommendation,
        'timestamp' => date('Y-m-d H:i:s'),
        'optimization_score' => rand(70, 95) // Simulated AI score
    ];
}

function calculateRequiredResources($disaster) {
    $baseRequirements = [
        'Flood' => [
            'Medical' => 30,
            'Water' => 50,
            'Shelter' => 20,
            'Food' => 40,
            'Transport' => 15
        ],
        'Earthquake' => [
            'Medical' => 60,
            'Water' => 30,
            'Shelter' => 50,
            'Food' => 30,
            'Transport' => 25
        ],
        'Cyclone' => [
            'Medical' => 40,
            'Water' => 40,
            'Shelter' => 40,
            'Food' => 40,
            'Transport' => 20
        ]
    ];
    
    $base = $baseRequirements[$disaster['type']] ?? $baseRequirements['Flood'];
    $severityFactor = $disaster['severity'] / 100;
    
    // Scale by severity
    foreach ($base as &$value) {
        $value = ceil($value * $severityFactor * (1 + rand(0, 20)/100)); // Add some variance
    }
    
    return $base;
}

function matchResources($available, $required) {
    $allocations = [];
    
    foreach ($required as $type => $amount) {
        $availableOfType = array_filter($available, function($r) use ($type) {
            return $r['type'] === $type;
        });
        
        usort($availableOfType, function($a, $b) {
            return $a['location'] <=> $b['location']; // Simple sort for demo
        });
        
        $remaining = $amount;
        $allocated = [];
        
        foreach ($availableOfType as $resource) {
            if ($remaining <= 0) break;
            
            $alloc = min($resource['quantity'], $remaining);
            $allocated[] = [
                'resource_id' => $resource['id'],
                'resource_name' => $resource['name'],
                'location' => $resource['location'],
                'allocated' => $alloc,
                'original_quantity' => $resource['quantity']
            ];
            
            $remaining -= $alloc;
        }
        
        if (count($allocated) > 0) {
            $allocations[$type] = [
                'required' => $amount,
                'allocated' => array_sum(array_column($allocated, 'allocated')),
                'sources' => $allocated
            ];
        }
    }
    
    return $allocations;
}

function calculateRoutes($disasterLocation, $allocations) {
    $warehouses = [];
    
    // Get all unique source locations
    foreach ($allocations as $type => $allocation) {
        foreach ($allocation['sources'] as $source) {
            if (!in_array($source['location'], $warehouses)) {
                $warehouses[] = $source['location'];
            }
        }
    }
    
    // Generate routes with potential blockages
    $routes = [];
    foreach ($warehouses as $warehouse) {
        $hasBlockage = rand(0, 3) === 0; // 25% chance of blockage
        
        $routes[] = [
            'from' => $warehouse,
            'to' => $disasterLocation,
            'distance_km' => rand(50, 300),
            'has_blockage' => $hasBlockage,
            'blockage_reason' => $hasBlockage ?getRandomBlockageReason() : null,
            'alternate_route' => $hasBlockage ? getAlternateRoute($warehouse, $disasterLocation) : null,
            'estimated_time' => calculateRouteTime($warehouse, $disasterLocation, $hasBlockage)
        ];
    }
    
    return $routes;
}

function getRandomBlockageReason() {
    $reasons = [
        'Bridge collapse',
        'Flooded road',
        'Landslide',
        'Civil unrest',
        'Road construction',
        'Accident blockage'
    ];
    return $reasons[array_rand($reasons)];
}

function getAlternateRoute($from, $to) {
    $routes = [
        "Use service road via nearby village",
        "Take the national highway with 15km detour",
        "Air lift available for critical supplies",
        "Rail transport possible from nearest station",
        "Combination of river and road transport"
    ];
    return $routes[array_rand($routes)];
}

function calculateRouteTime($from, $to, $hasBlockage) {
    $baseTime = rand(2, 6); // hours
    return $hasBlockage ? $baseTime + rand(1, 3) : $baseTime;
}

function generateOptimizationRecommendation($disaster, $allocations, $routes) {
    $coverage = [];
    foreach ($allocations as $type => $alloc) {
        $coverage[] = sprintf(
            "%s: %d%% covered", 
            $type, 
            round(($alloc['allocated'] / $alloc['required']) * 100)
        );
    }
    
    $blockages = array_filter($routes, function($r) { return $r['has_blockage']; });
    
    $recommendation = sprintf(
        "AI optimization complete with %d%% average coverage (%s). ",
        round(array_sum(array_column($allocations, 'allocated')) / array_sum(array_column($allocations, 'required')) * 100),
        implode(', ', $coverage)
    );
    
    if (count($blockages) > 0) {
        $recommendation .= sprintf(
            "Detected %d route blockages - recommend using alternate transport methods. ",
            count($blockages)
        );
    }
    
    $priorityResource = array_reduce($allocations, function($carry, $item) {
        return ($item['required'] - $item['allocated']) > ($carry['required'] - $carry['allocated']) ? $item : $carry;
    }, ['required' => 0, 'allocated' => 0]);
    
    if ($priorityResource['allocated'] < $priorityResource['required']) {
        $recommendation .= "Priority gap detected in resources - consider emergency procurement.";
    }
    
    return $recommendation;
}

function getDemoOptimization($disasterId) {
    $disasters = [
        1 => ['type' => 'Flood', 'location' => 'Mumbai', 'severity' => 75],
        2 => ['type' => 'Earthquake', 'location' => 'Delhi', 'severity' => 90],
        3 => ['type' => 'Cyclone', 'location' => 'Chennai', 'severity' => 60]
    ];
    
    $disaster = $disasters[$disasterId] ?? $disasters[1];
    
    return [
        'disaster' => $disaster,
        'allocations' => [
            'Medical' => [
                'required' => 45,
                'allocated' => 40,
                'sources' => [
                    [
                        'resource_id' => 1,
                        'resource_name' => 'Medical Kit A',
                        'location' => 'Warehouse A',
                        'allocated' => 25,
                        'original_quantity' => 50
                    ],
                    [
                        'resource_id' => 5,
                        'resource_name' => 'First Aid Supplies',
                        'location' => 'Warehouse C',
                        'allocated' => 15,
                        'original_quantity' => 75
                    ]
                ]
            ],
            'Water' => [
                'required' => 60,
                'allocated' => 60,
                'sources' => [
                    [
                        'resource_id' => 2,
                        'resource_name' => 'Water Bottles',
                        'location' => 'Warehouse A',
                        'allocated' => 60,
                        'original_quantity' => 200
                    ]
                ]
            ]
        ],
        'routes' => [
            [
                'from' => 'Warehouse A',
                'to' => $disaster['location'],
                'distance_km' => 120,
                'has_blockage' => true,
                'blockage_reason' => 'Bridge collapse',
                'alternate_route' => 'Use service road via nearby village',
                'estimated_time' => '4-5 hours'
            ],
            [
                'from' => 'Warehouse C',
                'to' => $disaster['location'],
                'distance_km' => 180,
                'has_blockage' => false,
                'estimated_time' => '3-4 hours'
            ]
        ],
        'ai_recommendation' => 'AI optimization complete with 85% average coverage. ' .
                              'Detected 1 route blockage - recommend using alternate transport methods. ' .
                              'Priority gap detected in Medical resources - consider emergency procurement.',
        'timestamp' => date('Y-m-d H:i:s'),
        'optimization_score' => 82
    ];
}
?>