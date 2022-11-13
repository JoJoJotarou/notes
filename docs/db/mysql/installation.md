# MySQL 安装

## 在 Linux 安装

todo

<https://dev.mysql.com/downloads/>

## 在 Docker 中安装

::: info 参考链接

- [MySQL - Official Image | Docker Hub](https://hub.docker.com/_/mysql)
- [MySQL :: MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL :: MySQL 5.7 Reference Manual :: 5.1.1 Configuring the Server](https://dev.mysql.com/doc/refman/5.7/en/server-configuration.html)
- [MySQL :: MySQL 8.0 Reference Manual :: 5.1.1 Configuring the Server](https://dev.mysql.com/doc/refman/8.0/en/server-configuration.html)
- [sql - MySQL Error: : 'Access denied for user 'root'@'localhost' - Stack Overflow](https://stackoverflow.com/questions/41645309/mysql-error-access-denied-for-user-rootlocalhost)

:::

临时启动（停止容器同时删除）

```bash
sudo docker run --rm -e MYSQL_ALLOW_EMPTY_PASSWORD=true mysql:8.0
```

挂载启动（一般用这个就可以）

```bash
sudo docker run \
--name mysql8 \
–restart always \
-p 3306:3306 -p 33060:33060 \
-e MYSQL_ROOT_PASSWORD=my-secret-pw \
-e TZ=Asia/Shanghai \
-v /data/docker/mysql8/data:/var/lib/mysql \
-v /data/docker/mysql8/config:/etc/mysql/conf.d \
-d mysql:8.0

sudo docker run \
--name mysql8 \
-p 3306:3306 \
–restart always \
-e MYSQL_ROOT_PASSWORD=root \
-e TZ=Asia/Shanghai \
-v /data/docker/mysql8/data:/var/lib/mysql \
-v /data/docker/mysql8/config:/etc/mysql/conf.d \
-d mysql:8.0
```

挂载启动 - 创建新用户、新数据库

```bash
sudo docker run \
--name mysql8 \
-p 3306:3306 -p 33060:33060 \
-e MYSQL_ROOT_PASSWORD=my-secret-pw \
-e MYSQL_DATABASE=new-database \
-e MYSQL_USER=new-user \
-e MYSQL_PASSWORD=new-user-password \
-e TZ=Asia/Shanghai \
-v /data/docker/mysql8/data:/var/lib/mysql \
-v /data/docker/mysql8/config:/etc/mysql/conf.d \
-d mysql:8.0


sudo docker run \
--name mysql8 \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=jojojo123! \
-e MYSQL_DATABASE=test \
-e MYSQL_USER=test \
-e MYSQL_PASSWORD=test \
-e TZ=Asia/Shanghai \
-v /data/docker/mysql8/data:/var/lib/mysql \
-v /data/docker/mysql8/config:/etc/mysql/conf.d \
-d mysql:8.0
```

获取配置文件可以配置值及其默认值

```bash
sudo docker exec -it mysql8 mysqld --verbose --help
```

连接容器 MySQL CLI

```bash
# 无密码
sudo docker exec -it mysql8 mysql -uroot
# 有密码
sudo docker exec -it mysql8 mysql -uroot -p
```

## 新建用户和授权

新建用户 test，所有 IP 都可以链接。

- `'test'@'%'` 中的 `%` ，表示 test 用户可在任意 IP 链接数据库
- `'test'@'localhost'` 表示 test 用户仅可本地连接
- `'test'@'123.111.222.245'` ， test 用户仅可在 IP 为 123.111.222.245 的机器连接

```bash
mysql> create user 'test'@'%' identified by 'password123';
```

### 授权

- 权限
  - `all privileges` 表示所有权限，
  - 也可使具体权限如 `SELECT`、`INSERT` 等
- 授权范围
  - `test.*` 表示 test 库的所有表。
  - `*.*` 表示所有库的所有表。
  - `test.test1`表示 test 库的 test1 表。

```bash
# 将 test库的所有授权赋予 test@%
mysql> grant all privileges on test.* to 'test'@'%';

# 刷新权限
mysql> flush privileges;
```

### 撤回权限（未验证）

```bash
#收回权限(不包含赋权权限)
REVOKE ALL PRIVILEGES ON *.* FROM user_name;
REVOKE ALL PRIVILEGES ON user_name.* FROM user_name;

#收回赋权权限
REVOKE GRANT OPTION ON *.* FROM user_name;

#操作完后重新刷新权限
flush privileges;
```
