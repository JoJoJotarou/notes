---
title: Java 标准库：JSON Binding
# date: 2022-06-26
---

# {{ $frontmatter.title}}

JSON Binding 是用来将 Java 对象与 JSON 消息相互转换的标准 API。它定义了将现有 Java 类转换为 JSON 的默认映射算法，同时允许开发人员通过使用 Java 注解定制映射过程。

> [Jakarta JSON Binding™ is a standard binding layer for converting Java objects to/from JSON messages. It defines a default mapping algorithm for converting existing Java classes to JSON, while enabling developers to customize the mapping process through the use of Java annotations.](https://projects.eclipse.org/projects/ee4j.jsonb)

## 版本

> Jakarta EE 8 是 Java EE 8 的兼容版本

| JSON Binding 版本                      | Java/Jakarta EE 规范版本 | 命名空间                      |
| -------------------------------------- | ------------------------ | ----------------------------- |
| Java API for JSON Binding 1.0 (JSON-B) | Java EE 8                | `javax.json.bind`             |
| Jakarta JSON Binding 1.0               | Jakarta EE 8             | `jakarta.json.bind`（待验证） |
| Jakarta JSON Binding 2.0               | Jakarta EE 9             | `jakarta.json.bind`           |
| Jakarta JSON Binding 3.0               | Jakarta EE 10            | `jakarta.json.bind`           |

- [JSON-B Github](https://github.com/javaee/jsonb-spec)
- [JSON-B Home Page](https://javaee.github.io/jsonb-spec/index.html)
- [Jakarta JSON Binding Releases Page](https://jakarta.ee/zh/specifications/jsonb/)

## 使用说明

以 **Java API for JSON Binding 1.0 (JSON-B)** 为例，需要添加的 Maven 依赖项如下：

```xml
<dependency>
    <groupId>javax.json.bind</groupId>
    <artifactId>javax.json.bind-api</artifactId>
    <version>1.0</version>
</dependency>
<dependency>
    <groupId>org.glassfish</groupId>
    <artifactId>javax.json</artifactId>
    <version>1.1.4</version>
</dependency>

<!-- JSON-B 的实现 -->
<dependency>
    <groupId>org.eclipse</groupId>
    <artifactId>yasson</artifactId>
    <version>1.0.2</version>
</dependency>
```

去 Manve Repository 获取最新版本：

> **💡 使用 JSON-B 1.0 请选择编译依赖项（Compile Dependencies）的命名空间是 javax 而不是 jakarta 的。同理使用 Jakarta JSON Binding 应选择编译依赖项的命名空间是 jakarta 而不是 javax 的。**

- [javax.json.bind:javax.json.bind-api](https://mvnrepository.com/artifact/javax.json.bind/javax.json.bind-api)
- [org.glassfish:javax.json](https://mvnrepository.com/artifact/org.glassfish/javax.json)
- [org.eclipse:yasson](https://mvnrepository.com/artifact/org.eclipse/yasson)

简单用例：

```java
Jsonb jsonb =  JsonbBuilder.create();
User user = jsonb.fromJson("{\"name\":\"test\",\"password\":\"password1\"}", User.class);
String json = jsonb.toJson(user)
```
