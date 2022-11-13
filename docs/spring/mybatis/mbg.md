
# MyBatis Generator

::: info
MyBatis Generator Version: 1.4.1
:::

根据已有数据库为 Mybatis 项目自动生成 CRUD 相关代码（实体类、Mapper 接口，Mapper XML），连表查询和存储过程不包括在内。

::: warning

- 如果存在与新生成的 XML 文件同名的现有文件，MBG 将自动合并 XML 文件，而不是覆盖它。
- 如果存在与新生成的 Java 文件同名的现有文件Java MBG 可以覆盖现有文件或使用不同的唯一名称保存新生成的文件，通过 `overwrite` 属性设置。当作为 Eclipse 插件运行时，MBG 可以自动合并 Java 文件。
:::

## 依赖

- jdk version >= 8
- 实现 jdbc 的驱动

## 代码风格

代码风格即告诉 MBG 如何生成代码，当前版本的支持生成以下风格的代码：

| 代码风格             | 语言 | 简单说明                                                         |
| :------------------- | :------- | :----------------------------------------------------------- |
| `MyBatis3Simple`     | Java     | 1. 生成简单增、删、改、查一个、查所有<br>2. 会生成传统的 Mapper XML 文件 |
| `MyBatis3`           | Java     | 1. 生成复杂的支持条件的增删改查<br/>2. 会生成传统的 Mapper XML 文件 |
| `MyBatis3DynamicSql` | Java     | 1. 生成复杂的支持条件的增删改查<br/>2. 仅会生成 Java 代码    |
| `MyBatis3Kotlin`     | Kotlin   | 与 `MyBatis3DynamicSql` 类似，换成了Kotlin语言               |

更多说明[查看官方文档](https://mybatis.org/generator/quickstart.html#target-runtime-information-and-samples)，下面是生成不同风格代码的[依赖项版本对照](https://marketplace.eclipse.org/content/mybatis-generator)：

| Runtime                            | MyBatis Generator Version | MyBatis Version | MyBatis Dynamic SQL Version |
| :--------------------------------- | :------------------------ | :-------------- | :-------------------------- |
| MyBatis3, MyBatis3Simple           | Any                       | 3.0+            | N/A                         |
| MyBatis3DynamicSQL                 | 1.3.6 - 1.3.7             | 3.4.2+          | 1.1.0 - 1.2.1               |
| MyBatis3DynamicSQL, MyBatis3Kotlin | 1.4.0                     | 3.4.2+          | 1.1.3+                      |
| MyBatis3DynamicSQL                 | 1.4.1+                    | 3.4.2+          | 1.3.1+                      |
| MyBatis3Kotlin                     | 1.4.1+                    | 3.4.2+          | 1.4.0+                      |

`MyBatis3DynamicSql` 的示例配置（通过 `targetRuntime` 指定不同的风格）：

```xml{5}
<!DOCTYPE generatorConfiguration PUBLIC
 "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
 "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>
  <context id="dsql" targetRuntime="MyBatis3DynamicSql">
    <jdbcConnection driverClass="org.hsqldb.jdbcDriver"
        connectionURL="jdbc:hsqldb:mem:aname" />

    <javaModelGenerator targetPackage="example.model" targetProject="src/main/java"/>

    <javaClientGenerator targetPackage="example.mapper" targetProject="src/main/java"/>

    <table tableName="FooTable" />
  </context>
</generatorConfiguration>
```

## 运行 MBG

运行 MBG 有很[多种方式](https://mybatis.org/generator/running/running.html)，本文[使用 Maven 运行 MBG](https://mybatis.org/generator/running/runningWithMaven.html) （MBG 作为 Maven Plugin）。

- 将 MBG 作为插件添加到 `pom.xml` ：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-maven-plugin</artifactId>
            <version>1.4.1</version>

            <!-- 若 includeCompileDependencies 为 true 且项目中已经存在改依赖可以不写 -->
            <dependencies>
                <!-- <dependency>
                    <groupId>mysql</groupId>
                    <artifactId>mysql-connector-java</artifactId>
                    <version>8.0.29</version>
                </dependency> -->
            </dependencies>

            <configuration>
                <!-- MBG 配置文件，默认是 ${basedir}/src/main/resources/generatorConfig.xml，所以这里不惜也是可以的 -->
                <configurationFile>src/main/resources/generatorConfig.xml</configurationFile>
                <!-- 是否覆盖已有同名的 Java 文件，默认 false -->
                <overwrite>true</overwrite>
                <!-- 如果为 true，则范围为“compile”、“provided”和“system”的依赖项将添加到生成器的类路径中。
                        也就是说，MBG 如果依赖的是 jdbc 驱动是 mysql 的，且项目也以来了，这里 plugin 就不用重复写。
                        若依赖想不一样，那么还是要写依赖项的
                    -->
                <includeCompileDependencies>true</includeCompileDependencies>
            </configuration>
        </plugin>
    </plugins>
</build>
```

更多 [configuration 配置项](https://mybatis.org/generator/running/runningWithMaven.html#parameter-reference)

::: details 项目完整依赖项

```xml
<dependencies>
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.10</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.29</version>
    </dependency>

    <!-- 日志 -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.11</version>
    </dependency>
    <dependency>
        <groupId>org.mybatis.dynamic-sql</groupId>
        <artifactId>mybatis-dynamic-sql</artifactId>
        <version>1.4.0</version>
    </dependency>

    <!-- jdk 9 开始被移出jdk -->
    <dependency>
        <groupId>javax.annotation</groupId>
        <artifactId>javax.annotation-api</artifactId>
        <version>1.3.2</version>
    </dependency>
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
</dependencies>
```

:::

- 配置 `generatorConfig.xml` ：

```xml
<!DOCTYPE generatorConfiguration PUBLIC
        "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>
    <!-- targetRuntime 生成的代码风格 -->
    <context id="dsql" targetRuntime="MyBatis3DynamicSql">
        <!-- 目标数据库 jdbc 连接信息 -->
        <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                        connectionURL="jdbc:mysql://dev01.mshome.net:3306/test"
                        userId="root"
                        password="root"/>
        <!-- 实体类输出路径 -->
        <javaModelGenerator targetPackage="com.jojojo.mybatis.smbg.model" targetProject="src/main/java"/>
        <!-- mapper 接口输出路径 -->
        <javaClientGenerator targetPackage="com.jojojo.mybatis.smbg.mapper" targetProject="src/main/java"/>
        <!-- 要生成代码的表名（可以多条），写 * 表示 ALL -->
        <table tableName="t_user"/>
    </context>
</generatorConfiguration>
```

运行插件命令：

![IDEA 运行 MBG 插件命令](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207261721065.png)
