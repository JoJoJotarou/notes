---
title: Spring IoC
---

# {{ $frontmatter.title }}

> 💡 本提到的 Spring 指 Spring Framework

Spring IoC 是 Spring Inversion of Control 的简称，中文翻译”控制反转“。Spring IoC 是 Spring Framework 不可或缺的技术。IoC 常和 DI（Dependency Injection，依赖注入） 这个概念一起出现。

## Spring 容器、控制反转、依赖注入、Bean

![The Spring IoC container](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206291941010.png "图片来源:https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-basics")

上图显示了 Spring 如何工作的高级视图：Spring 容器 （Spring Container）根据业务代码与配置元数据（Configuration Metadata）为我们准备了一个完全配置且可执行的系统或应用程序。

- Spring 容器，也叫 Spring IoC 容器， `org.springframework.context.ApplicationContext` 接口代表 Spring 容器。**Spring 容器根据配置元数据实例化、组装和管理对象**，这个对象被称为 Bean。**换而言之，由 Spring 容器负责实例化、组装和管理的对象叫做 Bean。**
- 通常一个类会依赖其他类，Spring 容器实例化 Bean 的时候根据配置元数据通过某种方式注入其依赖项，这就叫做**依赖注入（DI）**。
- 以上过程：**将对象创建（`new`）的控制权从开发者转移给 Spring 容器就叫做控制反转（IoC）**。

> 💡 控制反转是思想或者是目标，而依赖注入是控制反转的实现方式。

<!-- ### 回顾 Servlet -->

在 Servlet 的例子中，我们写了一个 XML，它看起来是这样的：

```xml
<!-- application.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans>
    <bean id="user" class="com.study.usermanagerservlet.servlet_v3.UserController"></bean>
</beans>
```

我们通过实现 `ServletContextListener` 监听类，在 `ServletContext` 创建时读取 application.xml 获取 `id` 和 `class` ，然后通过反射技术实例化 `class` 指向的类 ，并存在一个叫 `beanMap` 的 `Map` 对象中。这个例子是不是和 Spring Framework 的工作方式很相似（这个例子肯定比 Spring 实现方式要简单非常多），我们也没有直接 `new` 一个对象，而是通过反射技术创建。

### 什么是依赖？

```java
public class A(){
    public void greeting(){
        System.out.print("hello world");
    }
}

public class B(){
    private A a = new A(); // <-- B 依赖 A ，A 是 B 的依赖项
    public void greeting(){
        a.greeting();
    }
}
```

## 准备项目

首先新建一个 Maven 项目，POM 导入 Spring 依赖：

```xml
<properties>
    <spring.version>5.3.20</spring.version>
</properties>

<dependencies>
    <!-- Spring Framework 的最小依赖 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-beans</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

项目中存在的类：

``` java
public class UserDAO {
    // 模拟 DAO 获取 User 列表
    public List<User> getUsers() {
        List<User> users = Arrays.asList(
                new User(1, "小明", "password1"),
                new User(1, "小红", "password2")
        );
        return users;
    }
}

public class User {
    private Integer id;
    private String name;
    private String password;
    // 这里省略了 getter 、setter 、toString 方法以及有参和无参构造函数
}

