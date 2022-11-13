# 依赖注入（DI）

三种常见的依赖注入（Dependency Injection）方式：

- 构造函数注入（ Construct Dependency Injection ）
- Setter 注入 （ Setter Dependency Injection ）
- 注解注入（ Annotation Dependency Injection ）

::: tip
通过注解配置的注入在 XML 配置的注入之前执行。 因此，XML 配置的注入会覆盖注解配置注入。
:::

## 构造函数注入

下面是一个使用构造函数注入依赖的类：

```java
public class UserServiceConstructorImpl implements UserService {
    private final UserDAO userDAO;
    public UserServiceConstructorImpl(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    @Override
    public List<User> getUsers() {
        return userDAO.getUsers();
    }
}
```

通过 `<constructor-arg>` 标签的 `ref` 属性配置当前 bean 要通过构造函数注入另一个 bean 的 id：

```xml
<!-- dao.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="userDAO" name="dao" class="com.jojojotarou.springframeworkiocxml.dao.UserDAO"/>

</beans>

<!-- services.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 导入dao.xml，当容器加载 services.xml 会自动加 dao.xml -->
    <import resource="dao.xml"/>
    <bean id="userServiceConstructorImpl"
          class="com.jojojotarou.springframeworkiocxml.services.UserServiceConstructorImpl">
        <!-- ref：表示注入 id=userDAO 的 bean -->
        <constructor-arg ref="userDAO"/>
    </bean>
</beans>
```

测试代码：

```java
@Test
public void testConstructorDI() {
    // 创建 Spring IoC 容器
    // 在 services.xml 中使用了 import 标签，这里只传 services.xml，Spring 容器也会加载 dao.xml
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("services.xml");

    // 从容器中获取名为 userServiceConstructorImpl 的 Bean
    UserService userService = applicationContext.getBean("userServiceConstructorImpl", UserService.class);
    List<User> users = userService.getUsers();

    for (User user : users) {
        System.out.println(user);
    }
}
```

::: info 💡 注入基本类型，则通过 `<constructor-arg>` 标签的 `value` 属性：

```xml
<!-- 伪代码  -->
<bean id="userServiceConstructorImpl" class="com.jojojotarou.springframeworkiocxml.services.UserServiceConstructorImpl">
    <constructor-arg value="xiaoming"></constructor-arg>
    <constructor-arg value="18"></constructor-arg>
</bean>
```

:::

::: details ☕ 等效的 Java Configuration 配置：

```java
@Configuration
public class DAOConfig {
    @Bean
    public UserDAO userDAO() {
        return new UserDAO();
    }

}

@Configuration
// 等效于 <import resource="dao.xml"/>
@Import({DAOConfig.class})
public class ServicesConfig {

    // 表示依赖 UserDAO 的 bean
    @Bean
    public UserServiceConstructorImpl userServiceConstructor(UserDAO userDAO) {
        return new UserServiceConstructorImpl(userDAO);
    }
}

// 测试代码
class TestUserServiceConstructorImpl {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(ServicesConfig.class);
        UserServiceConstructorImpl bean = ctx.getBean(UserServiceConstructorImpl.class);
        for (User user : bean.getUsers()) {
            System.out.println(user);
        }
    }
}
```

:::

### 构造函数参数解析

**当有多个 `<constructor-arg>` 时，Spring 容器默认按照从上而下的顺序注入**。
通过 `<constructor-arg>` 的 `type` 、 `name` 、`index` 去明确。下面是需要通过构造器注入基本类型的类：

```java
public class UserServiceConstructorBasicTypeImpl implements UserService {
    private final User user;

    public UserServiceConstructorBasicTypeImpl(int id, String name, String password) {
        this.user = new User(id, name, password);
    }

    @Override
    public List<User> getUsers() {
        return Arrays.asList(this.user);
    }
}
```

以下分别是 `type` 、 `name` 、`index`注入的定义：

