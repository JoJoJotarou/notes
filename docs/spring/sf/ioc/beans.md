## Bean Scopes

> 💡 所谓作用域即有效范围

在 Spring 中 [Bean 的作用域](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-scopes)默认有 6 个，其中 4 个是 Web 相关的，当然 Spring 还允许我们[自定义 Scope](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-scopes-custom)。

| 作用域      | 描述                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| singleton   | 默认值，即在 Spring 容器中 bean 只会实例化一次                         |
| prototype   | bean 可以实例化任意数量（在 getBean()调用或注入时，都会创建新的 bean） |
| request     | 仅适用 Web，表示每一个 HTTP 请求都创建 bean                            |
| session     | 仅适用 Web，表示每一个 session 都创建 bean                             |
| application | 仅适用 Web，表示 bean 在整个 web 应用的生命周期中只创建一次            |
| websocket   | 仅适用 Web，表示 bean 在整个 websocket 的生命周期中只创建一次          |

### singleton scope

![singleton scope](https://docs.spring.io/spring-framework/docs/5.3.11/reference/html/images/singleton.png)

- 基于 XML：

```xml
<bean id="accountService" class="com.something.DefaultAccountService"/>

<!-- scope="singleton" 是默认写不写都行 -->
<bean id="accountService" class="com.something.DefaultAccountService" scope="singleton"/>
```

- 基于 Java Configuration（正常定义 bean 即可）：

```java{3-6}
@Bean
public User user() {
    return new User();
}
```

::: tip 单例模式和 Spring Bean Singleton Scope 的区别

- **单例模式**是指单例有且只有一个实例对象。
- **Spring Bean Singleton Scope** 是指相同 id 的 bean 有且只有一个，即一个类可以有多个 bean 但是它们 id 不能相同。
:::

### prototype scope

![prototype scope](https://docs.spring.io/spring-framework/docs/5.3.11/reference/html/images/prototype.png)

- 基于 XML：

```xml
<bean id="accountService" class="com.something.DefaultAccountService" scope="prototype"/>
```

- 基于 Java Configuration：

```java{1}
@Scope("prototype")
@Bean
public User user() {
    return new User();
}
```

注意：

- Spring 不管理原型 bean 的完整生命周期，若 prototype 的 bean 持有资源需要手动清理或关闭。要让 Spring 容器释放原型作用域 bean 持有的资源，请尝试使用[自定义 bean 后处理器](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-extension-bpp)，它保存对 bean 的引用。(案例：todo...)

    ::: details 自定义 bean 后处理器释放 prototype bean 持有的资源
    todo ...
    :::

- 当 singleton beans 依赖 prototype beans ，也只会依赖注入一次，如果希望每次获取 singleton beans 时，prototype beans 都是新的，可以使用[方法注入（Method Injection）](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-method-injection)。(案例：todo...)

    ::: details 使用方法注入（Method Injection）让每次获取 singleton beans 时，prototype beans 都是新的
    todo ...
    :::

### Request, Session, Application, and WebSocket Scopes

`request` 、 `session` 、 `application` 和 `websocket` scopes 仅在使用关于 web 的 Spring `ApplicationContext` 实现（例如 `XmlWebApplicationContext` ）。 如果将这些作用域与常规 Spring IoC 容器（例如 `ClassPathXmlApplicationContext` ）一起使用，则会抛出一个 `IllegalStateException` 异常。

### 自定义 scopes

todo ...

## Lazy-initialized Beans

默认情况下，Spring IoC 容器会在启动时就完成 ==**singleton**== beans 的实例化，若有需求不希望如此，可以在定义 beans 时告诉 Spring IoC 容器，这样容器不会在启动时创建被标记的 beans ，而是等到第一次请求被标记 beans 时创建。

::: tip
但是，当延迟初始化的 bean 是未延迟初始化的单例 bean 的依赖项时，ApplicationContext 会在启动时创建延迟初始化的 bean，因为它必须满足单例的依赖项。
:::

基于 Java Configuration，使用 `@Lazy` 注解 ：

```java{3}
@Configuration
public class AppConfig {
    @Lazy
    @Bean
    public User user() {return new User();}
}
```

基于 XML 配置，可以使用 `lazy-init="true"`：

```xml
<bean id="lazy" class="com.something.ExpensiveToCreateBean" lazy-init="true"/>
<bean name="not.lazy" class="com.something.AnotherBean"/>
```

## 生命周期

![bean 的生命周期](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207181213272.png)
