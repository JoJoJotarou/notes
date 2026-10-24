# Noah 的编程笔记

基于 [Quartz v4](https://quartz.jzhao.xyz/) 的数字花园，发布在 👉 **https://jojojotarou.github.io/notes/**

- 笔记全部在 [`content/`](content/) 目录：`swift/`（Swift / SwiftUI / macOS 开发）、`inbox/`（未分类）、`meta/`（站点说明）
- 写作约定（frontmatter、命名、双链、图片位置）见 [`content/meta/笔记规范.md`](content/meta/笔记规范.md)
- 站点配置：`quartz.config.ts`（标题、语言、baseUrl、插件）与 `quartz.layout.ts`（页面布局）
- 推送到 `master` 后由 GitHub Actions（`.github/workflows/deploy.yml`）自动构建并部署到 GitHub Pages

## 本地预览

需要 Node.js 22+：

```bash
npm ci
npx quartz build --serve   # 打开 http://localhost:8080
```

## 旧内容

2022 年的旧笔记（VitePress 站点、Java / Spring / 数据库笔记以及 PicGo 图床 `img/`）完整保留在 [`archive-2022`](https://github.com/JoJoJotarou/notes/tree/archive-2022) 分支。