```xml
<!-- services.xml -->
<!-- 通过构造函数类型匹配，当出现相同type时但还需要按照构造函数参数的顺序 -->
<bean id="userServiceConstructorBasicTypeImpl"
          class="com.jojojotarou.springframeworkiocxml.services.UserServiceConstructorBasicTypeImpl">
    <constructor-arg type="int" value="1"/>
    <constructor-arg type="java.lang.String" value="小绿"/>
    <constructor-arg type="java.lang.String" value="password1"/>
</bean>

<!-- 通过构造函数参数的名字匹配 -->
<bean id="userServiceConstructorBasicTypeImpl"
          class="com.jojojotarou.springframeworkiocxml.services.UserServiceConstructorBasicTypeImpl">
    <constructor-arg name="name" value="小绿"/>
    <constructor-arg name="password" value="password1"/>
    <constructor-arg name="id" value="1"/>
</bean>

<!-- 通过构造函数参数的顺序匹配 -->
<bean id="userServiceConstructorBasicTypeImpl"
        class="com.jojojotarou.springframeworkiocxml.services.UserServiceConstructorBasicTypeImpl">
    <constructor-arg index="1" value="小绿"/>
    <constructor-arg index="2" value="password1"/>
    <constructor-arg index="0" value="1"/>
</bean>
```

测试代码：

```java
@Test
public void testConstructorBasicTypeDI() {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("services.xml");

    UserService userService = applicationContext.getBean("userServiceConstructorImpl", UserService.class);
    List<User> users = userService.getUsers();

    for (User user : users) {
        System.out.println(user);
    }
}
```

::: tip
Java Configuration 配置没有构造函数参数解析，我们必须在创建时提供正确参数。

```java
@Configuration
@Import({DAOConfig.class})
public class ServicesConfig {
    @Bean
    public UserServiceConstructorBasicTypeImpl userServiceConstructorBasicType() {
        return new UserServiceConstructorBasicTypeImpl(1, "jojojo", "password");
    }
}
```

:::

### 静态工厂方法、实例工厂方法参数注入

静态工厂方法、实例工厂方法参数注入，算是比较特殊的构造函数注入，这里以静态工厂方法为例。

```java
public class StaticFactoryMethodDI {
    private static StaticFactoryMethodDI staticFactoryMethod = new StaticFactoryMethodDI();

    private StaticFactoryMethodDI() {
    }

    public static StaticFactoryMethodDI createInstance(String test) {
        System.out.println(test);
        return staticFactoryMethod;
    }
}
```

```xml
<!-- factory.xml -->
<bean id="staticFactoryMethodDI" class="com.jojojotarou.springframeworkiocxml.factory.StaticFactoryMethodDI"
          factory-method="createInstance">
        <!-- 注入静态工厂方法的参数 -->
        <constructor-arg value="this is test"/>
    </bean>
```

测试代码：

```java
@Test
public void testStaticFactoryMethodDI() {
    ApplicationContext context = new ClassPathXmlApplicationContext("factory.xml");

    StaticFactoryMethodDI staticFactoryMethodDI = context.getBean("staticFactoryMethodDI", StaticFactoryMethodDI.class);
}
// 输出结果: this is test
```

::: details ☕ 等效的 Java Configuration 配置：

```java
@Configuration
public class FactoryConfig {
    @Bean
    public StaticFactoryMethodDI staticFactoryMethodDI() {
        return StaticFactoryMethodDI.createInstance("static factory method");
    }
}
```

:::

## Setter 注入

下面是一个使用 Setter 方法注入的类（**需要强调的是 `setter` 方法必须存在，即便 `UserDAO` 的访问修饰符是 `public` 也必须存在**）：

```java
public class UserServiceSetterImpl implements UserService {
    private UserDAO userDAO;

    @Override
    public List<User> getUsers() {
        return userDAO.getUsers();
    }

    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
}
```

通过 `<property>` 标签的注入：

- `name`：当前 bean 中属性的名称
- `ref`：当前 bean 的属性要通过 setter 方法注入另一个 bean 的 id

```xml
<!-- services.xml -->
<bean id="userServiceSetterImpl" class="com.jojojotarou.springframeworkiocxml.services.UserServiceSetterImpl">
    <property name="userDAO" ref="userDAO"/>
</bean>
```

::: info 💡 注入基本类型，则通过 `<property>` 标签的 `value` 属性：

```xml
<!-- 伪代码  -->
<bean id="userServiceSetterImpl" class="com.jojojotarou.springframeworkiocxml.services.UserServiceSetterImpl">
    <property name="name" value="xiaoming"></property>
</bean>
```

:::

测试代码：

```java
@Test
public void testSetterDI() {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("services.xml");
    UserService userService = applicationContext.getBean("userServiceSetterImpl", UserService.class);
    List<User> users = userService.getUsers();
    for (User user : users) {
        System.out.println(user);
    }
}
```

## 注解注入（自动装配）

仅使用 XML 配置下（不扫描注解的情况下）， 并不能使用 `@Autowried` 注解注入，但是 `<bean>` 标签有 `autowire` 属性来实现自动装配。本质上还是构造函数注入或 setter 注入，所以必须存在 setter 方法或构造方法。

