# Elasticsearch Web UI

一些不错的、免费的 Elasticsearch Web UI 。

## Elasticsearch Head

[Elasticsearch Head](https://chrome.google.com/webstore/detail/multi-elasticsearch-head/cpmmilfkofbeimbmgiclohpodggeheim/related?hl=zh-CN) 是 一个 chrome 插件，可以更好的查看 ES 集群分片、副本的分布信息以及健康度。

## dejave

dejave 一个具有现代 UI 的 ES 查询工具，还支持导入，开源地址：<https://github.com/appbaseio/dejavu/> 。

```bash
docker run -n dejavu --net elastic -p 1358:1358 -d appbaseio/dejavu:3.6.0
```

配置 ES 允许跨域：

```yml
http.port: 9200
http.cors.allow-origin: http://${hostname}:1358
http.cors.enabled: true
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization
http.cors.allow-credentials: true
```

::: tip

`http.cors.allow-origin` 为 dejave 实际请求地址，例如通过 `http://dev01.mshome.net:1358` 访问 dejave 那么就填写该值。

:::
