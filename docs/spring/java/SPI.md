# SPI

SPI 是 Java 内置的服务发现机制，同一功能无痛切换不同实现。

JDBC 4.0 开始就是利用 SPI 机制使用一套规范实现对不同数据库的支持，导入mysql jdbc 驱动即可操作 mysql ，导入 oracle jdbc 驱动即可操作 oracle ，甚至不在需要使用 `Class.forName("com.mysql.cj.jdbc.Driver")` 来加载驱动。

在 `mysql-connector-java-x.x.x.jar` 中你会看到 `META-INF/services/java.sql.Driver` 文件，其内容 `com.mysql.cj.jdbc.Driver` 指向 `java.sql.Driver` 的实现类。`ServiceLoader` 会自动发现并注册该文件中类。

![SPI mysql](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208131712207.png)

## JDBC SPI 原理

当使用 `DriverManager` 获取数据库连接

```java
// 获取数据库连接
Connection connection = DriverManager.getConnection(url, user, password);
```

下面是其实现原理：

```java
package java.sql;

public class DriverManager {
    public static Connection getConnection(String url,
        String user, String password) throws SQLException {
        // 省略 ...
        return (getConnection(url, info, Reflection.getCallerClass()));
    }

    private static Connection getConnection(
        String url, java.util.Properties info, Class<?> caller) throws SQLException {
        // 省略 ...
        ensureDriversInitialized();
        // 省略 ...
    }

    private static void ensureDriversInitialized() {
        // 省略 ...
        // 这里通过 ServiceLoader 获取 java.sql.Driver 的实现
        ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
        // 省略 ...
    }
}
```

## 模拟 SPI

在 IDEA 创建如下 4 个模块（Maven 项目），测试SPI 特性：

- 模块 `search-api` ： 定义 Search 接口

    ```java
    package com.jojojo.spi;

    public interface Search {
        void search();
    }
    ```

- 模块 `search-db` ：模拟实现数据库搜索

    ```java
    package com.jojojo.spi;

    public class SearchDB implements Search {
        @Override
        public void search() {
            System.out.println("模拟搜索数据库");
        }
    }
    ```

    依赖 search-api ：

    ```xml
    <dependency>
        <groupId>com.jojojo.spi</groupId>
        <artifactId>search-api</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
    ```

    在 resource 目录添加 `META-INF/services/com.jojojo.spi.Search` 文件，内容如下是 `com.jojojo.spi.Search` 实现的完全限定名：

    ```text
    com.jojojo.spi.SearchDB
    ```

- 模块 `search-sys` ：模拟实现文件系统搜索

    ```java
    package com.jojojo.spi;

    public class SearchSys implements Search {
        @Override
        public void search() {
            System.out.println("模拟搜索文件系统");
        }
    }
    ```

    同样依赖 search-api ：

    ```xml
    <dependency>
        <groupId>com.jojojo.spi</groupId>
        <artifactId>search-api</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
    ```

    同样在 resource 目录添加 `META-INF/services/com.jojojo.spi.Search` 文件，内容如下是 `com.jojojo.spi.Search` 实现的完全限定名：

    ```text
    com.jojojo.spi.SearchSys
    ```

- 模块 `search-test` ：模拟使用

    ```java
    package com.jojojo.spi;

    import java.util.Iterator;
    import java.util.ServiceLoader;

    public class SearchTest {

        public static void main(String[] args) {
            ServiceLoader<Search> searche = ServiceLoader.load(Search.class);

            Iterator<Search> iterator = searche.iterator();

            while (iterator.hasNext()) {
                Search search = iterator.next();
                search.search();
            }
        }
    }
    ```

    当导入 `search-sys` 依赖控制台输出 `模拟搜索文件系统` 当导入 `search-db` 控制台输出 `模拟搜索数据库` 。
