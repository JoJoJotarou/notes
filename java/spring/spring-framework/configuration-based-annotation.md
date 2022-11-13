---
title: 基于注解配置容器
date: 2022-07-04
---

## XML 开始注解扫描

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

</beans>
```

`<context:annotation-config/>` 元素隐式注册了以下后处理器：

- ConfigurationClassPostProcessor：用于 `@Configuration` 类的引导处理，是 `BeanFactoryPostProcessor` 的实现。
- AutowiredAnnotationBeanPostProcessor：自动装配带注释的字段、setter方法和任意配置方法的BeanPostProcessor实现。此类要注入的成员是通过注解检测的：默认情况下，Spring 的@Autowired和@Value注解。
还支持 JSR-330 的@Inject注释（如果可用）等价于 Spring 自己的@Autowired
- CommonAnnotationBeanPostProcessor：BeanPostProcessor实现，支持开箱即用的常见 Java 注释，特别是javax.annotation包中的 JSR-250 注释。例如@PostConstruct 、 @PreDestroy 、 @Resource 等
- PersistenceAnnotationBeanPostProcessor：持久化注解，注入 JPA 资源，如 EntityManagerFactory and EntityManager。
- EventListenerMethodProcessor：将 @EventListener 注释的方法注册为单独的 ApplicationListener 实例。实现BeanFactoryPostProcessor

>Like @Resource, the @PostConstruct and @PreDestroy annotation types were a part of the standard Java libraries from JDK 6 to 8. However, the entire javax.annotation package got separated from the core Java modules in JDK 9 and eventually removed in JDK 11. If needed, the javax.annotation-api artifact needs to be obtained via Maven Central now, simply to be added to the application’s classpath like any other library.

## @Required

> @Required 注解和 RequiredAnnotationBeanPostProcessor 从 Spring Framework 5.1 开始正式弃用，赞成使用构造函数注入进行所需设置（或 InitializingBean.afterPropertiesSet 的自定义实现 () 或自定义 @PostConstruct 方法以及 bean 属性 setter 方法）。

`RequiredAnnotationBeanPostProcessor` 必须注册为 bean 以启用对 `@Required` 注释的支持。

## @Autowired

## @Primary

@Primary 表示当多个 bean 是自动装配到单值依赖项的候选者时，应优先考虑@Primary 注解的 bean。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

    <bean class="example.SimpleMovieCatalog" primary="true">
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean id="movieRecommender" class="example.MovieRecommender"/>

</beans>
```

## @Qualifier

指定要自动装配的 bean 的 id

## 使用泛型作为自动装配限定符

```java
@Configuration
public class MyConfiguration {

    @Bean
    public StringStore stringStore() {
        return new StringStore();
    }

    @Bean
    public IntegerStore integerStore() {
        return new IntegerStore();
    }
}
```

```java
@Autowired
private Store<String> s1; // <String> qualifier, injects the stringStore bean

@Autowired
private Store<Integer> s2; // <Integer> qualifier, injects the integerStore bean
```

## CustomAutowireConfigurer

没看懂

BeanFactoryPostProcessor 的子类

## @Resource

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    // name 为另外一个 bean 的名字，未指定name则使用setter 方法的参数名子
    @Resource(name="myMovieFinder")
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
```

对于 BeanFactory、ApplicationContext、ResourceLoader、ApplicationEventPublisher 和 MessageSource 接口，是spring 已知依赖项，不通过 bean 名字匹配，

## @Value

@Value 通常用于注入外部属性，例如 .properties 文件中的属性。用于将

### @PropertySource

PropertySource 添加到 Spring 的Environment 。与Configuration类一起使用。

```java
@Configuration
@PropertySource("classpath:application.properties")
public class AppConfig { }
```

```property
catalog.name=MovieCatalog
```

```java
@Component
public class MovieRecommender {

    private final String catalog;

