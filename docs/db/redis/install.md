---
title: Redis
---
# {{ $frontmatter.title }}

## 安装 docker

```bash
docker run \
--name redis1 --net elastic \
-p 6379:6379 \
-v /data/docker/redis/data:/data \
-v /data/docker/redis/config:/usr/local/etc/redis \
-d redis:7.0.4 \
redis-server /usr/local/etc/redis/redis.conf
```

## 安装（Debian/Ubuntu）

:::tip 确保已安装 `curl` 、 `gpg` 、 `lsb_release` 包

sudo apt install -y curl gpg lsb_release
:::

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update
sudo apt-get install redis
```

### 系统设置

- 添加 `vm.overcommit_memory = 1` 到 `/etc/sysctl.conf`，然后使用下面命令激活设置（或者直接重启机器也行）：

```bash
sysctl vm.overcommit_memory=1
```

- 关闭 Linux 内核特性“透明大页面”，避免影响 Redis 内存使用和延迟

```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

::: warning 灵魂拷问

- Linux `overcommit_memory` 是什么？

- Linux 内核特性“透明大页面”是什么？
:::

### Reids 设置

> Ensured that swap is enabled and that your swap file size is equal to amount of memory on your system.

- 开启 swap 交换空间，swap 文件的大小等于内存大小。如果 Linux 没有设置交换，并且您的 Redis 实例意外消耗了太多内存，Redis 可能会在内存不足时崩溃，或者 Linux 内核 OOM 杀手可以杀死 Redis 进程。启用交换后，您可以检测延迟峰值并对其采取行动。
- Redis 实例中设置显式的 `maxmemory` 选项限制，以确保在接近达到系统内存限制时它会报告错误而不是失败

查阅 `LATENCY DOCTOR` and `MEMORY DOCTOR` 命令以帮助进行故障排除。

- 守护进程
`daemonize no`

#### 复制 Replication

即主从复制，设定一个复制积压，达到阈值触发主从复制。

- 如果使用复制，即使禁用持久性，Redis 也会执行 RDB 保存。**如果主服务器上没有使用磁盘，请启用无盘复制（diskless replication）。**
- 如果您正在使用复制，请确保您的 master 启用了持久性，或者它不会在崩溃时自动重新启动。副本将尝试维护主副本的精确副本，因此如果主副本以空数据集重新启动，副本也将被擦除。

#### 安全

默认情况下，Redis 不需要任何身份验证并侦听所有网络接口。查看 [security page](https://redis.io/topics/security) 和 [quick start](https://redis.io/topics/quickstart) 获取信息

- 网络安全（Network security）：通过配置 `redis.config` 使 redis 服务器仅监听本地

```text
bind 127.0.0.1
```

- 保护模式（Protected mode）：

简单的说，从 3.2.0 版本开始，若你的 redis 没有配置 `bind` 信息,使用默认配置（即允许所有地址的请求）时，redis 只会正确回复来自 localhost 的请求，其他地址的请求都会提示异常信息。

**系统管理员仍然可以忽略 Redis 给出的错误并禁用保护模式或手动绑定所有接口。**

::: tip
开发环境中，设置如下方便访问：

```text
bind 0.0.0.0 # 允许所有地址的请求
protected-mode no # 关闭保护模式
```

:::

- 身份认证（Authentication ）：即需要密码来访问 redis。密码在 `redis.conf` 文件中以明文形式设置。

```text
requirepass yourStrongPassword
```

- TLS 加密：todo ...

## redis.conf

Redis 各个版本配置文件模板及说明：

- [redis.conf for Redis 7.0.](https://raw.githubusercontent.com/redis/redis/7.0/redis.conf)
- [redis.conf for Redis 6.2.](https://raw.githubusercontent.com/redis/redis/6.2/redis.conf)
- [redis.conf for Redis 6.0.](https://raw.githubusercontent.com/redis/redis/6.0/redis.conf)
- [redis.conf for Redis 5.0.](https://raw.githubusercontent.com/redis/redis/5.0/redis.conf)

### 命令行传递配置参数

```bash
./redis-server --port 6380 --replicaof 127.0.0.1 6379
```

### 在服务器运行时更​​改 Redis 配置

[`CONFIG SET`](https://redis.io/commands/config-set/) 和 [`CONFIG GET`](https://redis.io/commands/config-get/)

```bash
127.0.0.1:6379> CONFIG get port
1) "port"
2) "6379"
127.0.0.1:6379> CONFIG set port 6380
OK
127.0.0.1:6379> CONFIG get port
1) "port"
2) "6380"
```

- 修改 port 若客户端端口连接，则配置失效，不知道其他设置是否也是这样？
- `CONFIG SET` 对 redis.conf 文件没有影响，[`CONFIG REWRITE`](https://redis.io/commands/config-rewrite) 则可以修改 redis.conf

### 将 Redis 配置为缓存

将 Redis 用作缓存，其中每个键都会设置过期时间，则可以考虑使用以下配置（假设最大内存限制为 2 兆字节）：

```text
# 设置缓存大小
maxmemory 2mb
# 设置逐出策略
maxmemory-policy allkeys-lru
```
