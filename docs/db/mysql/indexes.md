# MySQL 索引

索引（index）用于快速查找具有特定列值的行，就相当于书的目录。如果没有索引，MySQL 将读取整个表从头查找相关行（即全表扫描）。

MySQL 中定义了很多种索引：

- 主键（PRIMARY KEY）：唯一（推荐自增）、非空

    ```sql
    -- 方式1：在建表时创建
    CREATE TABLE `t3` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(10) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `addr` varchar(10) DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    -- 方式2：ALTER TABLE 语句创建 + 自增
    ALTER TABLE t2 ADD PRIMARY KEY (id);
    ALTER TABLE t2 MODIFY id INT AUTO_INCREMENT;
    ```

- 唯一索引（UNIQUE KEY）：唯一，可为空

    ```sql
    -- 方式1：在建表时创建
    CREATE TABLE `t4` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(10) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `addr` varchar(10) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `u_name` (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    -- 方式2：ALTER TABLE 语句创建
    alter table t4  add unique key u_name  (name);
    ```

- 普通索引（INDEX）：单列索引，[多列索引](https://dev.mysql.com/doc/refman/5.7/en/multiple-column-indexes.html)（组合索引）

    ```sql
    -- 方式1：在建表时创建
    CREATE TABLE `t5` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(10) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `addr` varchar(10) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `id_1` (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

    CREATE TABLE `t5` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(10) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `addr` varchar(10) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `id_1` (`name`,`age`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1

    -- 方式2：CREATE INDEX 语句
    create index id_1 on t5 (name);
    create index id_2 on t5 (name,age);

    -- 方式3：ALTER TABLE 语句
    ALTER TABLE t5 ADD INDEX id_1 (name);
    ALTER TABLE t5 ADD INDEX id_2 (name,age);
    ```

- 全文索引（FULLTEXT）

## 索引存储

MySQL InnoDB 中除了空间索引使用 `RTREE` 存储外，大多数索引都是使用 `BTREE` 存储，可以通过 `show index from <table_name>;` 语句结果的 `Index_type` 字段查看。

![B树](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208231632571.png)

![B+树](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208231639057.png)

## EXPLAIN

`EXPLAIN SELECT ...` 可以打印查询语句的执行计划。

假设有如下表：

```sql
CREATE TABLE `t1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(10) DEFAULT NULL,
  `age` int(11) DEFAULT '100',
  `addr` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_name_age` (`name`,`age`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1
```

通过 EXPLAIN 获取执行计划：

```sql
mysql> explain select * from t1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    5 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+

mysql> explain select name from t1;
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type  | possible_keys | key         | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | index | NULL          | id_name_age | 18      | NULL |    5 |   100.00 | Using index |
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-------------+
```

## 聚簇索引

存储行数据的索引，就叫做聚簇索引，一张表只会有一个聚簇索引，其他的索引树，叶子节点会额外存储聚簇索引key的值，用于查询全部行数据。

## 回写

假设表中有 id 和 name 2个索引，以及其他一些字段，其中 id 是主键，当执行 `select * from t1 where name = 'aaa'` 时，由于查询数据列要多余 name 索引树叶子节点存储的列，MySQL 需要通过 name 索引树叶子节点存储的 id 的值，从 id 所在的聚簇索引中获取完整的数据，这个过程就叫做回写，回写会降低查询的执行效率。

## 索引覆盖

依旧是上面的例子，当执行 `select id,name from t1 where name = 'aaa'` 时，有name 索引树叶子节点存储的列包含所有查询列，不需要回写直接返回结果，这个过程就叫做所有覆盖。

## 索引下推

<https://juejin.cn/post/7005794550862053412>

## 组合索引的最左原则

定义组合索引时的第一个出现的字段必须出现在 where 语句中（在前在后不重要，重要的一定出现）才会触发索引，否则无法触发索引。

## 索引失效

模拟表的表结构如下：

```sql
CREATE TABLE `t1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(10) DEFAULT NULL,
  `age` int(11) DEFAULT '100',
  `addr` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_name_age` (`name`,`age`),
  KEY `id_age` (`age`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

mysql> select * from t1;
+----+------+------+------+
| id | name | age  | addr |
+----+------+------+------+
|  1 | aaa  |   19 | NULL |
|  2 | bbb  |   14 | NULL |
|  3 | ccc  |   22 | NULL |
|  4 | ddd  |   19 | NULL |
|  5 | ddd  |   20 | NULL |
+----+------+------+------+
```

### order by 造成索引失效

当无法满足索引覆盖时，order by 语句会造成索引失效。

```sql
mysql> explain select * from t1 order by age;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+----------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra          |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+----------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    5 |   100.00 | Using filesort |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+----------------+

mysql> explain select age from t1 order by age;
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type  | possible_keys | key    | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | index | NULL          | id_age | 5       | NULL |    5 |   100.00 | Using index |
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-------------+
```

**原因**：
尽管 `age` 索引树已经按照 `age` 排序，但是由于 `select * ...` 会照成大量的回写，MySQL 认为走索引的效率不如全表扫描，在内存中排序（内存中排序是很快的）满足要求的数据。
`select age ...` 由于不会产生回写，故走索引。

### like 语句使用左百分号

```sql
mysql> explain select * from t1 like '%a';
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'like '%a'' at line 1
mysql> explain select * from t1 where name like '%a';
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    5 |    20.00 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)

mysql> explain select * from t1 where name like 'a%';
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-----------------------+
| id | select_type | table | partitions | type  | possible_keys | key         | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | t1    | NULL       | range | id_name_age   | id_name_age | 13      | NULL |    1 |   100.00 | Using index condition |
+----+-------------+-------+------------+-------+---------------+-------------+---------+------+------+----------+-----------------------+
1 row in set, 1 warning (0.00 sec)
```

类似最左原则，由于左侧不知道，B+树无法判断无法判断顺序，进而无法判断区间。

### 匹配范围过大且会发生回写

```sql
mysql> explain select * from t1 where age > 1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | id_age        | NULL | NULL    | NULL |    5 |   100.00 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)

mysql> explain select * from t1 where age > 20;
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-----------------------+
| id | select_type | table | partitions | type  | possible_keys | key    | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | t1    | NULL       | range | id_age        | id_age | 5       | NULL |    1 |   100.00 | Using index condition |
+----+-------------+-------+------------+-------+---------------+--------+---------+------+------+----------+-----------------------+
1 row in set, 1 warning (0.01 sec)
```