public interface UserService {
    List<User> getUsers();
}
```

## 配置元数据

所谓配置元数据就是用来描述 Spring 容器如何创建 bean 的信息，配置元数据也叫“bean 的定义”，定义配置元数据也叫做“定义 bean”。在 Spring Framework 中有**XML 文件** 、**注解（Annotation）** 、**Java Configuration** 3 种方式定义配置元数据，以 `UserDAO` 为例，看看如何定义它的 bean：

- XML 文件

    > 💡 来自 Spring 的建议/约定：
    >
    > - 通常一个 XML 文件存放同一逻辑层的 bean 的定义。
    > - bean 的命名（id）应当使用小驼峰命名，像 `userManager` 这样。

    ```xml
    <!-- dao.xml -->
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
        <!-- id：该 bean 的唯一标识符 -->
        <!-- class：该 bean 的类路径 -->
        <bean id="userDAO" class="com.jojojotarou.springframeworkiocxml.dao.UserDAO"></bean>
    </beans>
    ```

- 注解（Annotation）：从 Spring 2.5 开始引入 `@Required` 、`@Autowired` 、 `@Primary` 、 `@Resource` 、 `@PostConstruct` 、 `@PreDestroy` 等注解。

    ```java
    @Component
    public class UserDAO {
        // ...
    }
    ```

- Java Configuration：从 Spring 3.0开始，使用 `@Configuration` ， `@Bean` ， `@Import` ， `@DependsOn` 等注解.

    ```java
    // 用 @Configuration 注解一个类表明它的主要目的是作为 bean 定义的来源
    @Configuration
    public class UserDAOConfig {
        // @Bean 等价于 XML 中的 <bean/>
        @Bean
        public UserDAO userDAO() {
            return new UserDAO();
        }
    }
    ```

::: tip
三种定义 Bean 的方式并非相互隔离的，它们可以混用。现在项目中大多使用注解和Java Configuration 方法。
:::

## 实例化 Spring Container

在 Servlet 的例子中，在需要使用对象时，直接从 `beanMap` 对象中获取，同样的在 Spring Framework 中我们也可以从 Spring 容器的实例化对象中获取，以基于 XML 文件的配置元数据为例，介绍 2 种 ApplicationContext 的实现。

### ClassPathXmlApplicationContext

```java
@Test
public void testClassPathXmlApplicationContext() {
    // 实例化 Spring 容器
    ApplicationContext context = new ClassPathXmlApplicationContext("dao.xml");

    // 通过 bean id 获取 bean
    UserDAO userDAO = context.getBean("userDAO", UserDAO.class);
    List<User> users = userDAO.getUsers();
    for (User user : users) {
        System.out.println(user);
    }
}
```

`ClassPathXmlApplicationContext` 只是 `ApplicationContext` 的一个实现，用来读取 `ClassPath` 下 XML 文件定义的配置元数据，更多实现查看下图：

![ApplicationContext 的实现](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207031529948.png)

### GenericApplicationContext

`GenericApplicationContext` 和 `ClassPathXmlApplicationContext` 一样都是 `AbstractApplicationContext` 的子类。它更加的灵活，通过不同的 Reader 可以读取不同的配置文件， `GroovyBeanDefinitionReader` 用来读取 Groovy 文件， `XmlBeanDefinitionReader` 用来读取 XML 文件。

```java
@Test
public void testGenericApplicationContext() {
    // 实例化 GenericApplicationContext
    GenericApplicationContext context = new GenericApplicationContext();
    // 通过 XML Reader 加载 bean 定义
    new XmlBeanDefinitionReader(context).loadBeanDefinitions("dao.xml");
    // 需要手动注册bean
    context.refresh();
    // 通过 bean id 获取 bean
    UserDAO userDAO = context.getBean("userDAO", UserDAO.class);
    List<User> users = userDAO.getUsers();
    for (User user : users) {
        System.out.println(user);
    }
}
```

如何你已经确定读取的 XML ，更加简单是使用 `GenericXmlApplicationContext` ，它是 `GenericApplicationContext` 的子类：

```java
@Test
public void testGenericXMLApplicationContext() {
    GenericXmlApplicationContext context = new GenericXmlApplicationContext("dao.xml");

    UserDAO userDAO = context.getBean("userDAO", UserDAO.class);
    List<User> users = userDAO.getUsers();
    for (User user : users) {
        System.out.println(user);
    }
}
```

`GenericXmlApplicationContext` 的构造函数已经完成了对XML解析和注册：

```java
public GenericXmlApplicationContext(String... resourceLocations) {
    load(resourceLocations);
    refresh();
}
```

## 实例化 Beans

### 通过构造函数实例化

`UserDAO` 类 bean 的定义：

```xml
<bean id="userDAO" class="com.jojojotarou.springframeworkiocxml.dao.UserDAO"></bean>
```

本质上，Spring 容器调用 `UserDAO` 的无参数构造函数实例化 bean ，即 `UserDAO userDAO = new UserDAO();`

### 通过静态（static）工厂方法实例化

单例类的构造函数往往是 `private` 的，它们会通过暴露一个 `static` 方法来获取其类对象。

```java
public class StaticFactoryMethod {
    private static StaticFactoryMethod staticFactoryMethod = new StaticFactoryMethod();
    private StaticFactoryMethod() {
    }
    public static StaticFactoryMethod createInstance() {
        return staticFactoryMethod;
    }
}
```

`<bean>` 标签的 `factory-method` 属性允许我们指定创建 bean 调用的方法：

```xml
<!-- factory.xml -->
<bean id="staticFactoryMethod" class="com.jojojotarou.springframeworkiocxml.factory.StaticFactoryMethod"
        factory-method="createInstance"></bean>
```

测试代码：

```java
@Test
public void testStaticFactoryMethod() {
    ApplicationContext context = new ClassPathXmlApplicationContext("factory.xml");

    StaticFactoryMethod staticFactoryMethod = context.getBean("staticFactoryMethod", StaticFactoryMethod.class);
    System.out.println(staticFactoryMethod);
}
// 输出
// com.jojojotarou.springframeworkiocxml.factory.ClientService@58cbafc2
```

### 通过实例工厂方法实例化

```java
public class ClassA {
    private String str;
    // 省略 getter 和 setter 方法
}
public class ClassB {
    private String str;
    // 省略 getter 和 setter 方法
}

public class InstanceFactoryMethod {
    private static ClassA classA = new ClassA();
    private static ClassB classB = new ClassB();
    public ClassA createClassA() {
        classA.setStr("ClassA create by InstanceFactoryMethod");
        return classA;
    }
    public ClassB createClassB() {
        classB.setStr("ClassB create by InstanceFactoryMethod");
        return classB;
    }
}
```

`<bean/>` 的 `factory-bean` 和 `factory-method` 的含义是：id 为 `classA` 的 bean 由 id 为 `instanceFactoryMethod` 的 bean 的 `createClassA()` 方法生成。

```xml
<!-- factory.xml -->
<bean id="instanceFactoryMethod" class="com.jojojotarou.springframeworkiocxml.factory.InstanceFactoryMethod"/>
<bean id="classA" class="com.jojojotarou.springframeworkiocxml.factory.ClassA" factory-bean="instanceFactoryMethod"
        factory-method="createClassA"/>
<bean id="classB" class="com.jojojotarou.springframeworkiocxml.factory.ClassB" factory-bean="instanceFactoryMethod"
        factory-method="createClassB"/>
```

测试代码：

```java
@Test
public void testInstanceFactoryMethod() {
    ApplicationContext context = new ClassPathXmlApplicationContext("factory.xml");

    ClassA classA = context.getBean("classA", ClassA.class);
    System.out.println(classA.getStr());

    ClassB classB = context.getBean("classB", ClassB.class);
    System.out.println(classB.getStr());
}
// 输出
// ClassA create by InstanceFactoryMethod
// ClassB create by InstanceFactoryMethod
```

### 内部类配置

可以用 `$` 或者 `.` 表示 `static` 内部类，例如：`com.example.SomeThing$OtherThing` 或者 `com.example.SomeThing.OtherThing`.
