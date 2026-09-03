$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$javaHome = (Get-ChildItem -LiteralPath (Join-Path $root ".tools\java") -Directory | Select-Object -First 1).FullName
$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"
$jmeter = Join-Path $root ".tools\apache-jmeter-5.6.3\bin\jmeterw.cmd"
Start-Process -FilePath $jmeter -WorkingDirectory $root -WindowStyle Normal

