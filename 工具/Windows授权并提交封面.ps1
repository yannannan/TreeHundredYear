#requires -Version 5.1
<#
.SYNOPSIS
  Windows 官方 GitHub 浏览器登录、上传原始封面 PNG、验证推送结果。
.DESCRIPTION
  不要求将 GitHub Token、密码或设备验证码发给任何人。登录通过 gh auth login --web
  在用户自己的电脑/浏览器完成。仅上传真实 PNG 原图，不转码、缩小或重生成。
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ".\Windows授权并提交封面.ps1" -ImagePath "C:\Users\me\Downloads\epic_cinematic_fantasy_scene_with_a_widescreen_hi.png"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$ImagePath,
    [string]$RepoPath = (Join-Path $env:USERPROFILE "TreeHundredYear")
)
$ErrorActionPreference = 'Stop'
function RunGit([string[]]$Arg) {
    & git -C $RepoPath @Arg
    if ($LASTEXITCODE -ne 0) { throw "Git 命令失败：git $($Arg -join ' ')" }
}
try {
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        throw '找不到 git。请先安装 Git for Windows。'
    }
    if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
        throw '找不到 GitHub CLI。请先运行 winget install --id GitHub.cli -e，再重新打开 PowerShell 运行。'
    }

    $image = (Resolve-Path -LiteralPath $ImagePath).Path
    if ([IO.Path]::GetExtension($image).ToLowerInvariant() -ne '.png') {
        throw '必须使用原始PNG文件，不能使用JPEG缩略图。'
    }
    $bytes = [IO.File]::ReadAllBytes($image)
    $pngSignature = [byte[]](137,80,78,71,13,10,26,10)
    if ($bytes.Length -lt 8) { throw '输入文件不是有效PNG。' }
    for ($i = 0; $i -lt 8; $i++) {
        if ($bytes[$i] -ne $pngSignature[$i]) { throw 'PNG文件头校验未通过。' }
    }

    # gh 在当前 Windows 账户的浏览器中启动 OAuth 授权；请不要在聊天中粘贴凭据。
    & gh auth status --hostname github.com 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host '打开 GitHub 官方网页登录授权...' -ForegroundColor Cyan
        & gh auth login --hostname github.com --git-protocol https --web
        if ($LASTEXITCODE -ne 0) { throw 'GitHub 官方登录未完成。' }
    }
    & gh auth setup-git
    if ($LASTEXITCODE -ne 0) { throw 'GitHub Git 认证配置失败。' }

    if (!(Test-Path -LiteralPath (Join-Path $RepoPath '.git'))) {
        if (Test-Path -LiteralPath $RepoPath) {
            $entries = @(Get-ChildItem -LiteralPath $RepoPath -Force)
            if ($entries.Count -gt 0) { throw "目标目录已存在且非空：$RepoPath。请指定其他 RepoPath。" }
        }
        Write-Host '克隆第一季仓库...' -ForegroundColor Cyan
        & gh repo clone yannannan/TreeHundredYear $RepoPath -- --branch main
        if ($LASTEXITCODE -ne 0) { throw '克隆仓库失败，请确认对该仓库有写入权限。' }
    }
    $remote = (& git -C $RepoPath remote get-url origin).Trim()
    if ($LASTEXITCODE -ne 0 -or $remote -notmatch 'yannannan/TreeHundredYear(\.git)?$') {
        throw "本地仓库的 origin 不属于指定项目，停止操作：$remote"
    }
    $branch = (& git -C $RepoPath branch --show-current).Trim()
    if ($branch -ne 'main') { throw "当前本地分支是 $branch，请先切换到 main。" }
    RunGit -Arg @('pull','--ff-only','origin','main')

    $relativePath = '视觉设计/封面海报/第一季封面_历史参考版_原图.png'
    $target = Join-Path $RepoPath ($relativePath.Replace('/',[IO.Path]::DirectorySeparatorChar))
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    $originalSha256 = (Get-FileHash -LiteralPath $image -Algorithm SHA256).Hash
    if (Test-Path -LiteralPath $target) {
        $existingSha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
        if ($originalSha256 -ne $existingSha256) {
            throw "仓库中已有不同版本的封面，不自动覆盖：$relativePath"
        }
    } else {
        Copy-Item -LiteralPath $image -Destination $target
    }
    $uploadedSha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    if ($originalSha256 -ne $uploadedSha256) { throw 'SHA256校验失败：封面字节不一致。' }

    RunGit -Arg @('add','--',$relativePath)
    & git -C $RepoPath diff --cached --quiet -- $relativePath
    if ($LASTEXITCODE -eq 1) {
        RunGit -Arg @('commit','-m','视觉资产：归档第一季历史封面原始高清PNG')
        RunGit -Arg @('push','origin','main')
    } elseif ($LASTEXITCODE -ne 0) {
        throw 'Git暂存区检查失败。'
    }
    $sha = (& git -C $RepoPath rev-parse HEAD).Trim()
    $tracked = @(& git -C $RepoPath ls-tree -r --name-only HEAD -- $relativePath)
    if ($LASTEXITCODE -ne 0 -or $tracked.Count -eq 0) { throw '提交后未在HEAD中找到封面文件。' }
    & git -C $RepoPath ls-remote --exit-code origin "refs/heads/main" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw '无法验证GitHub远端main分支。' }
    Write-Host '封面推送成功或远端已存在相同文件。' -ForegroundColor Green
    Write-Host "Commit: $sha"
    Write-Host "File: $relativePath"
    Write-Host "SHA256: $uploadedSha256"
    Write-Host "GitHub: https://github.com/yannannan/TreeHundredYear/blob/main/视觉设计/封面海报/第一季封面_历史参考版_原图.png"
} catch {
    Write-Error $_
    exit 1
}
