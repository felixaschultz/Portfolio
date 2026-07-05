<?php
declare(strict_types=1);

/**
 * On-the-fly image transformer with disk cache.
 * Reached via .htaccess rewrite when query params (w, h, q, fit, blur) are present.
 *
 * Params:
 *   src  – filename only (e.g. 20240615_myimage_abc12.webp)
 *   w    – target width in px
 *   h    – target height in px
 *   q    – JPEG/WebP quality 1-100 (default 80)
 *   fit  – "max" (default, scale-down keeping ratio) or "crop" (center-crop to w×h)
 *   blur – blur passes (1-20); used for tiny blur placeholders
 */

$photosDir = __DIR__ . '/photos/';
$cacheDir  = __DIR__ . '/cache/';

// ── Input validation ──────────────────────────────────────────────────────────
$rawSrc = $_GET['src'] ?? '';
$src = basename(preg_replace('/[^a-zA-Z0-9._-]/', '', $rawSrc));
if (!$src || !str_ends_with($src, '.webp')) {
    http_response_code(400);
    exit('Invalid src');
}

$filePath = $photosDir . $src;
if (!is_file($filePath)) {
    http_response_code(404);
    exit('Not found');
}

$w    = isset($_GET['w']) ? max(1, (int) $_GET['w']) : 0;
$h    = isset($_GET['h']) ? max(1, (int) $_GET['h']) : 0;
$q    = isset($_GET['q']) ? min(100, max(1, (int) $_GET['q'])) : 80;
$fit  = (isset($_GET['fit']) && $_GET['fit'] === 'crop') ? 'crop' : 'max';
$blur = isset($_GET['blur']) ? min(20, max(0, (int) $_GET['blur'])) : 0;

// Clamp to sane dimensions (32000 is GD's default limit)
$w = min($w, 8000);
$h = min($h, 8000);

// ── No transform needed? Serve the original ───────────────────────────────────
if (!$w && !$h && !$blur) {
    header('Content-Type: image/webp');
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($filePath);
    exit;
}

// ── Cache check ───────────────────────────────────────────────────────────────
$cacheKey = md5($src . '|' . $w . '|' . $h . '|' . $q . '|' . $fit . '|' . $blur);
$cachePath = $cacheDir . $cacheKey . '.webp';

if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

if (is_file($cachePath)) {
    header('Content-Type: image/webp');
    header('Cache-Control: public, max-age=31536000, immutable');
    header('X-Cache: HIT');
    readfile($cachePath);
    exit;
}

// ── Load image ────────────────────────────────────────────────────────────────
$image = imagecreatefromwebp($filePath);
if (!$image) {
    http_response_code(500);
    exit('Failed to load image');
}

$origW = imagesx($image);
$origH = imagesy($image);

// ── Resize / crop ─────────────────────────────────────────────────────────────
if ($fit === 'crop' && $w > 0 && $h > 0) {
    // Center-crop to exact w×h
    $srcRatio = $origW / $origH;
    $dstRatio = $w / $h;

    if ($srcRatio > $dstRatio) {
        // Source is wider — crop left/right
        $srcH = $origH;
        $srcW = (int) round($origH * $dstRatio);
        $srcX = (int) round(($origW - $srcW) / 2);
        $srcY = 0;
    } else {
        // Source is taller — crop top/bottom
        $srcW = $origW;
        $srcH = (int) round($origW / $dstRatio);
        $srcX = 0;
        $srcY = (int) round(($origH - $srcH) / 2);
    }

    $out = imagecreatetruecolor($w, $h);
    imagecopyresampled($out, $image, 0, 0, $srcX, $srcY, $w, $h, $srcW, $srcH);

} else {
    // Scale proportionally, never upscale
    $targetW = $origW;
    $targetH = $origH;

    if ($w > 0 && $h > 0) {
        $scale    = min($w / $origW, $h / $origH, 1.0);
        $targetW  = max(1, (int) round($origW * $scale));
        $targetH  = max(1, (int) round($origH * $scale));
    } elseif ($w > 0) {
        $scale    = min($w / $origW, 1.0);
        $targetW  = max(1, (int) round($origW * $scale));
        $targetH  = max(1, (int) round($origH * $scale));
    } elseif ($h > 0) {
        $scale    = min($h / $origH, 1.0);
        $targetW  = max(1, (int) round($origW * $scale));
        $targetH  = max(1, (int) round($origH * $scale));
    }

    if ($targetW === $origW && $targetH === $origH && !$blur) {
        // No resize and no blur — serve original
        imagedestroy($image);
        header('Content-Type: image/webp');
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($filePath);
        exit;
    }

    $out = imagecreatetruecolor($targetW, $targetH);
    imagecopyresampled($out, $image, 0, 0, 0, 0, $targetW, $targetH, $origW, $origH);
}

imagedestroy($image);

// ── Blur (for tiny placeholders) ──────────────────────────────────────────────
if ($blur > 0) {
    $passes = min(20, max(1, $blur));
    for ($i = 0; $i < $passes; $i++) {
        imagefilter($out, IMG_FILTER_GAUSSIAN_BLUR);
    }
}

// ── Cache and serve ───────────────────────────────────────────────────────────
imagewebp($out, $cachePath, $q);
imagedestroy($out);

header('Content-Type: image/webp');
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Cache: MISS');
readfile($cachePath);
