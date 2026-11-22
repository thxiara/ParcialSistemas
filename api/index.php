<?php
# error handling
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

# buffer start
ob_start(); 

# default headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

# OPTIONS > OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

# HEAD > GET
if ($_SERVER['REQUEST_METHOD'] === 'HEAD') {
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

# autoloader
require_once (__DIR__ . '/autoload.php');

# api env
\app\utils\envLoader::load(__DIR__ . '/.env');

# database configurator
require_once (__DIR__ . '/config/database.php');

# database connection
try {
    $db = (new Database())->getConnection();
} catch (Throwable $e) {
    ob_clean();
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo conectar a la base de datos',
    ]);
    exit;
}

# router
$router = new \app\utils\router($db);

# routes
require_once (__DIR__ . '/routes.php');

# buffer end & clean
ob_end_clean();

# get route
$router->run();
