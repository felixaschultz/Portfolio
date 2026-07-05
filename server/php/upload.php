<?php
declare(strict_types=1);

// Allow CORS for Sanity Studio (adjust origin in production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: X-API-Key, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

// ── Auth ──────────────────────────────────────────────────────────────────────
$apiKey = trim($_SERVER['HTTP_X_API_KEY'] ?? '');
$expectedKey = trim((string) getenv('IMAGE_UPLOAD_API_KEY'));
if (!$expectedKey || !hash_equals($expectedKey, $apiKey)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file provided (field name: file)']);
    exit;
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    $codes = [1 => 'exceeds upload_max_filesize', 2 => 'exceeds MAX_FILE_SIZE', 3 => 'partial', 4 => 'no file', 6 => 'no tmp dir', 7 => 'write failed', 8 => 'stopped by extension'];
    $msg = $codes[$file['error']] ?? 'error code ' . $file['error'];
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $msg]);
    exit;
}

// 150 MB hard cap
$maxBytes = 150 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['error' => 'File too large (max 150 MB)']);
    exit;
}

// ── MIME validation ───────────────────────────────────────────────────────────
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = (string) finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$supportedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $supportedMimes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported image type: ' . $mimeType . '. Supported: JPEG, PNG, WebP, GIF']);
    exit;
}

if (!function_exists('imagewebp')) {
    http_response_code(500);
    echo json_encode(['error' => 'Server GD library missing WebP support. Ensure PHP is compiled with --with-webp.']);
    exit;
}

// ── Load image ────────────────────────────────────────────────────────────────
$source = null;
switch ($mimeType) {
    case 'image/jpeg': $source = imagecreatefromjpeg($file['tmp_name']); break;
    case 'image/png':  $source = imagecreatefrompng($file['tmp_name']); break;
    case 'image/webp': $source = imagecreatefromwebp($file['tmp_name']); break;
    case 'image/gif':  $source = imagecreatefromgif($file['tmp_name']); break;
}

if (!$source) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to decode image']);
    exit;
}

$origWidth  = imagesx($source);
$origHeight = imagesy($source);

// Flatten PNG transparency onto white background
if ($mimeType === 'image/png') {
    $canvas = imagecreatetruecolor($origWidth, $origHeight);
    $white = imagecolorallocate($canvas, 255, 255, 255);
    imagefill($canvas, 0, 0, $white);
    imagecopy($canvas, $source, 0, 0, 0, 0, $origWidth, $origHeight);
    imagedestroy($source);
    $source = $canvas;
}

// ── Save as WebP ──────────────────────────────────────────────────────────────
$quality = (int) max(1, min(100, (int) (getenv('IMAGE_UPLOAD_QUALITY') ?: 85)));

$basename = pathinfo($file['name'], PATHINFO_FILENAME);
$basename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $basename);
$basename = substr($basename, 0, 50);
$filename = date('Ymd') . '_' . $basename . '_' . bin2hex(random_bytes(5)) . '.webp';

$uploadDir = __DIR__ . '/photos/';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Cannot create photos directory']);
    exit;
}

$outPath = $uploadDir . $filename;
$ok = imagewebp($source, $outPath, $quality);
imagedestroy($source);

if (!$ok || !file_exists($outPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save WebP']);
    exit;
}

$baseUrl = rtrim((string) getenv('IMAGE_BASE_URL'), '/');
if (!$baseUrl) {
    http_response_code(500);
    echo json_encode(['error' => 'IMAGE_BASE_URL not configured on server']);
    exit;
}

header('Content-Type: application/json');
echo json_encode([
    'url'      => $baseUrl . '/photos/' . $filename,
    'width'    => $origWidth,
    'height'   => $origHeight,
    'filename' => $filename,
]);
