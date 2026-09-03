$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$log = git -C $root log --date=iso --pretty=format:"%h`t%ad`t%an <%ae>`t%s"
if ($LASTEXITCODE -ne 0) { throw "Git log could not be generated." }
Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root "git-commit-log.txt") -Value $log
Write-Output "Created git-commit-log.txt"

