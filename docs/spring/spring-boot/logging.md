
# Logging：SLF4J

::: info

- SLF4J Version 1.7.36
- Spring Boot Version 2.x

:::

**[Simple Logging Facade for Java (SLF4J)](https://www.slf4j.org/manual.html)**，翻译过来：Java的简单日志门面，说人话就是：各种日志框架的门面（抽象），类似 JDBC 。这样只需要了解 SLF4J 使用即可，面向接口编程，符合依赖倒置原则。下图明确阐述了，sfl4j 与 其他日志框架的关系：

![SLF4J 绑定](https://www.slf4j.org/images/concrete-bindings.png)

日志框架被称为 SLF4J 绑定 (bindings) ，实现 SLF4J 有原生（native）和适配（adaptation）2 种方式，logback 是 SLF4J 的原生实现，

::: info

> As of version 2.0.0, SLF4J bindings are called providers.

从 2.0.0 版开始，SLF4J 绑定被称为提供者。

:::

## 非 Spring Boot 项目使用 SLF4J

SLF4J 是接口规范，那么在使用是必须同时添加 `slf4j-api` 以及任意一个 SLF4J 绑定。

::: warning

- 当仅有 `slf4j-api` 不存在 SLF4J 绑定时，不会输出任何信息（使用 `slf4j-nop` 实现），会收到如下警告：

```text
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
```

- 最好只存在一个 SLF4J 绑定，有多个绑定时，会收到如下警告：

```text
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/chang/.m2/repository/ch/qos/logback/logback-classic/1.2.11/logback-classic-1.2.11.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/chang/.m2/repository/org/slf4j/slf4j-simple/1.7.36/slf4j-simple-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [ch.qos.logback.classic.util.ContextSelectorStaticBinder]
```

:::

普通 Maven 项目中使用 `slf4j-simple`：

```xml
<dependencies>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>1.7.36</version>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>1.7.36</version>
    </dependency>
</dependencies>
```

输出：

```text
[main] INFO com.jojojo.slf4j.HelloWorld - Hello World!
Hello World!
```

普通 Maven 项目中使用 `logback` （`logback-classic` 包含了 `slf4j-api` 和 `logback-core` 依赖）：

```xml
<dependencies>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.11</version>
    </dependency>
</dependencies>
```

输出：

```text
17:17:26.072 [main] INFO com.jojojo.slf4j.HelloWorld - Hello World!
Hello World!
```

## 实现原理

不使用 Lombok 的 `@slf4j` 注解时，通常 `LoggerFactory.getLogger(HelloWorld.class)` 来获取日志对象：

```java {3}
public class HelloWorld {
    public static void main(String[] args) {
        Logger logger = LoggerFactory.getLogger(HelloWorld.class);
        logger.info("Hello World!");
    }
}
```

按照如下顺序找到 `bind()` ：`org.slf4j.LoggerFactory.java#getLogger(Class<?> clazz)` → `org.slf4j.LoggerFactory.java#getLogger(String name)` → `org.slf4j.LoggerFactory.java#getILoggerFactory` → `org.slf4j.LoggerFactory.java#performInitialization` → `org.slf4j.LoggerFactory.java#bind`

```java
// org/slf4j/LoggerFactory.java
private final static void bind() {
    try {
        Set<URL> staticLoggerBinderPathSet = null;
        // skip check under android, see also
        // http://jira.qos.ch/browse/SLF4J-328
        if (!isAndroid()) {
            // 从 classpath 找 "org/slf4j/impl/StaticLoggerBinder.class"
            staticLoggerBinderPathSet = findPossibleStaticLoggerBinderPathSet();
            // 检查是否有多个StaticLoggerBinder，当有多个日志框架时输出歧义警告
            reportMultipleBindingAmbiguity(staticLoggerBinderPathSet);
        }
        // 💡💡💡随机选择一个 StaticLoggerBinder 进行绑定
        StaticLoggerBinder.getSingleton();
        INITIALIZATION_STATE = SUCCESSFUL_INITIALIZATION;
        reportActualBinding(staticLoggerBinderPathSet);
    } catch (NoClassDefFoundError ncde) {
        String msg = ncde.getMessage();
        if (messageContainsOrgSlf4jImplStaticLoggerBinder(msg)) {
            INITIALIZATION_STATE = NOP_FALLBACK_INITIALIZATION;
            Util.report("Failed to load class \"org.slf4j.impl.StaticLoggerBinder\".");
            Util.report("Defaulting to no-operation (NOP) logger implementation");
            Util.report("See " + NO_STATICLOGGERBINDER_URL + " for further details.");
        } else {
            failedBinding(ncde);
            throw ncde;
        }
    } catch (java.lang.NoSuchMethodError nsme) {
        String msg = nsme.getMessage();
        if (msg != null && msg.contains("org.slf4j.impl.StaticLoggerBinder.getSingleton()")) {
            INITIALIZATION_STATE = FAILED_INITIALIZATION;
            Util.report("slf4j-api 1.6.x (or later) is incompatible with this binding.");
            Util.report("Your binding is version 1.5.5 or earlier.");
            Util.report("Upgrade your binding to version 1.6.x.");
        }
        throw nsme;
    } catch (Exception e) {
        failedBinding(e);
        throw new IllegalStateException("Unexpected initialization failure", e);
    } finally {
        postBindCleanUp();
    }
}
```

::: tip

在 Maven 项目中POM 依赖项有多个 SLF4J 实现时，在 IDEA 本地运行或者 `maven-shade-plugin` 打包成 jar（一旦编译打包好后其加载的那个日志实现就会固定不变）都是加载 pom.xml 里声明的第一个 SLF4J 实现。

:::

实现 SLF4J 的日志框架都有 `org.slf4j.impl.StaticLoggerBinder.class` ：

![从 classpath 找 "org/slf4j/impl/StaticLoggerBinder.class"](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208041332412.png)

## Spring Boot 项目使用 SLF4J

在 Spring Boot 项目中引入 `spring-boot-starter`
、 `spring-boot-starter-web` 依赖时， SLF4J 以及实现 logback 就已经被引入。

![spring-boot logging](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208041111262.png)

**Spring Boot 默认使用 logback。log4j-to-slf4j 和 jul-to-slf4j 是 [log4j2](https://logging.apache.org/log4j/2.x/) 和 [jul](https://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html) (Java Util Logging) 的适配层。**

要使用 log4j2 需要 POM 中排除 `spring-boot-starter-logging` 然后引入 `spring-boot-starter-log4j2`

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
      <exclusion>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-logging</artifactId>
      </exclusion>
    </exclusions>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
  </dependency>
</dependencies>
```

::: tip `log4j-to-slf4j.jar` 和 `log4j-slf4j-impl.jar` 的区别
`log4j-to-slf4j.jar` 是 slf4j 适配，`log4j-slf4j-impl.jar` 是 slf4j 的桥接（直接实现）。
:::

更多参考：

- [Spring Boot Logging](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)
- [log4j2 官网](https://logging.apache.org/log4j/2.x/)
- [Spring boot log4j2.xml example - HowToDoInJava](https://howtodoinjava.com/spring-boot2/logging/spring-boot-log4j2-config/#:~:text=%20To%20configure%20Log4j2%20with%20Spring%20Boot2%2C%20follow,in...%203%20Spring%20boot%20log4j2%20demo%20More%20)

## spring-jcl

> [Since Spring Framework 5.0, Spring comes with its own Commons Logging bridge implemented in the spring-jcl module. The implementation checks for the presence of the Log4j 2.x API and the SLF4J 1.7 API in the classpath and uses the first one of those found as the logging implementation, falling back to the Java platform’s core logging facilities (also known as JUL or java.util.logging) if neither Log4j 2.x nor SLF4J is available.](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#spring-jcl)

从 spring framework 5.0 开始 已经不在使用 common-loggin 而是使用 spring-jcl。

![spring-jcl](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208041633928.png)

Step 1：通过 `org.apache.commons.logging.LogFactory#getLog(Class<?> clazz)` 获取日志对象：

```java
public class MyBean {
    // org.apache.commons.logging.LogFactory ← from spring-jcl
    private final Log log = LogFactory.getLog(getClass());
    // ...
}
```

::: details 过渡调用

```java
public abstract class LogFactory {
    public static Log getLog(Class<?> clazz) {
        return getLog(clazz.getName());
    }
    public static Log getLog(String name) {
        return LogAdapter.createLog(name);
    }
}
```

:::

Step 2：根据 `logApi` 选择不同的适配器获取不同的日志对象。

```java
final class LogAdapter {
    public static Log createLog(String name) {
        switch (logApi) {
            case LOG4J:
                return Log4jAdapter.createLog(name);
            case SLF4J_LAL:
                return Slf4jAdapter.createLocationAwareLog(name);
            case SLF4J:
                return Slf4jAdapter.createLog(name);
            default:
                return JavaUtilAdapter.createLog(name);
        }
    }
}
```

`logApi` 如何来？ `LogAdapter` 的静态代码块用初始化 `logApi`：

```java
// 对应 log4j-api 依赖
private static final String LOG4J_SPI = "org.apache.logging.log4j.spi.ExtendedLogger";
// 对应 log4j-to-slf4j 依赖
private static final String LOG4J_SLF4J_PROVIDER = "org.apache.logging.slf4j.SLF4JProvider";
// 对应 slf4j-api 依赖 (LocationAwareLogger 是一个可选接口, 提供更详细的路径信息)
private static final String SLF4J_SPI = "org.slf4j.spi.LocationAwareLogger";
// 对应 slf4j-api 依赖 （slf4j 默认，参考上一节输出）
private static final String SLF4J_API = "org.slf4j.Logger";

static {
    if (isPresent(LOG4J_SPI)) {
        if (isPresent(LOG4J_SLF4J_PROVIDER) && isPresent(SLF4J_SPI)) {
            // log4j-to-slf4j bridge -> we'll rather go with the SLF4J SPI;
            // however, we still prefer Log4j over the plain SLF4J API since
            // the latter does not have location awareness support.
            logApi = LogApi.SLF4J_LAL;
        }
        else {
            // Use Log4j 2.x directly, including location awareness support
            logApi = LogApi.LOG4J;
        }
    }
    else if (isPresent(SLF4J_SPI)) {
        // Full SLF4J SPI including location awareness support
        logApi = LogApi.SLF4J_LAL;
    }
    else if (isPresent(SLF4J_API)) {
        // Minimal SLF4J API without location awareness support
        logApi = LogApi.SLF4J;
    }
    else {
        // java.util.logging as default
        logApi = LogApi.JUL;
    }
}
```

由此可以看出多个日志框架同时出现时加载的优先级：`SLF4J_SPI(LOG4J) > LOG4J > SLF4J_SPI > SLF4J_API > JUL`

默认情况下 spring boot 项目导入 spring-boot-starter-logging，所以 `logApi = LogApi.SLF4J_LAL;`

![spring-boot-starter-logging](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208041731869.png)

Step 3 : 创建日志对象

```java
private static class Slf4jAdapter {

    public static Log createLocationAwareLog(String name) {
        // 从这里开始又回到 slf4j 的实现原理
        Logger logger = LoggerFactory.getLogger(name);
        return (logger instanceof LocationAwareLogger ?
                new Slf4jLocationAwareLog((LocationAwareLogger) logger) : new Slf4jLog<>(logger));
    }

    public static Log createLog(String name) {
        return new Slf4jLog<>(LoggerFactory.getLogger(name));
    }
}
```
