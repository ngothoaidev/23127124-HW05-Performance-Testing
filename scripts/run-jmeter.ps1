param(
    [ValidateSet("Load", "Stress", "Spike", "Soak")]
    [string]$Scenario,
    [int]$Threads = 0,
    [int]$RampSeconds = 0,
    [int]$DurationSeconds = 0
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$date = "20260903"
$plan = Join-Path $root "test-plans\23127124_${Scenario}_${date}.jmx"
$javaHome = (Get-ChildItem -LiteralPath (Join-Path $root ".tools\java") -Directory | Select-Object -First 1).FullName
$javaExe = Join-Path $javaHome "bin\java.exe"
$jmeterJar = Join-Path $root ".tools\apache-jmeter-5.6.3\bin\ApacheJMeter.jar"
$dataFile = Join-Path $root "test-data\users.csv"
$runId = Get-Date -Format "yyyyMMddHHmmss"
$resultDir = Join-Path $root "results\$Scenario-$runId"
$htmlDir = Join-Path $resultDir "html"
$jtl = Join-Path $resultDir "23127124_${Scenario}_${date}.jtl"
$resourceCsv = Join-Path $resultDir "resource-usage.csv"
$jmeterLog = Join-Path $resultDir "jmeter.log"
$pidFile = Join-Path $root ".runtime\backend.pid"

if (-not (Test-Path -LiteralPath $plan)) { throw "Test plan not found: $plan" }
if (-not (Test-Path -LiteralPath $pidFile)) { throw "Run scripts/start-backend.ps1 first." }
New-Item -ItemType Directory -Force -Path $resultDir | Out-Null

$defaults = @{
    Load = @(15, 30, 180)
    Stress = @(400, 60, 180)
    Spike = @(600, 2, 90)
    Soak = @(250, 60, 600)
}
$selected = $defaults[$Scenario]
if ($Threads -le 0) { $Threads = $selected[0] }
if ($RampSeconds -le 0) { $RampSeconds = $selected[1] }
if ($DurationSeconds -le 0) { $DurationSeconds = $selected[2] }

$metadata = [ordered]@{
    student_id = "23127124"
    scenario = $Scenario
    plan = $plan
    started_at = (Get-Date).ToString("o")
    run_id = $runId
    host = "127.0.0.1"
    port = 3000
    threads = $Threads
    ramp_seconds = $RampSeconds
    duration_seconds = $DurationSeconds
    jmeter_version = "5.6.3"
    java_version = "Temurin 21"
}
$metadata | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $resultDir "run-metadata.json")

$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"
$arguments = @(
    "-n", "-t", $plan,
    "-l", $jtl,
    "-e", "-o", $htmlDir,
    "-j", $jmeterLog,
    "-Jhost=127.0.0.1",
    "-Jport=3000",
    "-Jdata.file=$dataFile",
    "-Jrun.id=$runId",
    "-Jthreads=$Threads",
    "-Jramp.seconds=$RampSeconds",
    "-Jduration.seconds=$DurationSeconds"
)

$processInfo = [System.Diagnostics.ProcessStartInfo]::new()
$processInfo.FileName = $javaExe
$processInfo.WorkingDirectory = $root
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true
$allArguments = @("-jar", $jmeterJar) + $arguments
if ($null -ne $processInfo.ArgumentList) {
    foreach ($argument in $allArguments) {
        $processInfo.ArgumentList.Add([string]$argument)
    }
} else {
    # Windows PowerShell 5.1 uses .NET Framework, where ArgumentList is unavailable.
    $processInfo.Arguments = ($allArguments | ForEach-Object {
        '"' + ([string]$_).Replace('"', '\"') + '"'
    }) -join ' '
}
$jmeterProcess = [System.Diagnostics.Process]::Start($processInfo)
$backendPid = [int](Get-Content -Raw -LiteralPath $pidFile)
$samples = [System.Collections.Generic.List[object]]::new()

while (-not $jmeterProcess.HasExited) {
    $backend = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
    if ($backend) {
        $samples.Add([pscustomobject]@{
            Timestamp = (Get-Date).ToString("o")
            BackendPid = $backend.Id
            CPUSeconds = [math]::Round($backend.CPU, 3)
            WorkingSetMB = [math]::Round($backend.WorkingSet64 / 1MB, 2)
            PrivateMemoryMB = [math]::Round($backend.PrivateMemorySize64 / 1MB, 2)
            ThreadCount = $backend.Threads.Count
        })
    }
    Start-Sleep -Seconds 1
    $jmeterProcess.Refresh()
}

$samples | Export-Csv -NoTypeInformation -Encoding UTF8 -LiteralPath $resourceCsv
if ($jmeterProcess.ExitCode -ne 0) { throw "JMeter failed with exit code $($jmeterProcess.ExitCode). Inspect $jmeterLog" }
Write-Output "Completed ${Scenario}: threads=$Threads ramp=${RampSeconds}s duration=${DurationSeconds}s"
Write-Output "JTL: $jtl"
Write-Output "HTML: $htmlDir"
Write-Output "Resources: $resourceCsv"
