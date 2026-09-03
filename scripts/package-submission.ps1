param(
    [Parameter(Mandatory = $true)][string]$GitHubUrl,
    [Parameter(Mandatory = $true)][string]$VideoUrl,
    [ValidateRange(0, 100)][int]$SelfGrade = 100
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$grade = $SelfGrade.ToString("000")
$packageName = "23127124_HW05_AI_Performance_$grade"
$outputRoot = Join-Path $root "output\submission"
$staging = Join-Path $outputRoot $packageName
$zip = Join-Path $outputRoot "$packageName.zip"

if (-not $GitHubUrl.StartsWith("https://github.com/")) { throw "A public GitHub repository URL is required." }
if (-not $VideoUrl.StartsWith("https://")) { throw "An unlisted YouTube video URL is required." }
if (-not (Test-Path -LiteralPath (Join-Path $root "git-commit-log.txt"))) { throw "Generate git-commit-log.txt after creating the required commits." }

$screenshots = Get-ChildItem -Path (Join-Path $root "evidence") -Include *.png,*.jpg,*.jpeg -Recurse -File -ErrorAction SilentlyContinue
if (-not $screenshots) { throw "Add the required JMeter/Task Manager and hardware screenshots under evidence/." }

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
if (Test-Path -LiteralPath $staging) {
    $resolvedStaging = (Resolve-Path -LiteralPath $staging).Path
    $resolvedOutput = (Resolve-Path -LiteralPath $outputRoot).Path
    if (-not $resolvedStaging.StartsWith($resolvedOutput, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe staging path" }
    Remove-Item -Recurse -Force -LiteralPath $resolvedStaging
}
New-Item -ItemType Directory -Force -Path $staging | Out-Null

$readme = Get-Content -Raw -LiteralPath (Join-Path $root "README.md")
$readme = $readme.Replace("<ADD_PUBLIC_GITHUB_URL>", $GitHubUrl).Replace("<ADD_UNLISTED_YOUTUBE_URL>", $VideoUrl)
Set-Content -Encoding UTF8 -LiteralPath (Join-Path $staging "README.md") -Value $readme

Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "test-plans") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "test-data") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "report") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "ai-audit") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "analysis") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "docs") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "issues") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "agent-skill") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "evidence") -Destination $staging
Copy-Item -Force -LiteralPath (Join-Path $root "git-commit-log.txt") -Destination $staging
Copy-Item -Recurse -Force -LiteralPath (Join-Path $root "output\pdf") -Destination $staging

$selectedRuns = [ordered]@{
    Load = "Load-20260903190225"
    Stress = "Stress-20260903191214"
    Spike = "Spike-20260903192044"
    Soak = "Soak-20260903192326"
}
$packagedResults = Join-Path $staging "results"
New-Item -ItemType Directory -Force -Path $packagedResults | Out-Null
foreach ($scenario in $selectedRuns.Keys) {
    $source = Join-Path $root ("results\" + $selectedRuns[$scenario])
    $destination = Join-Path $packagedResults $scenario
    Copy-Item -Recurse -Force -LiteralPath $source -Destination $destination
}

Set-Content -Encoding UTF8 -LiteralPath (Join-Path $staging "links.md") -Value "# Submission Links`n`n- Public repository: $GitHubUrl`n- Unlisted demo video: $VideoUrl`n"

if (Test-Path -LiteralPath $zip) { Remove-Item -Force -LiteralPath $zip }
Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zip -CompressionLevel Optimal
Write-Output "Created $zip"

