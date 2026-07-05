# PHP Image Server

Self-hosted image backend for the portfolio. Images are stored as WebP files and served with optional on-the-fly resizing.

## Server requirements

- PHP 7.4+ (tested with 8.x)
- GD extension with **WebP support** (`--with-webp` compile flag — standard on most hosts)
- Apache with `mod_rewrite` enabled (or adapt `.htaccess` rules to Nginx config below)

## File layout

```
/your-server/images/       ← deploy this directory
  upload.php               ← POST endpoint for Sanity Studio
  transform.php            ← on-the-fly resize/crop/blur
  .htaccess                ← routes ?w=… params through transform.php
  photos/                  ← created automatically, stores original WebPs
  cache/                   ← created automatically, stores transformed copies
```

## Environment variables (set via Apache SetEnv / .env / hosting panel)

| Variable | Example | Description |
|---|---|---|
| `IMAGE_UPLOAD_API_KEY` | `a-long-secret-string` | Shared secret used to authenticate Studio uploads |
| `IMAGE_BASE_URL` | `https://images.yourserver.com` | Public base URL for the images directory |
| `IMAGE_UPLOAD_QUALITY` | `85` | WebP quality for uploads (1–100, default 85) |

### Apache `.htaccess` example for setting env vars

```apache
SetEnv IMAGE_UPLOAD_API_KEY  "your-secret-key-here"
SetEnv IMAGE_BASE_URL        "https://images.yourserver.com"
SetEnv IMAGE_UPLOAD_QUALITY  "85"
```

### Nginx equivalent (no .htaccess)

Replace the `.htaccess` rewrite with this Nginx location block:

```nginx
location /photos/ {
    if ($args ~* "(^|&)(w|h|q|fit|blur)=") {
        rewrite ^/photos/([a-zA-Z0-9._-]+\.webp)$ /transform.php?src=$1 last;
    }
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location ~ ^/(upload|transform)\.php$ {
    fastcgi_pass unix:/run/php/php8.x-fpm.sock;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param IMAGE_UPLOAD_API_KEY "your-secret-key-here";
    fastcgi_param IMAGE_BASE_URL "https://images.yourserver.com";
}
```

## Sanity Studio configuration

Add to your `studio/.env` (or `.env.local`):

```env
SANITY_STUDIO_IMAGE_UPLOAD_URL=https://images.yourserver.com/upload.php
SANITY_STUDIO_IMAGE_UPLOAD_KEY=your-secret-key-here
```

Once set, the "Upload folder" button in Studio sends photos to your PHP server instead of Sanity's asset store.

## Frontend configuration

No extra env vars needed — image URLs are stored in Sanity as plain `https://…` strings, and the frontend appends `?w=800&q=80` etc. when building srcSets.

## URL format

| Intent | URL |
|---|---|
| Original file | `https://images.yourserver.com/photos/20240615_name_abc12.webp` |
| Resize to 800px wide | `…?w=800` |
| Resize to 800×450 (16:9 crop) | `…?w=800&h=450&fit=crop` |
| Blur placeholder (48px) | `…?w=48&q=40&blur=10` |
| Open Graph image | `…?w=1200&h=630&fit=crop&q=85` |

Transformed images are cached to disk (`cache/`) automatically.

## Disk cleanup

The `cache/` directory grows over time. Safe to wipe entirely — files regenerate on next request.

```bash
rm -rf /your-server/images/cache/*
```
