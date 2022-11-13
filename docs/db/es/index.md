# Elasticsearch 分布式文档存储

`Elasticsearch Version 8.3.3`

- 分布式文档存储，存储已序列化为 JSON 文档的复杂数据结构
- Elasticsearch使用一种称为倒排索引的数据结构，该结构支持非常快速的全文搜索。倒排索引列出出现在任何文档中的每个唯一单词，并标识每个单词出现的所有文档。

## 安装

> 本文使用 docker 安装 Elasticsearch ，[更多安装查看官方文档 ⤴️](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)

[设置 JVM Heap 大小](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-options)，开发环境内存不够，可能会导致 ES 启动时直接退出 `ERROR: Elasticsearch exited unexpectedly`（生产环境建议默认，ES会根据节点的角色和总内存自动设置 JVM 堆大小），新建 `/data/docker/es01/config/jvm.options.d/jvm.options` 文件，添加如下内容：

```text
-Xms256m
-Xmx256m
```

可以使用如下命令直接添加 `jvm.options` 文件：

```bash
mkdir -p /data/docker/es01/config && mkdir -p /data/docker/es01/config/jvm.options.d && cd /data/docker/es01/config/jvm.options.d && echo -e "-Xms256m\n-Xmx256m"  > jvm.options
```

::: warning
`/data/docker` 目录权限是 777
:::

::: tip JVM options 文件应该放在什么位置 ?

- tar.gz or .zip: Add custom JVM options files to config/jvm.options.d/
- Debian or RPM: Add custom JVM options files to /etc/elasticsearch/jvm.options.d/
- Docker: Bind mount custom JVM options files into /usr/share/elasticsearch/config/jvm.options.d/

:::

新建 ES 配置文件 `/data/docker/es01/config/elasticsearch.yml` ，添加如下内容（[官方配置文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html#settings)）：

```yml
ingest.geoip.downloader.enabled: false # 忽略 geoip 数据库更新（测试时更新失败导致无法启动）
network.host: es01 # 集群中的名字
xpack.security.enabled: false # ES 8 安全级别更高需要TLS访问、已经密码认证，测试为了方便先关闭后面再说
cluster.initial_master_nodes: ["${HOSTNAME}"] # 替换系统变量
```

启动容器：

```bash
docker network create elastic

# 若需清除历史数据
rm -rf /data/docker/es/data/* && rm -rf /data/docker/es/logs/*

docker run \
--name es01 \
--net elastic \
-p 9200:9200 -p 9300:9300 \
-v /data/docker/es/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
-v /data/docker/es/config/jvm.options.d:/usr/share/elasticsearch/config/jvm.options.d \
-d elasticsearch:8.3.3

# 挂载更多
docker run \
--name es01 \
--net elastic \
-p 9200:9200 -p 9300:9300 \
-v /data/docker/es/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
-v /data/docker/es/config/jvm.options.d:/usr/share/elasticsearch/config/jvm.options.d \
-v /data/docker/es/data:/usr/share/elasticsearch/data \
-v /data/docker/es/logs:/usr/share/elasticsearch/logs \
-v /data/docker/es/plugins:/usr/share/elasticsearch/plugins \
-d elasticsearch:8.3.3

```

```bash
docker network create elastic

docker run \
-e ES_JAVA_OPTS="-Xms256m -Xmx256m" \
--name es01 \
--net elastic \
-p 9200:9200 -p 9300:9300 \
-d docker.elastic.co/elasticsearch/elasticsearch:8.3.3
```

其实 [ES 8.3 开始](https://github.com/elastic/elasticsearch/commit/1d4534f848feb396c00cee09fc1d0aef24a529a2) 已经将 `ES_JAVA_OPTS` 替换成了 `CLI_JAVA_OPTS` ，但是启动 docker `CLI_JAVA_OPTS` 不生效，而 `ES_JAVA_OPTS` 生效。

::: tip

若希望启动的 ES 实例不加入集群，请在 `docker run` 时添加 `-e "discovery.type=single-node"` 环境变量开启[单节点发现](https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks.html#single-node-discovery)。（测试环境没有任何 ES 实例加不加一样）

:::

### 安装常见问题

1. `ERROR: Elasticsearch exited unexpectedly`

    ES 默认会根据节点内存自动设置 JVM heap size 我遇到的是RAM不够了，通过设置 `ES_JAVA_OPTS="-Xms1g -Xmx1g"` 环境变量改变 ES 使用的内存最大最小值。[查看官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-heap-size)
    - Xms 和 Xmx 必须相同
    - 将 Xms 和 Xmx 设置为不超过总内存的 50%

2. `bootstrap check failure [1] of [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]`
    - 临时生效：

    ```bash
    # 查看 vm.max_map_count 的值，默认就是 65530
    sudo sysctl -a|grep vm.max_map_count

    # 设置 vm.max_map_count 的值
    sudo sysctl -w vm.max_map_count=262144
    ```

    - 永久生效：
    切换到 root 用户打开`/etc/sysctl.conf` 文件，添加 `vm.max_map_count=262144`，然后执行 `sysctl -p` 使其立即生效。

3. `exception during geoip databases update`

    ```yml
    # elasticsearch.yml 配置忽略 geoip 更新
    ingest.geoip.downloader.enabled: false
    ```

## 基本概念

索引（index）为文档（document）的优化集合，每个文档都是字段（field）的集合，字段是包含数据的键值对。

### Index

#### 配置 Index

索引级别（Index level）：

- static：只能在索引创建时或在关闭的索引上设置。
- dynamic：可以实时修改 index 配置。

[更多配置参数⤴️](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html)

## 索引块（Index blocks）

设置 索引读写等权限，例如可以通过如下请求设置 `index.blocks.write` 为 `true`：

```text
PUT /my-index-000001/_block/write
```

<https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-blocks.html#index-modules-blocks>

那么该索引无法新建 Document，尝试新建将返回如下异常 ：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "cluster_block_exception",
        "reason": "index [user] blocked by: [FORBIDDEN/8/index write (api)];"
      }
    ],
    "type": "cluster_block_exception",
    "reason": "index [user] blocked by: [FORBIDDEN/8/index write (api)];"
  },
  "status": 403
}
```

::: warning 如何删除 index block？

可以通过设置 index 属性来删除，请求如下：

```text
PUT /user/_settings
{
  "blocks.write": false
}
```

:::

## ES 8 安全特性相关

### 重置密码

启动检查：<https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks-xpack.html>

```bash
ubuntu@dev01:~$ docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic
WARNING: Owner of file [/usr/share/elasticsearch/config/users] used to be [root], but now is [elasticsearch]
WARNING: Owner of file [/usr/share/elasticsearch/config/users_roles] used to be [root], but now is [elasticsearch]
This tool will reset the password of the [elastic] user to an autogenerated value.
The password will be printed in the console.
Please confirm that you would like to continue [y/N]y


Password for the [elastic] user successfully reset.
New value: *lRRJO8jLZUf88erUehq
```

## 集群

<https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html>

## 插件

<https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-plugins.html>

## 投入生产

若要投入生产务必查阅[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/system-config.html#system-config)
