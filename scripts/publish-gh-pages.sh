#!/usr/bin/env bash
# 手动发布：本地构建 Quartz，并把 public/ 推送到 gh-pages 分支（GitHub Pages 当前从该分支发布）。
# 用法：在仓库根目录执行 `bash scripts/publish-gh-pages.sh`（需要 Node 22+，且已 npm ci）
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
SHA="$(git rev-parse --short HEAD)"
REMOTE="$(git remote get-url origin)"
npx quartz build
TMP="$(mktemp -d)"
cp -r public/. "$TMP"/
touch "$TMP/.nojekyll"
cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -qm "Deploy site built from master $SHA"
git push -f "$REMOTE" gh-pages
rm -rf "$TMP"
echo "已发布：https://jojojotarou.github.io/notes/"
