# kibana

<https://www.elastic.co/guide/en/kibana/index.html>

## 安装

### 配置 kibana

`vim /data/docker/kib01/config/kibana.yml` 创建 kibana 配置文件，并添加如下内容：

```bash
# 简单配置 for dev

elasticsearch.hosts: [ "http://c8b2d26d07c7:9200" ] # 同一集群上 ES 例的查询 URL，默认 ["http://localhost:9200"]

server.name: kib01   # kibana 服务名称
server.port: 5601    # kibana 服务名称
server.host: 0.0.0.0 # kibana 服务监听IP，默认 localhost

i18n.locale: zh-CN   # kibana web ui 语言
```

[更多 Kibana 配置项 ⤴️](https://www.elastic.co/guide/en/kibana/8.3/settings.html)

### 启动容器

```bash
docker run --name kib01 \
--net elastic \
-p 5601:5601 \
-v /data/docker/kib01/config/kibana.yml:/usr/share/kibana/config/kibana.yml \
-v /data/docker/kib01/data:/usr/share/kibana/data \
-d kibana:8.3.3
```
