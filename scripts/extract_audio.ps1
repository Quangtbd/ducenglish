Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$destDir = "public\audio\ets2026"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$zipPath = (Resolve-Path "LISTENING-20261122T125750Z-1-001.zip").Path
Write-Host "Opening outer zip: $zipPath"
$outer = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$audioEntry = $outer.GetEntry("LISTENING/Audio.zip")

$tempAudioZip = Join-Path (Get-Location) "temp_audio.zip"
Write-Host "Extracting inner Audio.zip to $tempAudioZip..."
[System.IO.Compression.ZipFileExtensions]::ExtractToFile($audioEntry, $tempAudioZip, $true)
$outer.Dispose()

Write-Host "Extracting MP3 files from $tempAudioZip..."
$inner = [System.IO.Compression.ZipFile]::OpenRead($tempAudioZip)
$count = 0
foreach ($entry in $inner.Entries) {
    if ($entry.FullName.EndsWith(".mp3") -and -not $entry.FullName.Contains("._") -and $entry.Name -ne "") {
        $targetPath = Join-Path $destDir $entry.Name
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
        $count++
    }
}
$inner.Dispose()
Remove-Item $tempAudioZip -Force
Write-Host "Done! Successfully extracted $count MP3 files to $destDir"
