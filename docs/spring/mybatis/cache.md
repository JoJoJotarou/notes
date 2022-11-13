## 一级缓存

一级缓存是 sqlSession 级别的，即同一个 sqlSession 创建任意 Mapper 查询相同数据会使用缓存中的数据，**一级缓存是默认开启的**。

```text{3-7}
13:49:57.665 [main] DEBUG org.apache.ibatis.transaction.jdbc.JdbcTransaction - Opening JDBC Connection
13:49:58.266 [main] DEBUG org.apache.ibatis.datasource.pooled.PooledDataSource - Created connection 385332399.
13:49:58.269 [main] DEBUG com.jojojo.mybatis.sqc.mapper.UserMapper.getAll - ==>  Preparing: select * from t_user
13:49:58.310 [main] DEBUG com.jojojo.mybatis.sqc.mapper.UserMapper.getAll - ==> Parameters:
13:49:58.351 [main] DEBUG com.jojojo.mybatis.sqc.mapper.UserMapper.getAll - <==      Total: 3
[User{id=1, name='noah', age=18}, User{id=3, name='tom', age=18}, User{id=4, name='tom', age=20}]
[User{id=1, name='noah', age=18}, User{id=3, name='tom', age=18}, User{id=4, name='tom', age=20}]
13:49:58.359 [main] DEBUG org.apache.ibatis.transaction.jdbc.JdbcTransaction - Closing JDBC Connection [com.mysql.cj.jdbc.ConnectionImpl@16f7b4af]
```

**一级缓存失效情况：**

- 不同的 sqlSession
- 不同的查询语句
- 2次相同请求之间发生了增删改操作，无论是否影响缓存数据
- 手动清理缓存 `sqlSession.clearCache()`

## 二级缓存

二级缓存是 `sqlSessionFactory` 级别，即同一个 `sqlSessionFactory` 创建的 `sqlSession` 的查询结果会被缓存， `sqlSession` 创建任意 Mapper 查询相同数据会使用缓存中的数据。

**二级缓存生效的条件：**

- 核心配置文件中设置 `cacheEnable="true"` ，默认就是 `true` 。
- mapper 配置文件设置 `<cache>` 标签。
- 手动调用 sqlSession `commit()` 或者 `close()` 后查询数据才会添加到二级缓存。
- 实体类实现序列化接口 `Serializable` 。

```text
14:12:35.431 [main] DEBUG com.jojojo.mybatis.sqc.mapper.User2Mapper - Cache Hit Ratio [com.jojojo.mybatis.sqc.mapper.User2Mapper]: 0.0
14:12:35.441 [main] DEBUG org.apache.ibatis.transaction.jdbc.JdbcTransaction - Opening JDBC Connection
14:12:35.907 [main] DEBUG org.apache.ibatis.datasource.pooled.PooledDataSource - Created connection 1155757579.
14:12:35.910 [main] DEBUG com.jojojo.mybatis.sqc.mapper.User2Mapper.getAll - ==>  Preparing: select * from t_user
14:12:35.944 [main] DEBUG com.jojojo.mybatis.sqc.mapper.User2Mapper.getAll - ==> Parameters:
14:12:35.986 [main] DEBUG com.jojojo.mybatis.sqc.mapper.User2Mapper.getAll - <==      Total: 3
[User{id=1, name='noah', age=18}, User{id=3, name='tom', age=18}, User{id=4, name='tom', age=20}]
14:12:36.000 [main] DEBUG org.apache.ibatis.transaction.jdbc.JdbcTransaction - Closing JDBC Connection [com.mysql.cj.jdbc.ConnectionImpl@44e3760b]
14:12:36.000 [main] DEBUG org.apache.ibatis.datasource.pooled.PooledDataSource - Returned connection 1155757579 to pool.
14:12:36.002 [main] WARN org.apache.ibatis.io.SerialFilterChecker - As you are using functionality that deserializes object streams, it is recommended to define the JEP-290 serial filter. Please refer to https://docs.oracle.com/pls/topic/lookup?ctx=javase15&id=GUID-8296D8E8-2B93-4B9A-856E-0A65AF9B8C66
14:12:36.005 [main] DEBUG com.jojojo.mybatis.sqc.mapper.User2Mapper - Cache Hit Ratio [com.jojojo.mybatis.sqc.mapper.User2Mapper]: 0.5
[User{id=1, name='noah', age=18}, User{id=3, name='tom', age=18}, User{id=4, name='tom', age=20}]
```

**二级缓存失效情况：**

- 2次相同请求之间发生了增删改操作，无论是否影响缓存数据，同时清楚一二级缓存

### `<cache>` 标签

```xml
<cache/>
```

`<cache/>` 含义如下如下:

- 映射语句文件中的所有 select 语句的结果将会被缓存。
- 映射语句文件中的所有 insert、update 和 delete 语句会刷新缓存（之前的缓存将失效）。
- 缓存会使用最近最少使用算法（LRU, Least Recently Used）算法来清除不需要的缓存。
- 缓存不会定时进行刷新（也就是说，没有刷新间隔）。
- 缓存会保存列表或对象（无论查询方法返回哪种）的 1024 个引用。
- 缓存会被视为读/写缓存，这意味着获取到的对象并不是共享的，可以安全地被调用者修改，而不干扰其他调用者或线程所做的潜在修改。

:::tip

- 缓存只作用于 `cache` 标签所在的映射文件中的语句。
- 如果你混合使用 Java API 和 XML 映射文件，在共用接口中的语句将不会被默认缓存。你需要使用 `@CacheNamespaceRef` 注解指定缓存作用域。
:::

#### 标签属性

`eviction` (清除策略)：

- `LRU` – 最近最少使用：移除最长时间不被使用的对象。（默认值）
- `FIFO` – 先进先出：按对象进入缓存的顺序来移除它们。
- `SOFT` – 软引用：基于垃圾回收器状态和软引用规则移除对象。
- `WEAK` – 弱引用：更积极地基于垃圾收集器状态和弱引用规则移除对。

`flushInterval` （缓存刷新间隔）：

- 可以被设置为任意的正整数，单位：毫秒。
- 默认情况是不设置，也就是没有刷新间隔，缓存仅仅会在调用语句（映射语句文件中的所有 insert、update 和 delete 语句）时刷新。

`size` （引用数目）：

- 可以被设置为任意正整数，要注意欲缓存对象的大小和运行环境中可用的内存资源（防止内存溢出）。
- 默认值是 1024。

`readOnly` （只读）:

- 属性可以被设置为 true（只读） 或 false（可读写），默认 false。
- 只读的缓存会给所有调用者返回缓存对象的相同实例。因此这些对象不能被修改。这就提供了可观的性能提升。
- 而可读写的缓存会（通过序列化）返回缓存对象的拷贝。速度上会慢一些，但是更安全。

## 缓存查询顺序

1. 先查询二级缓存，若存在则返回
2. 若二级缓存不存在，则查询一级缓存，若存在则返回
3. 若二级缓存不存在，则查询数据库并返回
4. 手动调用 sqlSession `commit()` 或者 `close()` 后存入二级缓存

## 第三方依赖增强二级缓存 EHcache

[mybatis-ehcache](https://mybatis.org/ehcache-cache/)

## 自定义缓存

<https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BC%93%E5%AD%98>
