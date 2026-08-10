# Optimizes the school photographs into assets/img (large) + assets/img/thumbs (small).
# Requires Windows PowerShell 5.1 (uses System.Drawing / GDI+). No external tools needed.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\optimize-images.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets\img'
$thumbDir = Join-Path $root 'assets\img\thumbs'
New-Item -ItemType Directory -Force -Path $outDir, $thumbDir | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg([System.Drawing.Image]$src, [string]$dest, [int]$maxWidth, [int]$quality) {
  $ratio = 1.0
  if ($src.Width -gt $maxWidth) { $ratio = $maxWidth / [double]$src.Width }
  $newW = [int][math]::Round($src.Width * $ratio)
  $newH = [int][math]::Round($src.Height * $ratio)
  $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $newW, $newH)
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
  $bmp.Save($dest, $jpegCodec, $params)
  $g.Dispose(); $bmp.Dispose()
}

$jobs = @(
  @{ src = 'School Top view1.jpg.jpg';     name = 'top-view-1.jpg' },
  @{ src = 'School Top view2.jpg.jpg';     name = 'top-view-2.jpg' },
  @{ src = 'school compound.jpg';          name = 'compound.jpg' },
  @{ src = 'Arty-activity.jpg.jpg';        name = 'art-activity.jpg' },
  @{ src = 'current leaders.jpg';          name = 'leaders.jpg' },
  @{ src = 'computer club.jpg.jpg';        name = 'computer-club.jpg' },
  @{ src = 'Creating Green maki.jpg.jpg';  name = 'green-maki.jpg' },
  @{ src = 'Scout Activities.jpg.jpg';     name = 'scout-activities.jpg' }
)

foreach ($job in $jobs) {
  $srcPath = Join-Path $root $job.src
  if (-not (Test-Path -LiteralPath $srcPath)) { Write-Warning "Missing source: $($job.src)"; continue }
  $big = Join-Path $outDir $job.name
  $thumb = Join-Path $thumbDir $job.name
  $img = [System.Drawing.Image]::FromFile($srcPath)
  Save-Jpeg $img $big 1600 78
  Save-Jpeg $img $thumb 400 72
  $img.Dispose()
  $mb = [math]::Round((Get-Item -LiteralPath $big).Length / 1KB)
  $tb = [math]::Round((Get-Item -LiteralPath $thumb).Length / 1KB)
  Write-Host ("{0,-28} big:{1,6} KB  thumb:{2,5} KB" -f $job.name, $mb, $tb)
}
Write-Host "Done. Originals can now be deleted."
