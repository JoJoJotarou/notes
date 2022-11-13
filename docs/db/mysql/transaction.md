# 数据库事物

**我的理解：事物就是，由一个多或多个数据库命令组成的最小操作单元，事物中的所有操作要么全部成功（提交：commit），要么全部失败（回滚：rollback）。**

下面是开启事物的几种方式：

- `START TRANSACTION` 开启事物

    ```sql
    START TRANSACTION;
    SELECT @A:=SUM(salary) FROM table1 WHERE type=1;
    UPDATE table2 SET summary=@A WHERE type=1;
    COMMIT;
    ```

- `BEGIN;` 开启事物：

    ```sql
    BEGIN;
    SELECT @A:=SUM(salary) FROM table1 WHERE type=1;
    UPDATE table2 SET summary=@A WHERE type=1;
    COMMIT;
    ```

    ::: tip
    在存储过程和函数、触发器和事件中，解析器将 `BEGIN` 视为 `BEGIN ... END` 块的开始。在此上下文中使用 `START TRANSACTION` 开始事务。
    :::

- `set autocommit=0;` 关闭自动提交，默认情况自动提交是开启的

    ```bash
    mysql> show variables like 'autocommit%';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | autocommit    | ON    |
    +---------------+-------+
    ```

- 更多关于开启事物语法点击查看[官方文档](https://dev.mysql.com/doc/refman/5.7/en/commit.html)

## 事物特性 - ACID

|           特性            | 说明                                                   |
| :-----------------------: | ------------------------------------------------------ |
|  **原子性（Atomicity）**  | 事物中的所有操作要么全部成功，要么全部失败（回滚）。   |
| **一致性（Consistency）** | 不管事物成功还是失败，数据库不会崩溃，数据是受保护的。 |
|  **隔离性（Isolation）**  | 事物与事物之间是独立的。                               |
| **持久性（Durability）**  | 事物一旦提交对数据的更改将永久有效。                   |

<https://dev.mysql.com/doc/refman/5.7/en/mysql-acid.html>

## 事物并发的问题

在并发场景下多事务访问/操作相同数据会发生**脏读（Dirty Read）**、**不可重复读（Non-Repeatable Read）**、**幻读（Phantom）** 问题。

### 脏读（Dirty Read）

一个事务读到了另一个事务修改未提交的数据。

| 时间点 |                          事物 A                           |                          事物 B                           |
| :----: | :-------------------------------------------------------: | :-------------------------------------------------------: |
|   1    |                     set autocommit=0;                     |                     set autocommit=0;                     |
|   2    | SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; | SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; |
|   3    |                           begin                           |                           begin                           |
|   4    |                          select1                          |                                                           |
|   5    |                                                           |                          update                           |
|   6    |             select2（结果与 select1 不相同）              |                                                           |

![脏读](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208232332026.png)

### 不可重复读（Non-Repeatable Read）

一个事物同一条件先后 2 次查询结果不一致（其他事物对同条件数据增、删、改且提交）。

| 时间点 |                          事物A                          |                          事物B                          |
| :----: | :-----------------------------------------------------: | :-----------------------------------------------------: |
|   1    |                    set autocommit=0;                    |                    set autocommit=0;                    |
|   2    | SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; | SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; |
|   3    |                          begin                          |                          begin                          |
|   4    |                         select1                         |                                                         |
|   5    |                                                         |                  update/insert/delete                   |
|   6    |                                                         |                         commit;                         |
|   7    |             select2（结果与select1不相同）              |                                                         |

![不可重复读](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208232340134.png)

### 幻读（Phantom）

一个事物同一条件先后 2 次查询结果一致，但是同条件更新的数据数量与读到的数量不一致（其他事物对同条件数据增、删且提交）。

| 时间点 |                          事物 A                          |                          事物 B                          |
| :----: | :------------------------------------------------------: | :------------------------------------------------------: |
|   1    |                    set autocommit=0;                     |                    set autocommit=0;                     |
|   2    | SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; | SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; |
|   3    |                          begin                           |                          begin                           |
|   4    |                         select1                          |                                                          |
|   5    |                                                          |                      insert/delete                       |
|   6    |                                                          |                          commit                          |
|   7    |            select2（**结果与 select1 相同**）            |                                                          |
|   8    |         update（**更新数量与 select1/2 不同**）          |                                                          |

![幻读](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208232325645.png)

## 事物隔离级别

针对并非中脏读、不可重复读、幻读的问题，数据库有以下 4 中隔离级别：

| 隔离级别                     | 解决问题               |
| ---------------------------- | ---------------------- |
| 读未提交（READ UNCOMMITTED） | 未解决任何问题         |
| 读已提交（READ COMMITTED）   | 脏读                   |
| 可重复读（REPEATABLE READ）  | 脏读、不可重复读       |
| 可串行化（SERIALIZABLE）     | 脏读、不可重复读、幻读 |

::: tip 常见数据库默认事务隔离级别

- MySQL `可重复读（REPEATABLE READ）`；
- Oracle/SQL server `读已提交（READ COMMITTED）`；

:::

查看 MySQL 数据库隔离级别：

```sql
# 方式一
SHOW VARIABLES LIKE 'transaction_isolation';
# 方式二
SELECT @@transaction_isolation;
```

设置 MySQL 事务隔离级别：

```sql
SET [GLOBAL|SESSION] TRANSACTION ISOLATION LEVEL $level;
```

- 其中 `$level` 有 4 种值：`REPEATABLE READ` | `READ COMMITTED` | `READ UNCOMMITTED` | `SERIALIZABLE`
- 关键字 `GLOBAL` 表示：只对执行完该语句之后产生的会话起作用，当前已经存在的会话无效。
- 关键字 `SESSION` 表示：对当前会话的所有后续的事务有效。能在事务中执行，但不影响当前事物。
- 无关键字表示：只对当前会话中下一个即将开启的事务有效，随后恢复默认隔离级别。不能在事务中执行。

> Java 代码中使用 `connection.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);` 来设置连接的事物隔离级别。**相关代码请查看项目。**

## MVCC

MVCC ，Multi-Versioning Concurrent Control，多版本并发控制，基于 [undo logs](https://dev.mysql.com/doc/refman/5.7/en/innodb-undo-tablespaces.html) 实现事物回滚和在读已提交、可重复读隔离级别下的[非锁一致读](https://dev.mysql.com/doc/refman/5.7/en/innodb-consistent-read.html)（不加锁可重复读）：

每一个 InnoDB 的数据表默认添加 3 个隐藏字段，记录有关已更改行的旧版本的信息：

| 隐藏字段    | 占用字节 | 描述                                                         |
| ----------- | -------- | ------------------------------------------------------------ |
| DB_TRX_ID   | 6-byte   | 插入或最后一次更新行事物的ID（删除被视为更新，有一个特殊的bit标记数据是否被删除） |
| DB_ROLL_PTR | 7-byte   | 回滚指针，该指针指向 undo log 中当前记录的上一次版本（undo log 用来记录行的历史版本，例如更新行，那么 undo log 中记录的便是行更新前的版本)。 |
| DB_ROW_ID   | 6-byte   | 该字段是用来存储 InnoDB **自动生成聚簇索引**的 ID            |

### Undo logs

- 撤消日志是与单个读写事务关联的撤消日志记录的集合。 撤消日志记录包含有关如何撤消事务对聚集索引记录的最新更改的信息。

    ![undo logs](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208241548003.png)

- 如果另一个事务需要将原始数据视为一致读取操作的一部分，则从撤消日志记录中检索未修改的数据。
- 撤消日志（Undo logs）分为插入撤消日志和更新撤消日志。插入撤消日志在事物提交后会被立即丢弃。更新撤消日志只有在不存在事物后才会被丢弃。
- 撤消日志（Undo logs）存在于撤消日志段（undo log segments）中，撤消日志段包含在回滚段（rollback segments）中。 回滚段驻留在系统表空间（system tablespace）、撤销表空间（undo tablespaces）和临时表空间（temporary tablespace）中。

一个事务最多被分配四个撤消日志，一个用于以下操作类型中的每一种：

- INSERT operations on user-defined tables
- UPDATE and DELETE operations on user-defined tables
- INSERT operations on user-defined temporary tables
- UPDATE and DELETEoperations on user-defined temporary tables

### 当前读和快照读

**当前读**，指读取最新的数据，触发当前读的语句：

- `select ... for update`
- `select ... lock in share mode`
- `update ...`
- `insert ...`
- `delete ...`

**快照读**，指读取数据的历史数据，触发快照读的语句只有普通的 `select ...` 。

#### Read View

在事务中进行快照读操作时会产生读视图（Read View），读视图保存的不是数据信息，而是事物信息：

| 字段         | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| trx_list     | 生成 read view 时系统活跃的事物ID                            |
| up_limit_id  | trx_list中事务ID最小的ID                                     |
| low_limit_id | ReadView生成时刻系统尚未分配的下一个事务ID，也就是目前已出现过的事务ID的最大值+1 |

#### 可见性算法

- 首先比较 `DB_TRX_ID < up_limit_id`, 如果小于，则当前事务能看到 `DB_TRX_ID` 所在的记录（即最新记录），如果大于等于进入下一个判断。
- 判断 `DB_TRX_ID >= low_limit_id` , 如果大于等于则代表 `DB_TRX_ID` 所在的记录在 Read View 生成后才出现的，那对当前事务肯定不可见（去undo logs获取数据），如果小于则进入下一个判断
- 判断 `DB_TRX_ID` 是否在活跃事务之中，如果在，则代表我Read View生成时刻，你这个事务还在活跃，还没有 `Commit` ，你修改的数据，我当前事务也是看不见的（去undo logs获取数据）；如果不在，则说明，你这个事务在 Read View 生成之前就已经 `Commit` 了，你修改的结果，我当前事务是能看见的

::: tip 不同的事物隔离级别快照读 readview 生成策略时不同的：

- 在 **RR** 隔离级别中，**只在第一次**执行快照读（普通 `select` 语句）才会产生 readview ，之后的 `select` 会使用第一次`select` 产生的 readview 来判断数据是否可见。
- 在 **RC** 隔离级别中**每次执行**快照读（普通 `select` 语句）都会产生 Read View，也就是说每次 select 的数据都是最新。

:::

### 一个问题

现在表 t 有如下数据：

```sql
mysql> select * from t;
+------+------+
| id   | name |
+------+------+
|    1 | xxx  |
|    2 | bbb  |
|    3 | ccc  |
+------+------+
```

经过下面的过程事物A select 的结果是什么？

| 时间点 |                          事物A                          |                          事物B                          |
| :----: | :-----------------------------------------------------: | :-----------------------------------------------------: |
|   1    | SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; | SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; |
|   2    |                          begin                          |                          begin                          |
|   3    |                                                         |         update t set name = 'aaa' where id = 1;         |
|   4    |                                                         |                         commit;                         |
|   5    |                       **select?**                        |                                                         |

::: details 答案和解释
答案：

![答案](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208241614989.png)

为什么？

![why1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208241700724.png)

为什么前面的案例是可重复读的？

![why2](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208241701478.png)
:::
