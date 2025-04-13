<?php
// Emergency Supply Chain Database Connection
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "emergency_supply";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables if they don't exist
    $conn->exec("CREATE TABLE IF NOT EXISTS disasters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        severity INT(3) NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
    )");
    
    $conn->exec("CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        location VARCHAR(100) NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $conn->exec("CREATE TABLE IF NOT EXISTS allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disaster_id INT NOT NULL,
        resource_id INT NOT NULL,
        quantity INT NOT NULL,
        route TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        FOREIGN KEY (disaster_id) REFERENCES disasters(id),
        FOREIGN KEY (resource_id) REFERENCES resources(id)
    )");
    
    // Insert sample data if tables are empty
    $checkDisasters = $conn->query("SELECT COUNT(*) FROM disasters")->fetchColumn();
    if ($checkDisasters == 0) {
        $sampleDisasters = [
            ['Flood', 'Mumbai', 75],
            ['Earthquake', 'Delhi', 90],
            ['Cyclone', 'Chennai', 60]
        ];
        
        $stmt = $conn->prepare("INSERT INTO disasters (type, location, severity) VALUES (?, ?, ?)");
        foreach ($sampleDisasters as $disaster) {
            $stmt->execute($disaster);
        }
    }
    
} catch(PDOException $e) {
    // For demo purposes, we'll show the error
    die("Connection failed: " . $e->getMessage());
}
?>