$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "output\pdf"
$tempDir = Join-Path $root "tmp\pdfs"
$edgeProfileDir = Join-Path $root ".runtime\edge-pdf"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

New-Item -ItemType Directory -Force -Path $outputDir, $tempDir, $edgeProfileDir | Out-Null

$css = @"
@page { size: A4; margin: 17mm 16mm 18mm 16mm; }
html { font-family: "Segoe UI", Arial, sans-serif; color: #172033; }
body { font-size: 10.5pt; line-height: 1.48; }
h1 { color: #12355b; font-size: 24pt; line-height: 1.15; margin: 0 0 16px; }
h2 { color: #174f7a; font-size: 16pt; margin: 22px 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
h3 { color: #25607f; font-size: 12.5pt; margin: 16px 0 6px; }
p { margin: 6px 0 10px; }
ul, ol { margin: 6px 0 10px 22px; }
li { margin: 3px 0; }
table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 8.7pt; page-break-inside: avoid; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th { background: #e8f1f8; color: #12355b; text-align: left; font-weight: 700; }
th, td { border: 1px solid #b8c6d1; padding: 5px 6px; vertical-align: top; }
code { background: #eef2f7; padding: 1px 3px; border-radius: 3px; }
pre { background: #f6f8fa; border: 1px solid #d5dde5; padding: 10px; white-space: pre-wrap; page-break-inside: avoid; }
blockquote { border-left: 4px solid #4f86a8; margin: 12px 0; padding: 4px 12px; color: #425466; background: #f7fafc; }
img { max-width: 100%; height: auto; page-break-inside: avoid; }
a { color: #155eaa; text-decoration: none; }
"@

$documents = @(
    @{ Source = "report\main-report.md"; Name = "23127124_HW05_AI_Performance_Report" },
    @{ Source = "ai-audit\AI_AUDIT.md"; Name = "23127124_AI_Audit_Report" },
    @{ Source = "ai-audit\AI_CRITIQUE.md"; Name = "23127124_AI_Critique" }
)

foreach ($document in $documents) {
    $sourcePath = Join-Path $root $document.Source
    $markdown = Get-Content -Raw -LiteralPath $sourcePath
    $body = (ConvertFrom-Markdown -InputObject $markdown).Html
    if ($document.Source -eq "report\main-report.md") {
        $body = $body.Replace('src="assets/', 'src="../../report/assets/')
    }
    $html = "<!doctype html><html><head><meta charset=`"utf-8`"><style>$css</style></head><body>$body</body></html>"
    $htmlPath = Join-Path $tempDir ($document.Name + ".html")
    $pdfPath = Join-Path $outputDir ($document.Name + ".pdf")
    Set-Content -Encoding UTF8 -LiteralPath $htmlPath -Value $html
    $fileUrl = ([uri]$htmlPath).AbsoluteUri
    if (Test-Path -LiteralPath $pdfPath) { Remove-Item -Force -LiteralPath $pdfPath }
    & $edge --headless=new --disable-gpu --hide-scrollbars --no-pdf-header-footer "--user-data-dir=$edgeProfileDir" "--print-to-pdf=$pdfPath" $fileUrl | Out-Null
    for ($attempt = 0; $attempt -lt 40 -and -not (Test-Path -LiteralPath $pdfPath); $attempt++) {
        Start-Sleep -Milliseconds 250
    }
    if (-not (Test-Path -LiteralPath $pdfPath)) { throw "PDF was not generated: $pdfPath" }
}

Get-ChildItem -LiteralPath $outputDir -Filter "*.pdf" | Select-Object Name, Length
