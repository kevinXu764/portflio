$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$b='C:\Users\Administrator\Desktop\徐自泉文件\学习文件\exp\card'
$o=Join-Path $b 'outputs\branch3-refresh-20261022'
$p=Get-Content -LiteralPath (Join-Path $o 'install-plan.json') -Raw -Encoding UTF8|ConvertFrom-Json
foreach($f in $p.before.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $b $f.Name)).Hash -ne $f.Value){throw ('Source changed since backup: '+$f.Name)}}
foreach($f in $p.after.PSObject.Properties){if($null -eq $p.before.PSObject.Properties[$f.Name] -and (Test-Path -LiteralPath (Join-Path $b $f.Name))){throw ('Unexpected existing target: '+$f.Name)}}
Expand-Archive -LiteralPath (Join-Path $o 'update-runtime.zip') -DestinationPath $b -Force
$verified=0
foreach($f in $p.after.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $b $f.Name)).Hash -ne $f.Value){throw ('Installed hash mismatch: '+$f.Name)};$verified++}
$r=[PSCustomObject]@{host=$env:COMPUTERNAME;runtimeUpdated=$verified;backup='outputs/branch3-refresh-20261022/before-runtime.zip'}
$j=$r|ConvertTo-Json -Compress
[IO.File]::WriteAllText((Join-Path $o 'install-result.json'),$j,[Text.UTF8Encoding]::new($false));$j
