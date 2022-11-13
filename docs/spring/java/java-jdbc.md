---
title: JDBC API
date: 2022-06-20
---
> **食用说明**
>
> - JDK ：17
> - MySQL ：8.0
> - Maven：3.8.6 （推荐使用 Maven 管理依赖，而非手动导入 `Jar` 包）
> - 测试代码都是放在 `jdbc/src/test/java/com/study/jdbc` 目录下，一般带有 `@Test` 注解或名字含有`test`
> - 相关视频：[尚硅谷JDBC核心技术视频教程（康师傅带你一站式搞定jdbc）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1eJ411c7rf?spm_id_from=pageDriver&vd_source=86c9755057cb1ed622693ff39a58382a)

## 介绍

> [The JDBC API is a Java API that can access any kind of tabular data, especially data stored in a relational database.](https://docs.oracle.com/javase/tutorial/jdbc/overview/index.html)

**JDBC** 是一套 Java 规范（即接口，具体实现由具体各个数据库厂商完成），帮助我们 **连接数据库** → **执行SQL语句** → **获取执行结果**。我们常说的 JDBC 驱动就是各个数据库对 JDBC 规范的具体实现。这样做的好处是开发人员和驱动厂商只需对 JDBC 规范开发即可。

![JDBC 示意图](https://tse1-mm.cn.bing.net/th/id/R-C.f23f2abe2ee5ee01b39dedb0cf287690?rik=0jixipmI6cN7ww&riu=http%3a%2f%2fwww.wuminggao.cn%2fupload%2f2020%2f07%2fF23F2ABE2EE5EE01B39DEDB0CF287690-c7b8e8a80d3748c49e24604cec5f304c.jpg&ehk=xDSXCCKPssuAwGQQGOJHBzIP0MasWOu1yKF86rC7zTI%3d&risl=&pid=ImgRaw&r=0)

### JDBC 产品组件

- **JDBC API**：JDBC API 有 `java.sql.*` 和 `javax.sql.*` 2 个命名空间，并且他们同时存在于 Java SE 和 Java EE。
- **JDBC Driver Manager**：`java.sql.DriverManager` 可以帮助我们更加方便的连接到 JDBC 驱动。
- **JDBC Test Suite**：JDBC 测试单元（没有找到更多相关内容）。
- **JDBC-ODBC Bridge**：连接 SQL server 这类 ODBC 数据库的软件桥。

### JDBC 程序开发步骤

![JDBC 程序开发步骤](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206211845241.png "图片来源：http://www.atguigu.com/jsfx/4370.html")

## 依赖

任意 IDE 创建 Maven 项目，然后添加 MySQL 的数据库驱动依赖，`pom.xml` 如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.study</groupId>
    <artifactId>jdbc</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <junit.version>5.8.2</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.27</version>
        </dependency>
    </dependencies>
</project>
```

## 数据库连接 - Connection

如果没有 MySQL 数据库，可以通过 docker 快速创建：

```
sudo docker run \
--name mysql8 \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=your_root_password \
-e MYSQL_DATABASE=test \
-e MYSQL_USER=test \
-e MYSQL_PASSWORD=test \
-e TZ=Asia/Shanghai \
-v /data/docker/mysql8/data:/var/lib/mysql \
-v /data/docker/mysql8/config:/etc/mysql/conf.d \
-d mysql:8.0
```

下面是注册驱动 JDBC 驱动和创建 `Connection` 的5种方式（其实就是代码优化），使用的话就是第 5 种：

```java
public class ConnectTest {

    @Test
    public void getConnectionTest1() throws SQLException {
        // 注册驱动
        Driver driver = new com.mysql.cj.jdbc.Driver();
        // 连接参数
        String url = "jdbc:mysql://localhost/test";
        Properties info = new Properties();
        info.setProperty("user", "test");
        info.setProperty("password", "test");
        // 获取数据库连接
        Connection connection = driver.connect(url, info);
        System.out.println(connection);
    }

    /**
     * 通过反射获取驱动就可以加载不同数据库驱动
     *
     * @throws Exception
     */
    @Test
    public void getConnectionTest2() throws Exception {
        // 注册驱动
        Driver driver = (Driver) Class.forName("com.mysql.cj.jdbc.Driver").getConstructor().newInstance();
        // 连接参数
        String url = "jdbc:mysql://localhost/test";
        Properties info = new Properties();
        info.setProperty("user", "test");
        info.setProperty("password", "test");
        // 获取数据库连接
        Connection connection = driver.connect(url, info);
        System.out.println(connection);
    }

    /**
     * 使用 DriverManager
     *
     * @throws Exception
     */
    @Test
    public void getConnectionTest3() throws Exception {
        // 注册驱动
        Driver driver = (Driver) Class.forName("com.mysql.cj.jdbc.Driver").getConstructor().newInstance();
        DriverManager.registerDriver(driver);
        // 连接参数
        String url = "jdbc:mysql://localhost/test";
        String user = "test";
        String password = "test";
        // 获取数据库连接
        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }

    /**
     * 自动注册驱动
     *
     * - com.mysql.cj.jdbc.Driver 的静态代码块实现了 `DriverManager.registerDriver(driver)`
     * - 所以我们只需通过 Class.forName 加载类即可
     *
     *
     * @throws Exception
     */
    @Test
    public void getConnectionTest4() throws Exception {
        // 注册驱动
        Class.forName("com.mysql.cj.jdbc.Driver");
        // 连接参数
        String url = "jdbc:mysql://localhost/test";
        String user = "test";
        String password = "test";
        // 获取数据库连接
        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }

    /**
     * 配置文件（final）
     *
     * 优点：
     * - 数据与与代码解耦
     * - 修改数据集连接信息不需要重新打包
     *
     * @throws Exception
     */
    @Test
    public void getConnectionTest5() throws Exception {
        // 读取配置文件
        InputStream resourceAsStream = ClassLoader.getSystemResourceAsStream("jdbc.properties");
        Properties properties = new Properties();
        properties.load(resourceAsStream);
        // 注册驱动
        Class.forName(properties.getProperty("driverClass"));
        // 连接参数
        String url = properties.getProperty("url");
        String user = properties.getProperty("user");
        String password = properties.getProperty("password");
        // 获取数据库连接
        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }
}
```

`getConnectionTest5` 需要在 `jdbc/src/main/resources` 目录下新建 `jdbc.properties` 配置文件：

```
# 与 url=jdbc:mysql://localhost:3306/test 意思相同
url=jdbc:mysql:///test
user=test
password=test
driverClass=com.mysql.cj.jdbc.Driver
```

> 💡 **当在导入 `Driver` 包时，你会发现 MySQL JDBC 驱动下会有 `com.mysql.cj.jdbc.Driver` 和 `com.mysql.jdbc.Driver`  2 个 `Driver`，有什么区别 ？**
>
> - `com.mysql.jdbc.Driver`：在  `mysql-connector-java` 版本 <= 5使用
> - `com.mysql.cj.jdbc.Driver`：在  `mysql-connector-java` 版本 >= 6 时使用
>
> 当 `mysql-connector-java` 版本 >= 6 使用 `com.mysql.jdbc.Driver`会有提示：**Loading class `com.mysql.jdbc.Driver'. This is deprecated. The new driver class is`com.mysql.cj.jdbc.Driver'. The driver is automatically registered via the SPI and manual loading of the driver class is generally unnecessary.**

### JDBCUtil

现在，我们希望有一个通用的类来创建 `Connection` ，方便后续测试。在 `jdbc/src/main/java/com/study/jdbc/util` 创建 `JDBCUtil.java`：

```java
public class JDBCUtil{
    private static String password;
    private static String username;
    private static String url;
    private static String driverClass;

    static {
        try {
            // 这样写在一个进程中只会执行一次，不用每次获取连接都创建流
            getProperties();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 获取配置文件 jdbc.properties
     */
    private static void getProperties() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = null;
        try {
            inputStream = ClassLoader.getSystemResourceAsStream("jdbc.properties");
            properties.load(inputStream);
            driverClass = properties.getProperty("driverClass");
            url = properties.getProperty("url");
            username = properties.getProperty("user");
            password = properties.getProperty("password");
        } finally {
            if (inputStream != null)
                inputStream.close();
        }
    }

    /**
     * 获取数据库连接
     */
    public static Connection connection() throws ClassNotFoundException, SQLException {
        // 加载 MySQL 驱动类。
        Class.forName(driverClass);
        // 获取数据库连接。
        return DriverManager.getConnection(url, username, password);
    }

    /**
     * 关闭流
     */
    public static void close(Connection c, Statement s) throws SQLException {
        if (c != null)
            c.close();
        if (s != null)
            s.close();
    }

    /**
     * 关闭流
     */
    public static void close(Connection c, Statement s, ResultSet rs) throws SQLException {
        if (c != null)
            c.close();
        if (s != null)
            s.close();
        if (rs != null)
            rs.close();
    }
}
```

## 操作数据库

> **💡创建表的实体类时，应当注意数据库数据类型与 Java 数据类型之间的映射关系，相关参考：**
>
> - [SQL Server Language](https://docs.microsoft.com/en-us/sql/language-extensions/how-to/java-to-sql-data-types?view=sql-server-ver16)
> - [MySQL 8.0 Java, JDBC, and MySQL Types](https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-type-conversions.html)
> - [Supported Data Types - Oracle)](https://docs.oracle.com/cd/E19501-01/819-3659/gcmaz/)

测试用例涉及到表：

```sql
create table user(
  id int AUTO_INCREMENT,
  name varchar(255),
  password varchar(255),
  primary key (id)
);
create table user_photo(
  id int AUTO_INCREMENT,
  name varchar(255),
  photo mediumblob,
  primary key (id)
);
```

表的实体类（这里省略了 `getter` `setter` `toString` 方法，位于 `jdbc/src/main/java/com/study/jdbc/domain` 目录）：

```java
public class User {
    private Integer id;
    private String name;
    private String password;
}
public class UserPhoto {
    private Integer id;
    private String name;
    private byte[] photo;
}
```

### Statement

Statement 是用来执行 SQL 语句的基本类。

```java
public class StatementTest {
    public void query(String name) throws ClassNotFoundException, SQLException {
        Connection conn = JDBCUtil.connection();
        String sql = "select * from user where name = '" + name + "'";
        Statement state = conn.createStatement();
        ResultSet rs = state.executeQuery(sql);
        int i = 0;
        while (rs.next()) {
            i++;
        }
        System.out.println(i);
        rs.close();
        state.close();
        conn.close();
    }

    @Test
    public void testQuery1() throws ClassNotFoundException, SQLException {
        String name = "test";
        query(name);
    }

    /**
     * SQL 注入测试
     */
    @Test
    public void testQuery2() throws ClassNotFoundException, SQLException {
        String name = "test' or 1=1 or 1='1";
        query(name);
    }
}
```

`Statement` 的问题：

- SQL 需要拼接字符串很麻烦
- SQL 注入：假设你的 SQL 是`SELECT * FROM user WHERE name='test'`，且 `user` 表没有 `name='test'` 的数据 。但是只要传入 `test' or 1=1 or 1='1` ， 那么你的执行语句是 `SELECT * FROM USER WHERE NAME='test' or 1=1 or 1='1'`，本来返回空的数据，现在返回整张表的数据。
- 批量操作不能使用 batch 只能通过循环实现，每次操作都会创一个新的字符串，资源消耗大、耗时
- 无法操作文件

### PreparedStatement

`PreparedStatement` 是 `Statement`  的子类，`PreparedStatement` 解决 `Statement` 带来的问题。所以通常使用 `PreparedStatement` 。

#### CRUD

```java
public class PreparedStatementTest {
    private Connection connection;
    private PreparedStatement ps;
    private ResultSet rs;

    @Test
    public void testAdd() throws SQLException, ClassNotFoundException {
        String sql = "insert into user(name, password) value (?, ?)"; // ? 表示占位符
        try {
            connection = JDBCUtil.connection();
            ps = connection.prepareStatement(sql); // 获取 PreparedStatement 对象
            ps.setString(1, "t1"); // 设置占位符，首位是 1
            ps.setString(2, "password");
            ps.execute();
        } finally {
            JDBCUtil.close(connection, ps);
        }
    }

    @Test
    public void testQuery() throws ClassNotFoundException, SQLException {
        String sql = "select id, name, password from user";
        try {
            connection = JDBCUtil.connection();
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery(); // 查询返回结果集
            while (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id")); // 与 rs.getInt(1) 等效
                user.setName(rs.getString("name"));
                user.setPassword(rs.getString("password"));
                System.out.println(user);
            }
        } finally {
            JDBCUtil.close(connection, ps, rs);
        }
    }
    @Test
    public void testUpdate() throws ClassNotFoundException, SQLException {
        String sql = "update user set password = ? where name = ?";
        // ... 与 testAdd 逻辑一样，省略
    }
    @Test
    public void testDelete() throws ClassNotFoundException, SQLException {
        String sql = "delete from user where name = ?";
        // ... 与 testAdd 逻辑一样，省略
    }
}
```

#### 操作文件

```java
public class PreparedStatementTest {
    @Test
    public void testAddBlob() throws ClassNotFoundException, SQLException {
        String sql = "insert into user_photo(name, photo) value (?, ?)";
        try {
            connection = JDBCUtil.connection();
            ps = connection.prepareStatement(sql);
            ps.setString(1, "t1");
            // 获取 photo 的 InputStream （resources目录下）
            InputStream inputStream = ClassLoader.getSystemResourceAsStream("me.jpg");
            // 可以传 Blob 类型也可以传 InputStream
            ps.setBlob(2, inputStream);
            ps.execute();
        } finally {
            JDBCUtil.close(connection, ps);
        }
    }

    @Test
    public void testDownloadblob() throws ClassNotFoundException, SQLException, IOException {
        String sql = "select id, name, photo from user_photo";
        InputStream is = null;
        FileOutputStream fos = null;
        try {
            connection = JDBCUtil.connection();
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery();
            if (rs.next()) {
                UserPhoto user = new UserPhoto();
                user.setId(rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setPhoto(rs.getBytes("photo"));
                System.out.println(user);
                // 下载
                is = new ByteArrayInputStream(user.getPhoto());
                // 下载到项目根目录
                fos = new FileOutputStream("download.jpg");
                // 下载到 resources 目录
                // fos = new FileOutputStream(ClassLoader.getSystemResource("").getPath() +
                // "download.jpg");
                byte[] bytes = new byte[1024];
                int len = 0;
                while ((len = is.read(bytes)) != -1) {
                    fos.write(bytes, 0, len);
                }
            }
        } finally {
            JDBCUtil.close(connection, ps, rs);
            if (is != null)
                is.close();
            if (fos != null)
                fos.close();
        }
    }
}
```

#### 批量操作

```java
public class PreparedStatementTest {
 @Test
    public void testBatchAdd1() throws ClassNotFoundException, SQLException {
        String sql = "insert into user(name, password) value (?, ?)";
        try {
            long start = System.currentTimeMillis();
            connection = JDBCUtil.connection();
            ps = connection.prepareStatement(sql);
            // 关闭自动提交，减少提示事物耗时
            connection.setAutoCommit(false);
            for (int i = 0; i < 2000; i++) {
                ps.setString(1, "t" + i);
                ps.setString(2, "password" + i);
                ps.addBatch();
                if (((i + 1) % 500) == 0) {
                    ps.executeBatch();
                    ps.clearBatch();
                }
            }
            connection.commit();
            long end = System.currentTimeMillis();
            System.out.println("批量插入耗时：" + (end - start));
        } finally {
            JDBCUtil.close(connection, ps);
        }
    }
}
```

- 🚨**MySQL默认不开启批量操作，需在连接 url 添加参数 `rewriteBatchedStatements=true` 即：`url=jdbc:mysql:///test?rewriteBatchedStatements=true`**。
- 事物提交时耗时的，所以通过 `connection.setAutoCommit(false);` 取消事物的自动提交，然后通过 `connection.commit();` 统一提交。不关闭的话，插入 2000 次提交 2000 次，插入 2 万次就提交 2 万次。

## 数据库事物

**我的理解：事物就是，由一个多或多个数据库命令组成的最小操作单元，事物中的所有操作要么全部成功（提交：commit），要么全部失败（回滚：rollback）。**

```java
public class PreparedStatementTest {
 @Test
    public void testTransaction() {
        String sql = "insert into user(name, password) value (?, ?)";
        try {
            connection = JDBCUtil.connection();
            connection.setAutoCommit(false); // 关闭自动提交事物
            ps = connection.prepareStatement(sql);
            ps.setString(1, "t1");
            ps.setString(2, "password");
            ps.execute();
            // 模拟异常
            System.out.println(10 / 0);
            ps.setString(1, "t2");
            ps.setString(2, "password");
            ps.execute();
            connection.commit(); // 提交事物
        } catch (Exception e) {
            connection.rollback(); // 回滚事物
            e.printStackTrace();
        } finally {
            JDBCUtil.close(connection, ps);
        }
    }
}
```

### 事物特性 - ACID

|           特性            | 说明                                                         |
| :-----------------------: | ------------------------------------------------------------ |
|  **原子性（Atomicity）**  | 指事物是数据库操作的最小操作单元。                           |
| **一致性（Consistency）** | 事物中的所有操作要么全部成功，要么全部失败（回滚）。事物中命令失败，则恢复到事物前数据状态，成功则数据进入新的状态（事物后状态） |
|  **隔离性（Isolation）**  | 事物与事物之间是独立的。                                     |
| **持久性（Durability）**  | 事物一旦提交对数据的更改将永久有效。                         |

### 并发下的事物隔离级别

事务并发问题：

|               问题                | 描述                                                         | 例子                                                         |
| :-------------------------------: | ------------------------------------------------------------ | ------------------------------------------------------------ |
|        脏读（Dirty Read）         | **一个事务读到了另一个未提交事务修改过的数据**。             | 用户在浏览商城页面，后台修改了页面信息，但是提交，这是用户刷新页面已经看到未提交的数据了。 |
| 不可重复读（Non-Repeatable Read） | **一个事物在同一条件先后 2 次查询结果不一致，总能读到其他事物对同条件数据修改（已提交事物）。** | 开启事物后，你多次查询 `select * form user where id=1`，在此期间，你的同事更新id=1的记录并提交，你在事物未提交时就能查到被更新的数据。 |
|          幻读（Phantom）          | **一个事物在同一条件先后 2 次查询结果一致，但是同条件更新的数量与读到的数量不一致。** | 开启事物后，你多次查询 `select * form user where id>1`，在此期间，你的同事更新几条记录并提交，你在事物未提交时就能获取到新增数据。 |

数据库有以下4中隔离级别：

| 隔离级别                     | 解决问题               |
| ---------------------------- | ---------------------- |
| 读未提交（READ UNCOMMITTED） | 未解决任何问题         |
| 读已提交（READ COMMITTED）   | 脏读                   |
| 可重复读（REPEATABLE READ）  | 脏读、不可重复读       |
| 可串行化（SERIALIZABLE）     | 脏读、不可重复读、幻读 |

### 扩展知识

> **常见数据库事务隔离级别**：
>
> - MySQL `可重复读（REPEATABLE READ）`；
> - Oracle/SQL server `读已提交（READ COMMITTED）`；

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

- 其中 `$level` 有4种值：`REPEATABLE READ` | `READ COMMITTED` | `READ UNCOMMITTED` | `SERIALIZABLE`
- 关键字 `GLOBAL` 表示：只对执行完该语句之后产生的会话起作用，当前已经存在的会话无效。
- 关键字 `SESSION` 表示：对当前会话的所有后续的事务有效。能在事务中执行，但不影响当前事物。
- 无关键字表示：只对当前会话中下一个即将开启的事务有效，随后恢复默认隔离级别。不能在事务中执行。

> Java 代码中使用 `connection.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);` 来设置连接的事物隔离级别。**相关代码请查看项目。**

## 连接池

前面在说 `PrepareStatement` 批量操作时，提到事物提交是耗时的，其实`JDBCUtil.connection();` 获取数据库连接也是需要时间的和消耗系统资源的，若将 `long start = System.currentTimeMillis();` 下移到获取连接只会，你会发现时间减少。

在测试用例中每次执行都需要获取一次新的连接。但是实际业务中，可能有很多用户同时执行各种操作，首先会增加操作的时长，其次同时创建的连接数太多会导致服务器性能下降，那么就需要**数据库连接池**技术管理数据库连接。

**简单的说，连接池负责数据库连接的创建、管理和销毁，而关闭连接池，连接是释放，而非直接关闭，下次再用是直接用连接池中获取，省去了创建关闭连接的资源消耗和时间。同时。连接池的大小、触发增加量都可以配置。**

![连接池示意图](https://tse1-mm.cn.bing.net/th/id/OIP-C.2eeo1F39u2je8dzEJ2a3NQHaEQ?pid=ImgDet&rs=1)

### DataSource

`javax.sql.DataSource` 是数据库连接创建的工厂（连接池的创建都是由 `DataSource` 实现类实现的），作为 `DriverManager` 工具的替代，`DataSource`对象是获得连接的首选方法。`DataSrouce` 同样由数据库驱动厂商实现，实现方式分为三种：

- 基础实现：生成一个标准的 `Connection` 对象
- 连接池实现：生成一个或多个标准的 `Connection` 对象并放入连接池。此实现和中间层连接池管理器一起使用。
- 分布式事务实现：产生一个可以用于分布式事务的 `Connection` 对象，并且几乎总是参与连接池。此此实现与中间层事务管理器一起使用，并且几乎总是与连接池管理器一起使用。

### Druid

[Druid](https://github.com/alibaba/druid) 是 Alibaba 开源的连接池技术，以高性能著称，根据 Druid 的 [Benchmark 数据](https://github.com/alibaba/druid/wiki/Benchmark_aliyun)，tomcat-jdbc 性能也不错，还有其他常见的数据库连接池技术如：[C3P0](https://www.mchange.com/projects/c3p0/)、[DBCP](https://commons.apache.org/proper/commons-dbcp/)

```java
public class ConnectionPoolTest {
 /**
     * Druid 硬编码连接
     *
     * @throws SQLException
     */
    @Test
    public void testDruid() throws SQLException {
        DruidDataSource dds = new DruidDataSource();
        dds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dds.setUrl("jdbc:mysql:///test?rewriteBatchedStatements=true");
        dds.setUsername("test");
        dds.setPassword("test");

        DruidPooledConnection dpc = dds.getConnection();
        Connection connection = dpc.getConnection();
        System.out.println(connection);
        connection.close();
        dpc.close();
        dds.close();
    }

    /**
     * Druid 配置文件连接
     *
     * @throws Exception
     */
    @Test
    public void testDruidWithConfig() throws Exception {

        Properties properties = new Properties();
        properties.load(ClassLoader.getSystemResourceAsStream("druid.properties"));
        DruidDataSource dds = (DruidDataSource) DruidDataSourceFactory.createDataSource(properties);
        DruidPooledConnection dpc = dds.getConnection();
        Connection connection = dpc.getConnection();
        System.out.println(connection);
        connection.close();
        dpc.close();
        dds.close();
    }
}
```

resources 目录下 `druid.properties`

```
url=jdbc:mysql:///test?rewriteBatchedStatements=true
username=test
password=test
driverClassName=com.mysql.cj.jdbc.Driver
```

## GenericDAO

通常操作数据的对象也成为 `DAO（Data Access Object）`。综上，我们考虑下如何实现一个通用的 `DAO` 对象：

- 不管是增删改查执行 SQL 需要 2 个参数：
  - 待执行 SQL 字符串。
  - 相应占位符的参数，参数的长度和类型未知，所以使用 `Object... params` 接收。

- 查询需要一个对象列表来接收查询结果集，因为是通用的，这个对象就是未知，故使用泛型。同时通过反射将结果存入 `List` 。
- 使用连接池
- 手动事物

```java
public class GenericDAO<T> {

    Class<T> clazz = null;

    {
        ParameterizedType type = (ParameterizedType) this.getClass().getGenericSuperclass();
        clazz = (Class<T>) type.getActualTypeArguments()[0];
    }

    protected Connection connection = null;
    protected PreparedStatement ps = null;
    protected ResultSet rs = null;

    /**
     * 增删改
     *
     * @param sql
     * @param params
     */
    public void execute(String sql, Object... params) throws Exception {
        try {
            connection = ConnPoolUtil.getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(sql);
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ps.execute();
            connection.commit();
        } catch (Exception e) {
            connection.rollback();
            e.printStackTrace();
            throw new Exception(e.getMessage());
        } finally {
            ConnPoolUtil.close(connection, ps);
        }
    }

    /**
     * 查询
     *
     * @param sql
     * @param params
     * @return {@code List<T>}
     */
    public List<T> executeQuery(String sql, Object... params) throws Exception {

        List<T> tList = new ArrayList<>();

        try {
            connection = ConnPoolUtil.getConnection();
            ps = connection.prepareStatement(sql);
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            rs = ps.executeQuery();
            ResultSetMetaData metaData = rs.getMetaData();

            while (rs.next()) {
                // 若存在数据，创建对象实例
                T t = clazz.getConstructor().newInstance();
                for (int i = 0; i < metaData.getColumnCount(); i++) {
                    String fieldName = metaData.getColumnLabel(i + 1);
                    Field field = t.getClass().getDeclaredField(fieldName);
                    Method method = t.getClass().getDeclaredMethod(
                            "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1), field.getType());
                    method.invoke(t, rs.getObject(fieldName));
                }
                tList.add(t);
            }

            return tList;
        } finally {
            ConnPoolUtil.close(connection, ps);
        }
    }
}
```

子类继承：

```java
public class UserDAO extends GenericDAO<User> {
    // *** 自定义实现
}
```
