$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root ".runtime\backend.pid"

if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Output "No managed backend process is recorded."
    exit 0
}

$backendPid = [int](Get-Content -Raw -LiteralPath $pidFile)
$process = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
if ($process -and $process.ProcessName -eq "node") {
    Stop-Process -Id $backendPid -Force
    Write-Output "Stopped backend PID $backendPid."
}
Remove-Item -Force -LiteralPath $pidFile

