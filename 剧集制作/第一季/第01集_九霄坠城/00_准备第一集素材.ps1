$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
# 优先使用用户下载的完整版35段参考图片包，若找不到则回落到仓库内置轻量代理图片。
# 本包用到的JPG属于构图参考，不能当作原生4K或真正PBR通道。
$PremiumName = "TreeHundredYear-EP01-H3-参考图片按段归位包-V1.0.zip"
$PremiumZip = Join-Path $Root $PremiumName
if (!(Test-Path -LiteralPath $PremiumZip)) {
    $DownloadZip = Join-Path (Join-Path $HOME "Downloads") $PremiumName
    if (Test-Path -LiteralPath $DownloadZip) { $PremiumZip = $DownloadZip }
}
if (Test-Path -LiteralPath $PremiumZip) {
    $TempPremium = Join-Path $env:TEMP "TreeHundredYear_EP01_FullRefs"
    if (Test-Path -LiteralPath $TempPremium) { Remove-Item -LiteralPath $TempPremium -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $TempPremium | Out-Null
    Expand-Archive -LiteralPath $PremiumZip -DestinationPath $TempPremium -Force
    $SrcRoot = Get-ChildItem -LiteralPath $TempPremium -Directory -Filter "参考图_自动归位素材" -Recurse | Select-Object -First 1
    if (!$SrcRoot) { throw "完整参考包内找不到'参考图_自动归位素材'目录" }
    $ShotDirs = @(Get-ChildItem -LiteralPath $SrcRoot.FullName -Directory)
    if ($ShotDirs.Count -ne 35) { throw "完整参考包应包含35个分段素材目录，实际为$($ShotDirs.Count)" }
    # 先全部校验，避免复制一半才发现缺文件。
    foreach ($Shot in $ShotDirs) {
        $Dest = Join-Path $Root $Shot.Name
        if (!(Test-Path -LiteralPath (Join-Path $Dest "提示词.txt"))) { throw "分段提示词缺失: $($Shot.Name)" }
        $Refs = @(Get-ChildItem -LiteralPath $Shot.FullName -File -Filter "*.jpg")
        if ($Refs.Count -eq 0) { throw "场景图片缺失: $($Shot.Name)" }
    }
    $Copied = 0
    foreach ($Shot in $ShotDirs) {
        $Dest = Join-Path $Root $Shot.Name
        Get-ChildItem -LiteralPath $Dest -File -Filter "场景参考_*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force
        foreach ($Asset in @(Get-ChildItem -LiteralPath $Shot.FullName -File -Filter "*.jpg")) {
            $Target = Join-Path $Dest ("场景参考_" + $Asset.Name)
            Copy-Item -LiteralPath $Asset.FullName -Destination $Target -Force
            $Copied++
        }
    }
    if ($Copied -ne 58) { throw "完整参考包期望归位58份场景引用，实际为$Copied" }
    Write-Host "第01集参考素材包归位成功：35段，58份JPG引用"
    Write-Host "提示词及人物PNG来自已克隆仓库。开始H3生成前请参看80子片段时长表。"
    Write-Host "重要：本批JPG仍然不是原生4K、16bit PBR贴图或8K EXR HDRI。"
    return
}

$Zip = Join-Path $Root "00_参考资产包_H3.zip"
$Temp = Join-Path $env:TEMP "TreeHundredYear_EP01_H3_REFS"

if (!(Test-Path -LiteralPath $Zip)) { throw "缺少参考资产包: $Zip" }
if (Test-Path -LiteralPath $Temp) { Remove-Item -LiteralPath $Temp -Recurse -Force }
New-Item -ItemType Directory -Path $Temp -Force | Out-Null
Expand-Archive -LiteralPath $Zip -DestinationPath $Temp -Force

# 兼容资产包中TA-01轻量参考图的内部文件名，统一成本集提示词使用的正式引用名
$Ta01Packed = Join-Path $Temp "TA-01_九层星渊塔_首次亮相_正式参考_H3.jpg"
$Ta01Canonical = Join-Path $Temp "TA-01_九层星渊塔_首次亮相_正式参考.jpg"
if ((Test-Path -LiteralPath $Ta01Packed) -and !(Test-Path -LiteralPath $Ta01Canonical)) {
    Copy-Item -LiteralPath $Ta01Packed -Destination $Ta01Canonical -Force
}

$Map = [ordered]@{
"01_整塔首次亮相" = @("TA-01_九层星渊塔_首次亮相_正式参考.jpg")
"01A_九重生死关" = @("TA-01_九层星渊塔_首次亮相_正式参考.jpg","TA-02_塔顶星环近景.jpg")
"01B_古卷禁语" = @("TA-02_塔腰蓝金环带.jpg","TA-02_塔顶星环近景.jpg")
"02_星环突然停转" = @("TA-02_星环停转瞬间.jpg")
"03_照夜城开始离地" = @("CY-01_照夜城升空.jpg")
"04_苏晚踏瓦救桥" = @("CY-02_街区断桥城门.jpg")
"05_苏晚初登身份卡" = @("CY-02_街区断桥城门.jpg")
"06_苏晚冷幽默再出手" = @("CY-02_街区断桥城门.jpg")
"07_周辰劈开承力栓" = @("CY-02_街区断桥城门.jpg")
"08_周辰受伤与姓名卡" = @("CY-02_街区断桥城门.jpg")
"09_他看穿巨塔牵引" = @("TA-02_塔腰蓝金环带.jpg","TA-01_九层星渊塔_首次亮相_正式参考.jpg")
"10_周辰斩断牵引" = @("CY-02_街区断桥城门.jpg")
"11_苏晚剑指周辰" = @("CY-02_街区断桥城门.jpg")
"12_锁链被塔吞没" = @("TA-02_塔腰蓝金环带.jpg","CY-02_街区断桥城门.jpg")
"13_司塔者机械醒转" = @("TA-03_司塔者.jpg")
"14_司塔者首次介绍" = @("TA-03_司塔者.jpg")
"15_双命判决" = @("TA-03_司塔者.jpg")
"16_双人拒绝生门规则" = @("TA-03_司塔者.jpg")
"17_万丈栈桥移动" = @("CY-01_照夜城升空.jpg")
"18_苏晚撑断桥周辰反扭齿" = @("CY-02_街区断桥城门.jpg")
"19_两人不按死亡规则" = @("CY-02_街区断桥城门.jpg")
"20_九井机关揭示" = @("CY-03_九口星井机关.jpg")
"21_主井反向破解计划" = @("CY-03_九口星井机关.jpg")
"22_双人分工" = @("CY-03_九口星井机关.jpg")
"23_苏晚以剑逆灌主井" = @("CY-03_九口星井机关.jpg")
"24_周辰桥根拆机关" = @("CY-03_九口星井机关.jpg","TA-03_司塔者.jpg")
"25_主井反噬与力学导轨" = @("CY-03_九口星井机关.jpg")
"26_照夜城停止上升" = @("CY-01_照夜城全景.jpg","TA-01_九层星渊塔_首次亮相_正式参考.jpg")
"27_双主角从井缘脱险" = @("CY-03_九口星井机关.jpg")
"28_古城代价与塔门浮现" = @("CY-01_照夜城全景.jpg","TA-04_塔脚玄门入塔巨阶.jpg")
"29_司塔者宣布闯关未终" = @("TA-03_司塔者.jpg","TA-04_塔脚玄门入塔巨阶.jpg")
"30_苏晚周辰选择入塔" = @("TA-04_塔脚玄门入塔巨阶.jpg")
"31_第一关逆重天阶首秀" = @("G1-01_逆重天阶入口.jpg")
"32_死亡碑文写下双命" = @("G1-02_逆重天阶重力错位.jpg")
"33_两侧重力合拢终钩子" = @("G1-02_逆重天阶重力错位.jpg")
}

foreach ($Folder in $Map.Keys) {
    $Dest = Join-Path $Root $Folder
    if (!(Test-Path -LiteralPath $Dest)) { throw "缺少分段目录: $Folder" }
    $old = Get-ChildItem -LiteralPath $Dest -File -Filter "场景参考_*.jpg" -ErrorAction SilentlyContinue
    if ($old) { $old | Remove-Item -Force }
    foreach ($Name in $Map[$Folder]) {
        $Src = Join-Path $Temp $Name
        if (!(Test-Path -LiteralPath $Src)) { throw "资产包缺少: $Name" }
        $Target = Join-Path $Dest ("场景参考_" + $Name)
        Copy-Item -LiteralPath $Src -Destination $Target -Force
    }
}

$bad = @()
foreach ($Folder in $Map.Keys) {
    $Dest = Join-Path $Root $Folder
    $Prompt = Join-Path $Dest "提示词.txt"
    $Refs = @(Get-ChildItem -LiteralPath $Dest -File -Filter "场景参考_*.jpg" -ErrorAction SilentlyContinue)
    if (!(Test-Path -LiteralPath $Prompt) -or $Refs.Count -lt 1) { $bad += $Folder }
}
if ($bad.Count -gt 0) { throw ("以下分段未准备完整: " + ($bad -join ", ")) }

Write-Host ""
Write-Host "=============================================="
Write-Host "第一季第01集《九霄坠城》H3参考素材准备完成"
Write-Host "35个分段均已具备：提示词.txt + 场景参考图"
Write-Host "人物出现的分段同时保留周辰/苏晚正式人物PNG"
Write-Host "现在可逐段打开文件夹，直接挂载素材并按提示词生成"
Write-Host "=============================================="
