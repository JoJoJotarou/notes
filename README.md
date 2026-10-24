# Noah 的编程笔记

基于 [Quartz v4](https://quartz.jzhao.xyz/) 的数字花园，发布在 👉 **https://jojojotarou.github.io/notes/**

- 笔记全部在 [`content/`](content/) 目录：`swift/`（Swift / SwiftUI / macOS 开发）、`inbox/`（未分类）、`meta/`（站点说明）
- 写作约定（frontmatter、命名、双链、图片位置）见 [`content/meta/笔记规范.md`](content/meta/笔记规范.md)
- 站点配置：`quartz.config.ts`（标题、语言、baseUrl、插件）与 `quartz.layout.ts`（页面布局）
- 部署：GitHub Pages 目前从 `gh-pages` 分支发布，用 `bash scripts/publish-gh-pages.sh` 构建并推送
- 自动部署（待启用）：`scripts/deploy.yml` 是 Quartz 官方的 GitHub Actions 工作流（已改为 master 分支）。把它移动到 `.github/workflows/deploy.yml` 并推送（需要有 `workflow` 权限的账号/令牌，或直接在 GitHub 网页上新建该文件），再到 Settings → Pages 把 Source 改为 “GitHub Actions”，之后每次推送 master 都会自动发布

## 本地预览

需要 Node.js 22+：

```bash
npm ci
npx quartz build --serve   # 打开 http://localhost:8080
```

## 旧内容

2022 年的旧笔记（VitePress 站点、Java / Spring / 数据库笔记以及 PicGo 图床 `img/`）完整保留在 [`archive-2022`](https://github.com/JoJoJotarou/notes/tree/archive-2022) 分支。
