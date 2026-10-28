$ErrorActionPreference = 'Stop'
$EpisodeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $EpisodeRoot))
$ZipName = 'TreeHundredYear-EP01-35段图片直接归位覆盖包.zip'
$Zip = Join-Path $EpisodeRoot $ZipName
if (!(Test-Path -LiteralPath $Zip)) {
    $DownloadZip = Join-Path (Join-Path $HOME 'Downloads') $ZipName
    if (Test-Path -LiteralPath $DownloadZip) { $Zip = $DownloadZip }
}
if (!(Test-Path -LiteralPath $Zip)) {
    throw "缺少真正的第一集场景参考图归位包：$ZipName。请将它放到本集文件夹或 Windows Downloads。严禁使用旧15KB图片占位包冒充高清正式素材。"
}
Add-Type -AssemblyName System.Drawing
# The package is repo-root-relative; do not extract to the episode directory twice.
Expand-Archive -LiteralPath $Zip -DestinationPath $RepoRoot -Force
$Shots = @(
    Get-ChildItem -LiteralPath $EpisodeRoot -Directory | Where-Object {
        Test-Path -LiteralPath (Join-Path $_.FullName '提示词.txt')
    }
)
if ($Shots.Count -ne 35) { throw "需要35段提示词，发现 $($Shots.Count) 段。" }
$H3Total = 0; $H3Count = 0; $RefsCount = 0; $Bad = @()
foreach ($Shot in $Shots) {
    $Refs = @(Get-ChildItem -LiteralPath $Shot.FullName -File -Filter '场景参考_*.jpg')
    if ($Refs.Count -eq 0) { $Bad += "$($Shot.Name): 场景参考图缺失"; continue }
    $RefsCount += $Refs.Count
    foreach ($Ref in $Refs) {
        try {
            $Im = [System.Drawing.Image]::FromFile($Ref.FullName)
            try {
                if ($Im.Width -lt 720 -or $Im.Height -lt 1280) {
                    $Bad += "$($Shot.Name): $($Ref.Name) 低于720x1280，实际 $($Im.Width)x$($Im.Height)"
                }
            } finally { $Im.Dispose() }
        } catch { $Bad += "$($Shot.Name): 图像无法读取 $($Ref.Name)" }
    }
    $Kids = @(Get-ChildItem -LiteralPath $Shot.FullName -File -Filter 'H3_*.txt')
    foreach ($Kid in $Kids) {
        if ($Kid.Name -match '_([0-9]+)秒\.txt$') {
            $Time = [int]$Matches[1]
            if ($Time -lt 3 -or $Time -gt 5) { $Bad += "$($Shot.Name): 超出3-5秒的节点 $($Kid.Name)" }
            $H3Total += $Time; $H3Count++
        } else { $Bad += "无法解析H3节点时长：$($Kid.Name)" }
    }
}
if ($RefsCount -ne 58) { $Bad += "应该有58份分段场景图副本，目前$RefsCount份" }
if ($H3Count -ne 80 -or $H3Total -ne 335) { $Bad += "应有80个H3子镜头335秒，实际$H3Count个、$H3Total秒" }
if ($Bad.Count -gt 0) {
    $Bad | ForEach-Object { Write-Host "[FAIL] $_" -ForegroundColor Red }
    throw "第一集35段参考图及H3生成内容检查失败，请根据上方原因修复。"
}
Write-Host 'PASS: 第01集35个分段的真实图像文件均存在且可读取。' -ForegroundColor Green
Write-Host 'PASS: 58份场景图片副本已归位。'
Write-Host 'PASS: 80份H3 3-5秒子提示词、共335秒。'
Write-Host '现在可进入各个分段直接使用提示词和参考图进行H3生成。'
Write-Host '说明：这些为H3构图参考JPG，并非真正4K 16bit PBR贴图、8K 32bit EXR HDRI。'