autowire 有 4 个属性：

| autowire 属性值 |                                    说明                                    | 注入目标 |
| :-------------: | :------------------------------------------------------------------------: | :------: |
|     byName      | 根据名称注入，例如 `private UserDAO userDAO` 会注入 `id=userDAO` 的 `bean` |   属性   |
|     byType      |              根据类型注入，当匹配到多个符合条件的类时，会报错              |   属性   |
|    construct    |                    按照 `byType` 注入，与 `byType` 相同                    | 构造函数 |
|       no        | 不自持自动注入，默认值，需要通过标签 `<property>`或者 `<constructor>` 配置 |          |

以 `byName` 为例子，`services.xml` 添加如下内容：

```xml
<bean id="userServiceAutowireImpl"
        class="com.jojojotarou.springframeworklearn.services.UserServiceAutowireImpl" autowire="byName">
</bean>
```

`UserServiceAutowireImpl` 实现 `UserService`， `UserDAO` 是 `UserServicePropertyImpl` 的属性，使用 setter 注入。

```java
public class UserServiceAutowireImpl implements UserService {
    private UserDAO userDAO;
    @Override
    public List<User> getUsers() {
        return userDAO.getUsers();
    }
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
}
```

测试代码：

```java
public class ApplicationContextTest {
    @Test
    public void testBeanWithAnnotation() {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("services.xml");

        UserService userService = applicationContext.getBean("userServiceAutowireImpl", UserService.class);
        List<User> users = userService.getUsers();

        for (User user : users) {
            System.out.println(user);
        }
    }
}
```

- [自动装配的限制和缺陷](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-autowired-exceptions)
- 自动装配会被显示的配置（XML）覆盖
- 无法自动装配基本数据类型如 String ，也无法装配 classes

### @Autowired

若在 XML 中开启注解扫描，则可以使用 `@Autowired` 注解（**userDao 的 setter 可以不存在**）：

```java
public class UserServiceAutowiredImpl implements UserService {

    @Autowired
    private UserDAO userDAO;

    @Override
    public List<User> getUsers() {
        return userDAO.getUsers();
    }
}
```

::: info

要在 XML 开启注解扫描需要在 XML 中添加 context 命名空间以及 `<context:component-scan>` 标签（IDEA 中添加 `<context:component-scan/>` 标签，会提示你添加 context 命名空间）

:::

```xml{7}
 <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <import resource="dao.xml"/>
    <!-- 扫描 com.jojojotarou.springframeworkiocxml 包下的所有注解 -->
    <context:component-scan base-package="com.jojojotarou.springframeworkiocxml"></context:component-scan>
    <!--  @Autowired 注解，自动装配  -->
    <bean id="userServiceAutowiredImpl"
            class="com.jojojotarou.springframeworkiocxml.services.UserServiceAutowiredImpl">
    </bean>
</beans>
```

测试代码：

```java
@Test
public void testAutowiredDI() {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("services.xml");

    UserService userService = applicationContext.getBean("userServiceAutowiredImpl", UserService.class);
    List<User> users = userService.getUsers();

    for (User user : users) {
        System.out.println(user);
    }
}
```

:::details ☕ 等效的 Java Configuration 配置：

不需要添加 `@ComponentScan` 之类的注解在 `ServicesConfig` 类上，`@Autowired` 也是有效的，为什么不知道。

```java
@Configuration
@Import({DAOConfig.class})
public class ServicesConfig {
    @Bean
    public UserServiceAutowiredImpl userServiceAutowired() {
        return new UserServiceAutowiredImpl();
    }
}
```

:::

## 方法注入（Method Injection）

先看一个例子， `RandomNumber` 类每次创建都会得到一个新的随机数，并通过 `RandomNumberService` 类将这个服务暴露出去，我们希望每次调用 `RandomNumberService.getRn()` 都可以获得不同的随机数（先不要管代码是否合理）：

```java
/**
 * 生成一个随机数
 */
public class RandomNumber {
    double rn;

    public RandomNumber() {
        this.rn = Math.random();
    }

    public double getRn() {
        return rn;
    }
    public void setRn(double rn) {
        this.rn = rn;
    }
}
/**
 * 获取一个随机数
 */
public class RandomNumberService {
    private final RandomNumber randomNumber;

    public RandomNumberService(RandomNumber randomNumber) {
        this.randomNumber = randomNumber;
    }

    public double getRn() {
        return this.randomNumber.getRn();
    }
}
```

