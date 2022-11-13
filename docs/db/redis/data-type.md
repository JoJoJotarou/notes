# Redis 数据类型

[Redis data types](https://redis.io/docs/manual/data-types/)

- String
  - Bitmap and HyperLogLog
- List
- Set
- Hash
- zset (Sorted Set)
- Stream
- Geospatial indexes

## String

- 可以存储和操作字符串、数值、序列化的JSON、二进制
- 可以当计数器
- 字符串的最大长度 512MB
- 高效,大部分操作的时间复杂度 O(1) ，但是 SUBSTR、GETRANGE 和 SETRANGE 命令，这些命令可能是 O(n)。这些随机访问字符串命令在处理大字符串时可能会导致性能问题。

操作字符串：

```bash
# 新增
SET user:name noah
# 删除
DEL user:name
# 判断是否存在
EXISTS user:name
# 当不存key是插入key
SETNX user:name noah
# 新增key并设置过期时间
SET user:name noah EX 7200
# 查看key剩余过期时间
TTL user:name
# 单个命令检索多个key
MGET user:u1 user:u2
```

操作数值：

```bash
# 原子加一（计数器）
INCR user:age
# 原子减一
DECR user:age
# 在 user:age 基础上原子加10
INCRBY user:age 10
# 在 user:age 基础上原子减10
INCRBY user:age -10
```

全部 String 命令查看[官方文档](https://redis.io/commands/?group=string)

## List

Redis List 是一个有序双向链表，经常作为堆、栈和消息队列

模拟堆（先进先出，FIFO）:

- `LPUSH` ：向列表左端插入值
- `RPOP` ： 从列表右端删除并返回值

```bash
127.0.0.1:6379> LPUSH USERID 100
(integer) 1
127.0.0.1:6379> LPUSH USERID 200
(integer) 2
127.0.0.1:6379> RPOP USERID
"100"
127.0.0.1:6379> RPOP USERID
"200"
```

模拟栈（先进后出，FILO）：

- `LPOP` ： 从列表左端删除并返回值

```bash
127.0.0.1:6379> LPUSH USERID 100
(integer) 1
127.0.0.1:6379> LPUSH USERID 200
(integer) 2
127.0.0.1:6379> LPOP USERID
"200"
127.0.0.1:6379> LPOP USERID
"100"
```

模拟将将一个列表的元素移动到另一个列表：

- `LMOVE`： 原子的将一个列表一端（左/右）的元素移动到另一个列表的一端（左/右）
- `LLEN` ：列表的长度
- `LRANGE` ： 打印列范围值，0 代表列表的一个元素， 1 是下一个元素

```bash
127.0.0.1:6379> LPUSH L1 1 2
(integer) 2
127.0.0.1:6379> LPUSH L2 3 4
(integer) 2
127.0.0.1:6379>
127.0.0.1:6379>
127.0.0.1:6379> LMOVE L2 L1 RIGHT LEFT
"3"
127.0.0.1:6379> LLEN L2
(integer) 1
127.0.0.1:6379> LLEN L1
(integer) 3
127.0.0.1:6379> LRANGE L1 0 -1
1) "3"
2) "2"
3) "1"
```

模拟任务队列：

- `BLPUSH` ：从列表的头部删除并返回一个元素。如果列表为空，则命令会阻塞，直到元素可用或达到指定的超时。
- `BLMOVE` ：原子地将元素从源列表移动到目标列表。如果源列表为空，则该命令将阻塞，直到有新元素可用。

![模拟任务队列](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208251134357.png)

全部 List 命令查看[官方文档](https://redis.io/commands/?group=list)

## Set

无序值唯一的集合

用户添加 `SADD` /删除 `SREM` 喜爱的书记编号：

```bash
127.0.0.1:6379> SADD USER1:BOOK 123
(integer) 1
127.0.0.1:6379> SADD USER1:BOOK 456
(integer) 1
127.0.0.1:6379> SADD USER1:BOOK 789
(integer) 1
127.0.0.1:6379> SADD USER2:BOOK 789
(integer) 1
127.0.0.1:6379> SADD USER2:BOOK 999
(integer) 1
127.0.0.1:6379> SREM USER2:BOOK 999
(integer) 1
```

查看 USER1 是否喜爱某个编号的书籍：

```bash
127.0.0.1:6379> SISMEMBER USER1:BOOK 123
(integer) 1
127.0.0.1:6379> SISMEMBER USER1:BOOK 999
(integer) 0
```

查看用户1和2的用共同爱好（**交集**）：

```bash
127.0.0.1:6379> SINTER USER1:BOOK USER2:BOOK
1) "789"
```

查看集合的总数：

```bash
127.0.0.1:6379> SCARD USER1:BOOK
(integer) 3
```

全部 Set 命令查看[官方文档](https://redis.io/commands/?group=set)

## ZSet（Sorted Set）

有序唯一集合，每一个值都有一个 score 属性，用来作为排序的依据。当多个字符串具有相同的分数时，这些字符串按字典顺序排列。

模拟排行榜：

- `ZADD` ：向集合中添加元素，相同key的被覆盖
- `ZRANGE` ：返回集合中的部分元素，默认升序，不返回分数值
- `ZRANK` ：返回指定成员升序的排名
- `ZREVRANK` ：返回指定成员降序的排名

```bash
127.0.0.1:6379> ZADD leaderboard 100 U1
(integer) 1
127.0.0.1:6379> ZADD leaderboard 75 U2
(integer) 1
127.0.0.1:6379> ZADD leaderboard 45 U3
(integer) 1
127.0.0.1:6379> ZADD leaderboard 125 U2
(integer) 0
127.0.0.1:6379> ZRANGE leaderboard 0 3 # 默认升序
1) "U3"
2) "U1"
3) "U2"
127.0.0.1:6379> ZRANGE leaderboard 0 3 REV # 通过 REV 反转排序，变成倒序
1) "U2"
2) "U1"
3) "U3"
127.0.0.1:6379> ZRANGE leaderboard 0 3 REV WITHSCORES # 通过 WITHSCORES 显示 score
1) "U2"
2) "125"
3) "U1"
4) "100"
5) "U3"
6) "45"
127.0.0.1:6379> ZRANK leaderboard U3 # 返回指定成员升序的排名
(integer) 0
127.0.0.1:6379> ZREVRANK leaderboard U3 # 返回指定成员降序的排名
(integer) 2
```

全部 ZSet 命令查看[官方文档](https://redis.io/commands/?group=sorted-set)

## Hash

Redis hash 用于键值对存储，同样也可以作为计数器

存储键值对：

- HSET ： 设置键值对
- HGET ： 获取指定字段的值
- HMGET ： 获取一个或多个字段的值
- HGETALL ：获取所有字段和值

```bash
127.0.0.1:6379> HSET USER1 NAME NOAH AGE "18"
(integer) 2
127.0.0.1:6379> HGET USER1 AGE
"18"
127.0.0.1:6379> HMGET USER1 NAME AGE
1) "NOAH"
2) "18"
127.0.0.1:6379> HGETALL USER1
1) "NAME"
2) "NOAH"
3) "AGE"
4) "18"
```

在键值对上模拟计数器：

- `HINCRBY` ： 将给定字段的值增加提供的整数

```bash
127.0.0.1:6379> HINCRBY PING SUCCESS 1
(integer) 1
127.0.0.1:6379> HINCRBY PING SUCCESS 1
(integer) 2
127.0.0.1:6379> HINCRBY PING SUCCESS 1
(integer) 3
127.0.0.1:6379> HINCRBY PING SUCCESS -1
(integer) 2
```

## Bitmap

## HyperLogLog

## Stream

## Geospatial indexes
