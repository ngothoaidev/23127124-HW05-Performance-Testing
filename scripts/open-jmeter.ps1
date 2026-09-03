$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$javaHome = (Get-ChildItem -LiteralPath (Join-Path $root ".tools\java") -Directory | Select-Object -First 1).FullName
$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"
$jmeter = Join-Path $root ".tools\apache-jmeter-5.6.3\bin\jmeter.bat"
if (-not $javaHome) { throw "Portable Java was not found under .tools\java." }
if (-not (Test-Path -LiteralPath $jmeter)) { throw "JMeter launcher was not found: $jmeter" }

# Keep a console open so startup errors remain visible instead of disappearing silently.
$command = 'call "{0}"' -f $jmeter
Start-Process -FilePath $env:ComSpec -ArgumentList "/k", $command -WorkingDirectory $root -WindowStyle Normal