    public MovieRecommender(@Value("${catalog.name}") String catalog) {
        this.catalog = catalog;
    }
}
```

### PropertySourcesPlaceholderConfigurer

Spring 提供了一个默认的宽松嵌入值解析器。 它将尝试解析属性值，如果无法解析，则属性名称（例如 ${catalog.name}）将作为值注入。 如果你想对不存在的值保持严格的控制，你应该声明一个 PropertySourcesPlaceholderConfigurer bean，如下例所示

```java
@Configuration
public class AppConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
```

> 使用 JavaConfig 配置 PropertySourcesPlaceholderConfigurer 时，@Bean 方法必须是 static。

如果无法解析任何 ${} 占位符，则使用上述配置可确保 Spring 初始化失败。 也可以使用诸如 setPlaceholderPrefix、setPlaceholderSuffix 或 setValueSeparator 之类的方法来自定义占位符。

> Spring Boot 默认配置一个 PropertySourcesPlaceholderConfigurer bean，它将从 application.properties 和 application.yml 文件中获取属性。

### 默认值

```java
@Component
public class MovieRecommender {

    private final String catalog;

    // 默认值未：defaultCatalog
    public MovieRecommender(@Value("${catalog.name:defaultCatalog}") String catalog) {
        this.catalog = catalog;
    }
}
```

Spring BeanPostProcessor 在幕后使用 ConversionService 来处理将 @Value 中的 String 值转换为 目标类型。 如果您想为您自己的自定义类型提供转换支持，您可以提供您自己的 ConversionService bean 实例，如下例所示：

```java
@Configuration
public class AppConfig {

    @Bean
    public ConversionService conversionService() {
        DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
        conversionService.addConverter(new MyCustomConverter());
        return conversionService;
    }
}
```

### SpEL 表达式

```java
@Component
public class MovieRecommender {

    private final String catalog;

    public MovieRecommender(@Value("#{systemProperties['user.catalog'] + 'Catalog' }") String catalog) {
        this.catalog = catalog;
    }
}
```

SpEL 还支持使用更复杂的数据结构

```java
@Component
public class MovieRecommender {

    private final Map<String, Integer> countOfMoviesPerCatalog;

    public MovieRecommender(
            @Value("#{{'Thriller': 100, 'Comedy': 300}}") Map<String, Integer> countOfMoviesPerCatalog) {
        this.countOfMoviesPerCatalog = countOfMoviesPerCatalog;
    }
}
```

## @PostConstruct 和 @PreDestroy

>与 @Resource 一样，@PostConstruct 和 @PreDestroy 注解类型是从 JDK 6 到 8 的标准 Java 库的一部分。但是， 整个 javax.annotation 包从 JDK 9 中的核心 Java 模块中分离出来，最终在 JDK 11 中删除。如果需要，需要获取 javax.annotation-api 工件 现在通过 Maven Central，只需像任何其他库一样添加到应用程序的类路径。

## stereotype annotations

@Component：是任何 Spring 管理的组件的通用构造型。
@Repository：是任何实现存储库角色或构造型（也称为数据访问对象或 DAO）的类的标记。
@Service：业务逻辑处理类标记。
@Controller：表示层类标记。

### @ComponentScan

```java
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig  {
    // ...
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="org.example"/>

</beans>
```

此外，当您使用组件扫描元素时，AutowiredAnnotationBeanPostProcessor 和 CommonAnnotationBeanPostProcessor 都隐式包含在内。

#### [自定义过滤扫描](https://www.geekdoc.top/docs/languages/java/spring-framework/5.3.11/reference/html/core.html#beans-scanning-filters)

### [自定义 bean 命名策略](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-scanning-filters)

## @Scope

## [生成候选组件的索引提高启动性能](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-scanning-index)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context-indexer</artifactId>
        <version>5.3.11</version>
        <optional>true</optional>
    </dependency>
</dependencies>
```

## JSR 330 标准注解

```java
<dependency>
    <groupId>javax.inject</groupId>
    <artifactId>javax.inject</artifactId>
    <version>1</version>
</dependency>
```

### @Inject

您可以使用 @javax.inject.Inject 代替 @Autowired，如下所示：

```java
import javax.inject.Inject;

public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.findMovies(...);
        // ...
    }
}
```

### @Named

@Named 替代 @Qualifier

```java
import javax.inject.Inject
import javax.inject.Named

class SimpleMovieLister {

    private lateinit var movieFinder: MovieFinder

    @Inject
    fun setMovieFinder(@Named("main") movieFinder: MovieFinder) {
        this.movieFinder = movieFinder
    }

    // ...
}
```

您可以使用 @javax.inject.Named 或 javax.annotation.ManagedBean 代替 @Component

```java
import javax.inject.Inject;
import javax.inject.Named;

@Named("movieListener")  // @ManagedBean("movieListener") could be used as well
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

### [JSR-330 标准注解的限制](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-standard-annotations-limitations)
