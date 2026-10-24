# Noah 的编程笔记

基于 [Quartz 5](https://quartz.jzhao.xyz/)（v5.0.0）的数字花园，发布在 👉 **https://jojojotarou.github.io/notes/**

- 笔记全部在 [`content/`](content/) 目录：`swift/`（Swift / SwiftUI / macOS 开发）、`inbox/`（未分类）、`meta/`（站点说明）
- 写作约定（frontmatter、命名、双链、图片位置）见 [`content/meta/笔记规范.md`](content/meta/笔记规范.md)
- 站点配置：`quartz.config.yaml`（标题、语言、baseUrl、字体、插件及其布局位置）；插件来自 npm 上的 `@quartz-community/*`，版本由 `package-lock.json` 锁定；`quartz.config.default.yaml` 是 Quartz 自带的默认配置，不要改
- 部署：推送到 `master` 即由 GitHub Actions（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，Quartz 5 官方工作流）自动构建并发布到 GitHub Pages。人和 AI 都走同一个流程：改 `content/` → 提交 → 推送 `master`，无需手动构建或发布；进度见仓库的 Actions 页面

## 本地预览

需要 Node.js 22+：

```bash
npm ci
npx quartz plugin install --from-config
npx quartz build --serve   # 打开 http://localhost:8080
```

## 旧内容

2022 年的旧笔记（VitePress 站点、Java / Spring / 数据库笔记以及 PicGo 图床 `img/`）完整保留在 [`archive-2022`](https://github.com/JoJoJotarou/notes/tree/archive-2022) 分支。
