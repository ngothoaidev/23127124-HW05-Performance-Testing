param(
    [string]$Scenario = "manual"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $root ".runtime"
$backendDir = Join-Path $root ".sut\eshop-sut\backend"
$pidFile = Join-Path $runtimeDir "backend.pid"
$logDir = Join-Path $root "evidence\backend-logs"

New-Item -ItemType Directory -Force -Path $runtimeDir, $logDir | Out-Null

if (Test-Path -LiteralPath $pidFile) {
    $oldPid = [int](Get-Content -Raw -LiteralPath $pidFile)
    $oldProcess = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if ($oldProcess -and $oldProcess.ProcessName -eq "node") {
        Stop-Process -Id $oldPid -Force
        $oldProcess.WaitForExit()
    }
    Remove-Item -Force -LiteralPath $pidFile
}

$nodeExe = (Get-Command node -ErrorAction Stop).Source
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stdout = Join-Path $logDir "$Scenario-$timestamp.out.log"
$stderr = Join-Path $logDir "$Scenario-$timestamp.err.log"
$process = Start-Process -FilePath $nodeExe -ArgumentList "server.js" -WorkingDirectory $backendDir -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden -PassThru
Set-Content -LiteralPath $pidFile -Value $process.Id

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/products" -TimeoutSec 2 | Out-Null
        $ready = $true
        break
    } catch {
        Start-Sleep -Milliseconds 500
    }
}
if (-not $ready) {
    throw "Backend did not become ready. Inspect $stderr"
}

Write-Output "Backend PID $($process.Id) ready at http://127.0.0.1:3000; database reseeded on startup."

