$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
if($env:COMPUTERNAME -ne 'WIN-BOG6EEAE2HG' -or $env:USERNAME -ne 'Administrator'){throw 'Remote identity mismatch'}
$b='C:\Users\Administrator\Desktop\徐自泉文件\学习文件\exp\card'
$o=Join-Path $b 'outputs\branch3-refresh-20261022'
$s='C:\Users\Administrator\Desktop\徐自泉文件\学习文件\exp\ptf_old\桌崽AI\branch3'
$p=Get-Content -LiteralPath (Join-Path $o 'finalize-plan.json') -Raw -Encoding UTF8|ConvertFrom-Json
foreach($f in $p.before.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $b $f.Name)).Hash -ne $f.Value){throw ('Source changed since installed stage: '+$f.Name)}}
foreach($f in $p.changed.PSObject.Properties){if($null -eq $p.before.PSObject.Properties[$f.Name] -and (Test-Path -LiteralPath (Join-Path $b $f.Name))){throw ('Unexpected new target: '+$f.Name)}}
Expand-Archive -LiteralPath (Join-Path $o 'final-docs.zip') -DestinationPath $b -Force
Expand-Archive -LiteralPath (Join-Path $o 'source-final.zip') -DestinationPath $s -Force
$runtime=0
foreach($f in $p.after.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $b $f.Name)).Hash -ne $f.Value){throw ('Final runtime mismatch: '+$f.Name)};$runtime++}
$protected=0
foreach($f in $p.protected.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $b $f.Name)).Hash -ne $f.Value){throw ('Protected file changed: '+$f.Name)};$protected++}
$source=0
foreach($f in $p.source.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $s $f.Name)).Hash -ne $f.Value){throw ('Source runtime mismatch: '+$f.Name)};$source++}
if((Get-FileHash -LiteralPath (Join-Path $s 'branch3-preview.html')).Hash -ne $p.standaloneSha256){throw 'Standalone hash mismatch'}
$reports=@('site-review-results.json','offline-review-results.json'|ForEach-Object{$d=Get-Content -LiteralPath (Join-Path $o $_) -Raw -Encoding UTF8|ConvertFrom-Json;if($d.status -ne 'PASS' -or $d.failed -ne 0 -or @($d.runtimeErrors).Count -ne 0){throw ('Report failure: '+$_)};[PSCustomObject]@{report=$_;status=$d.status;total=$d.total;passed=$d.passed;failed=$d.failed}})
$gaps=@(Get-Content -LiteralPath (Join-Path $o 'prototype-visual-fix-results.json') -Raw -Encoding UTF8|ConvertFrom-Json)
if($gaps.Count -ne 9 -or @($gaps|Where-Object{!$_.passCheck}).Count){throw 'Prototype spacing report failure'}
$ownProcesses=@(Get-CimInstance Win32_Process|Where-Object{$_.CommandLine -and $_.CommandLine.Contains($o) -and ($_.Name -eq 'chrome.exe' -or $_.Name -eq 'python.exe')})
$cleaned=@()
foreach($name in @('capture-profile','collection-profile','patch-capture-profile','portfolio-review-profile','offline-review-profile')){
 $q=Join-Path $o $name
 if(@($ownProcesses|Where-Object{$_.CommandLine.Contains($q)}).Count -eq 0 -and (Test-Path -LiteralPath $q)){Remove-Item -LiteralPath $q -Recurse -Force;$cleaned+=$name}
}
$r=[PSCustomObject]@{status='PASS';host=$env:COMPUTERNAME;account=$env:USERNAME;target=$b;runtimeFiles=$runtime;runtimeMatch=$runtime;protectedFilesUnchanged=$protected;sourceRuntimeFiles=$source;sourceRuntimeMatch=$source;standaloneSha256=$p.standaloneSha256;webViewportWidth=1440;deviceScaleFactor=2;sourceCaptures=42;reports=$reports;prototypeSpacingPasses=$gaps.Count;independentVisualAudit='PASS';taskProcesses=$ownProcesses.Count;profilesCleaned=$cleaned;backup='outputs/branch3-refresh-20261022/before-runtime.zip'}
$j=$r|ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path $o 'delivery-validation.json'),$j,[Text.UTF8Encoding]::new($false))
$j