于是我们分别在 dao.xml 和 services.xml 中定义 `RandomNumber` 和 `RandomNumberService` 的 Bean：

```xml
<!-- domain.xml -->
<bean id="randomNumber" class="com.jojojotarou.springframeworkiocxml.domain.RandomNumber"/>

<!-- services.xml -->
<import resource="domain.xml"/>
<bean id="randomNumberService" class="com.jojojotarou.springframeworkiocxml.services.RandomNumberService">
        <constructor-arg ref="randomNumber"/>
    </bean>
```

但是通过测试代码发现 5 次输出结果的都是相同的，并非预期那样。

```java
@Test
public void testRandomNumberService() {
    GenericXmlApplicationContext context = new GenericXmlApplicationContext("services.xml", "dao.xml");
    RandomNumberService randomNumberService = context.getBean("randomNumberService", RandomNumberService.class);
    for (int i = 0; i < 5; i++) {
        System.out.println(randomNumberService.getRn());
    }
}
// 输出结果：
// 0.2751103125988682
// 0.2751103125988682
// 0.2751103125988682
// 0.2751103125988682
// 0.2751103125988682
```

**这是因为 Spring 容器 bean 的默认 scopes 是 singleton 只会实例化 bean 一次！** 怎么办呢，[Spring Framework 文档](https://www.geekdoc.top/docs/languages/java/spring-framework/5.3.11/reference/html/core.html#beans-factory-method-injection)提到了三种方法：

- 实现 `ApplicationContextAware` 接口，放弃控制反转，从 Spring 容器获取依赖，并有针对性的改变希望改变的属性。
- Lookup Method Injection
- Arbitrary Method Replacement

### 实现 ApplicationContextAware

ApplicationContextAware 接口可以帮助我们获取到 ApplicationContext

```java
public class RandomNumberApplicationContextAwareService implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    public double getRn() {
        // 从 Spring 容器获取依赖
        RandomNumber randomNumber = this.createRandomNumber();
        // 将希望改变的属性修改
        randomNumber.setRn(Math.random());
        return randomNumber.getRn();
    }

    protected RandomNumber createRandomNumber(){
        return this.applicationContext.getBean("randomNumber", RandomNumber.class);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
```

::: warning
Spring 并不推荐使用这种方式，因为业务代码知道并耦合到 Spring Framework。 方法注入（Method Injection）是 Spring IoC 容器的一个有点高级的特性，可以让你干净地处理这个用例（_个人感觉方法注入不是很好理解，方法重写的可能更容易理解_）。
:::

### 方法注入：Lookup Method Injection

查找方法注入是容器覆盖容器管理的 bean 上的方法并返回容器中另一个命名 bean 的查找结果的能力。**Spring Framework 通过使用 CGLIB 库的字节码动态生成覆盖该方法的子类来实现此方法注入**（ **AOP 时会谈到 CGLIB 动态代理**）。

使用限制:

- 需要覆盖的方法必须是 `abstract` 的，那么就要求类必须是 `abstract` ，同时方法和类型也不能是 `final` 的。
- 另一个关键限制是 Lookup Method Injection 不适用于工厂方法，尤其不适用于配置类中的 @Bean 定义的 bean ，因为在这种情况下，容器不负责创建实例（因为配置是我们通过 `new` 创建的 bean），因此无法动态创建运行时生成的子类。

```java
public abstract class RandomNumberLookupMethodInjectionService {

    public double getRn() {
        RandomNumber randomNumber = this.createRandomNumber();
        randomNumber.setRn(Math.random());
        return randomNumber.getRn();
    }

    protected abstract RandomNumber createRandomNumber();
}
```

XML 通过 `<lookup-method/>` 标签定义：

```xml
<bean id="randomNumberLookupMethodInjectionService"
        class="com.jojojotarou.springframeworkiocxml.services.RandomNumberLookupMethodInjectionService">
    <lookup-method name="createRandomNumber" bean="randomNumber"/>
</bean>
```

测试代码：

```java
@Test
public void testRandomNumberLookupMethodInjectionService() {
    ApplicationContext context = new ClassPathXmlApplicationContext("services.xml");
    RandomNumberLookupMethodInjectionService service = context.getBean("randomNumberLookupMethodInjectionSevice", RandomNumberLookupMethodInjectionService.class);
    for (int i = 0; i < 5; i++) {
        System.out.println(service.getRn());
    }
}
```

#### @Lookup

如果使用注解会更加简单：

```java
public abstract class RandomNumberLookupService {

    public double getRn() {
        RandomNumber randomNumber = this.createRandomNumber();
        randomNumber.setRn(Math.random());
        return randomNumber.getRn();
    }

    @Lookup("randomNumber")
    protected abstract RandomNumber createRandomNumber();
}
```

更常用是不写 `"randomNumber"` 直接使用 `@Lookup` ，Spring 容器会按照抽象方法的返回值类型解析，就像这样：

```java
@Lookup
protected abstract RandomNumber createRandomNumber();
```

::: tip
💡 注意：在 XML 开启扫描注解需要添加 context 命名空间以及 `<context:component-scan>` 标签（IDEA 中添加 `<context:component-scan/>` 标签，会提示你添加 context 命名空间），在使用 `@Autowired 时已开启`，这里不用重复写了。

```xml
<context:component-scan base-package="com.jojojotarou.springframeworkiocxml"></context:component-scan>
```

:::

测试代码：

```java
@Test
public void testRandomNumberLookupService() {
    ApplicationContext context = new ClassPathXmlApplicationContext("services.xml");
    RandomNumberLookupService service = context.getBean("randomNumberLookupSevice", RandomNumberLookupService.class);
    for (int i = 0; i < 5; i++) {
        System.out.println(service.getRn());
    }
}
```

### 方法注入：Arbitrary Method Replacement

> 🚨 仅能通过 XML 配置，大多数项目都不在使用 XML 配置，所以也不是很推荐。

与 Lookup Method Injection 一样 Arbitrary Method Replacement 具有覆盖某个类方法的能力，看下面的例子：

```java
public class RandomNumberArbitraryMethodReplacementService {
    // 需要的覆盖的方法
    public double getRn() {
        System.out.println("real method");
        return 0d;
    }
}

// 实现 org.springframework.beans.factory.support.MethodReplacer 的 reimplement 方法
public class ReplacementGetRn implements MethodReplacer {
    /**
     * @param obj    the instance we're reimplementing the method for 即 spring 通过 CGLIB 生成的 RandomNumberArbitraryMethodReplacementService 的增强实例
     * @param method the method to reimplement 即 getRn() 方法本身
     * @param args   arguments to the method 即 getRn() 的参数列表
     * @return
     * @throws Throwable
     */
    @Override
    public Object reimplement(Object obj, Method method, Object[] args) throws Throwable {
        System.out.println("relacement method");
        // String arg = (String) args[0];
        return new RandomNumber().getRn();
    }
}
```

```xml
<!-- services.xml -->
<bean id="randomNumberArbitraryMethodReplacementService"
        class="com.jojojotarou.springframeworkiocxml.services.RandomNumberArbitraryMethodReplacementService">
    <replaced-method name="getRn" replacer="replacementGetRn">
        <!-- arg-type 标签表示被覆盖方法的参数，可以多个 -->
        <!-- <arg-type>String</arg-type> -->
    </replaced-method>
</bean>
<bean id="replacementGetRn" class="com.jojojotarou.springframeworkiocxml.util.ReplacementGetRn"/>
```

测试代码：

```java
@Test
public void testRandomNumberArbitraryMethodReplacementService() {
    ApplicationContext context = new ClassPathXmlApplicationContext("services.xml");
    RandomNumberArbitraryMethodReplacementService service = context.getBean("randomNumberArbitraryMethodReplacementService", RandomNumberArbitraryMethodReplacementService.class);
    for (int i = 0; i < 5; i++) {
        System.out.println(service.getRn());
    }
}
// 输出结果
// relacement method
// 0.8494282246127263
// relacement method
// 0.5262111509960541
// relacement method
// 0.7409524003654103
// relacement method
// 0.6396164041553024
// relacement method
// 0.9657132564693228
```

从输出结果来看原本的方法完全被覆盖没有执行。

## 更多

- [注入 `java.util.Properties`](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-value-element)
- [注入父容器的 bean](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-ref-element)
- [注入 inner bean 内部类](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-inner-beans)
- [注入 Collections](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-collection-elements)
- [注入 null 或空字符串](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-null-element)
- [嵌套注入值](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-compound-property-names)
- [`<bean/>` 标签 `depends-on` 属性 - 定义强依赖关系，在当前 Bean 之前初始化依赖 Bean](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-dependson)
- [`<bean/>` 标签 `lazy-init` 属性 - 延迟 Bean 的创建，在第一次请求时创建而非应用启动](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-lazy-init)
