#requires -Version 5.1
<#
.SYNOPSIS
  将已下载的原始封面PNG提交到本项目 GitHub main 分支，保留原始字节，不压缩、不重新生成。
.DESCRIPTION
  本脚本只提交一个封面图，不会擅自修改其他素材。需运行机器能访问 github.com，且该 Git 仓库已具备提交推送权限。
  使用前先确保本地仓库工作目录存在、账号已配置可用的 GitHub 凭证（Git Credential Manager、SSH等）。
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\工具\一键提交封面原图.ps1 -ImagePath "D:\下载\epic_cinematic_fantasy_scene_with_a_widescreen_hi.png" -RepoPath "D:\UniverseStarWorkSpace\TreeHundredYear"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ImagePath,

  [Parameter(Mandatory = $true)]
  [string]$RepoPath
)
$ErrorActionPreference = 'Stop'
function Invoke-Git {
  param([string[]]$Arguments)
  & git -C $repo @Arguments
  if ($LASTEXITCODE -ne 0) { throw "git 命令失败，退出码 $LASTEXITCODE：$($Arguments -join ' ')" }
}
try {
  $repo = (Resolve-Path -LiteralPath $RepoPath).Path
  $image = (Resolve-Path -LiteralPath $ImagePath).Path
  if ([IO.Path]::GetExtension($image).ToLowerInvariant() -ne '.png') {
    throw '仅接受原始 PNG。请勿使用预览 WebP/JPG 冒充封面原图。'
  }
  $isGit = (& git -C $repo rev-parse --is-inside-work-tree)
  if ($LASTEXITCODE -ne 0 -or $isGit.Trim() -ne 'true') {
    throw 'RepoPath 不是有效的 Git 工作区。'
  }
  $branch = (& git -C $repo branch --show-current).Trim()
  if ($branch -ne 'main') {
    throw "当前分支为 $branch。为避免写错分支，请先切换到 main 后重试。"
  }
  Write-Host '正在更新 main 分支...'
  Invoke-Git -Arguments @('pull', '--ff-only', 'origin', 'main')
  $relative = '视觉设计/封面海报/第一季封面_历史参考版_原图.png'
  $target = Join-Path $repo ($relative.Replace('/','\'))
  New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
  Copy-Item -LiteralPath $image -Destination $target -Force
  $srcHash = (Get-FileHash -LiteralPath $image -Algorithm SHA256).Hash
  $dstHash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
  if ($srcHash -ne $dstHash) { throw '校验不通过：目标图片与原始PNG的SHA-256不同。' }
  Invoke-Git -Arguments @('add', '--', $relative)
  & git -C $repo diff --cached --quiet -- $relative
  if ($LASTEXITCODE -eq 0) {
    Write-Host '图片与GitHub已有版本一致，无需重复提交。'
    exit 0
  }
  Write-Host '正在提交并推送原始PNG...'
  Invoke-Git -Arguments @('commit', '-m', '视觉素材：归档第一季历史参考封面原始PNG')
  Invoke-Git -Arguments @('push', 'origin', 'main')
  $sha = (& git -C $repo rev-parse HEAD).Trim()
  Write-Host "提交成功：$sha"
  Write-Host "源文件 SHA-256：$srcHash"
  Write-Host "仓库路径：$relative"
} catch {
  Write-Error $_
  exit 1
}
