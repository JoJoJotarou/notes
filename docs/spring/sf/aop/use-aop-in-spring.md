# Spring AOP 的使用

基于 Spring Framework 的项目，想要使用 Spring AOP， 可以
通过如下方式定义 AOP ：

- 基于 XML
- 基于 @AspectJ 注解

::: tip
[基于 XML 配置 Spring AOP](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-schema) 不是本文关注点，仅少量提及。
:::

## 启用 @AspectJ 支持

@Aspect 注解是 AspectJ 5  的一部分，Spring 支持来自 AspectJ 的注解，并使用 AspectJ 提供的库进行切入点解析和匹配。要想使用 @Aspect 等注解，必须导入 AspectJ 的 aspectjweaver.jar（1.8 或更高版本）以满足 Spring AOP 的依赖：

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.9.1</version>
</dependency>
```

配置类型添加 `@EnableAspectJAutoProxy` 以启用对 `@AspectJ` 注解的支持：

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

}
```

::: info 基于 XML 的配置，添加 `<aop:aspectj-autoproxy/>` 标签以启用 @AspectJ 支持

💡使用 aop 命名空间，需要添加 [AOP Schema](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#xsd-schemas-aop)

```xml
<aop:aspectj-autoproxy/>
```

:::

## 定义切面（Aspect）

定义一个切面需要满足以下 2 个条件：

- 切面类被 `@Aspect` 注解修饰
- 切面类是一个 bean

```java
@Aspect
public class MyAspect$1 {
}

@Configuration
@EnableAspectJAutoProxy
public class AppConfig {
    @Bean
    public MyAspect$1 myAspect$1() {
        return new MyAspect$1();
    }
}
```

基于 XML 的配置 bean：

```xml
<bean id="myAspect$1" class="com.jojojotarou.springframeworkaopbasedannotation.aspect.MyAspect$1">
    <!-- configure properties of the aspect here -->
</bean>
```

更简单的方式是基于组件扫描注册 bean：

```java
@Aspect
@Component
public class MyAspect$1 {
}
```

## 定义切入点（Pointcut）

**Spring AOP 仅支持 Spring Bean 的方法作为连接点**，因此可以将切入点视为匹配到的 Spring Bean 上的方法。

切入点声明有两部分：一个包含名称和任何参数的签名方法，以及一个切入点表达式，

在AOP的 `@AspectJ` 注解风格中，切入点签名由正则表达式定义，切入点表达式使用 `@Pointcut` 注解表示（作为切入点签名的方法必须有一个void返回类型）。

```java
@Pointcut("execution(* transfer(..))") // the pointcut expression
private void anyOldTransfer() {} // the pointcut signature
```

切入点表达式：

![](https://img-blog.csdnimg.cn/20210406205453589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM5MzY4MDA3,size_16,color_FFFFFF,t_70)

`execution` 表示匹配可执行方法，[更多标识符](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-pointcuts-designators)：

返回类型模式（前面代码片段中的 ret-type-pattern）、名称模式和参数模式之外的所有部分都是可选的。

```xml
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern?name-pattern(param-pattern)  throws-pattern?)
```

[Spring 提供的例子](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-pointcuts-examples)

## 定义通知（Advice）

### 前置通知

通过 `@Before` 注解定义，在连接点方法执行之前执行。

写法1：

```Java
@Before("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget1.targetMethod*(..))")
public void simpleBeforeAdvice2() {
    System.out.println("Before Advice with execution expression");
}
```

写法2：

```Java
@Pointcut("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget1.targetMethod*(..))")
public void simplePointcut() {
}

@Before("simplePointcut()")
public void simpleBeforeAdvice1() {
    System.out.println("Before Advice");
}
```

### 后置通知

通过 `@AfterReturning` 注解定义，只有当连接点方法正常结束才会被执行。

```java
@AfterReturning("simplePointcut()")
public void simpleAfterReturningAdvice() {
    System.out.println("AfterReturning Advice");
}
```

可以获取连接点 `@AfterReturning` 的 `returning` 参数返回的结果：

```java
@AfterReturning(
        pointcut = "simplePointcut()",
        // 💡 将目标方法返回值绑定到通知方法名称为 retVal 的参数上
        returning = "retVal"
)
public void simpleAfterReturningAccessReturnValueAdvice(Object retVal) {
    System.out.println("AfterReturning Access Return Value Advice");
    System.out.println(retVal);
}
```

### 异常通知

通过 `@AfterThrowing` 注解定义，只有当连接点方法抛出异常才会被执行。

```java
@AfterThrowing("simplePointcut()")
public void simpleAfterThrowingAdvice() {
    System.out.println("After Throwing Advice");
}
```

可以获取连接点 `@AfterThrowing` 的 `throwing` 参数返回的结果：

```java
@AfterThrowing(
        pointcut = "simplePointcut()",
        // 💡 将目标方法抛出的异常绑定到通知方法名称为 ex 的参数上
        throwing = "ex"
)
public void simpleAfterThrowingReturnValueAdvice(RuntimeException ex) {
    System.out.println("After Throwing Return Value Advice");
    System.out.println(ex.getMessage());
}
```

### 最终通知

通过 `@After` 注解定义，无论目标方法是否正常结束该通知都会被执行。

```java
@After("simplePointcut()")
public void simpleAfterFinalAdvice() {
    System.out.println("After Final Advice");
}
```

### 环绕通知

通过 `@Around` 注解定义，定义环绕通知的方法应将 Object 声明为其返回类型，并且该方法的第一个参数必须是 ProceedingJoinPoint 类型。

```java
@Around("simplePointcut()")
public Object simpleAroundAdvice(ProceedingJoinPoint pjp) throws Throwable {
    // 在其他通知之前执行
    System.out.println("Around Advice Before");
    // 其他通知以及目标方法的集合
    Object obj = pjp.proceed();
    // 在其他通知之后执行
    System.out.println("Around Advice After");
    return obj;
}
```

### JoinPoint

任意类型的通知方法都可以将 `org.aspectj.lang.JoinPoint` 类型的参数声明为它的第一个参数。特殊的是环绕通知需要 `ProceedingJoinPoint` 声明为它的第一个参数，它是 `JoinPoint` 的自子类。

`JoinPoint` 提供如下方法:

- getArgs(): 返回方法参数。
- getThis(): 返回代理对象。
- getTarget(): 返回目标对象。
- getSignature(): 返回当前通知的方法的描述。
- toString(): 打印通知的方法描述。

```java
@Before("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget2.targetMethod*(..))")
public void simpleBeforeAdvice1(JoinPoint jp) {
    for (Object obj : jp.getArgs()) {
        System.out.println("arg: " + obj);
    }
    System.out.println(">>>>>>>>>>>>>>>>>>>>>");
    System.out.println(jp.getThis());
    System.out.println(jp.getTarget());
    System.out.println(jp.getSignature());
    System.out.println(jp.getArgs()[0]);
    System.out.println(jp);
}
```

### 通过表达式传递参数给通知

除了通过 `JoinPoint` 获取目标方法的参数，还可以通过通知方法中的参数绑定，需要于切入点表达式中使用的名称和切入点方法签名中声明的参数名称的匹配。

```java
@Aspect
public class MyAspect3 {

    // 切入点要满足以下 2 层含义：
    // 1. 匹配限定符为 public、任意返回值、 com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget3 类 targetMethod开头的方法、任意类型、数量的参数
    // 2. 方法的第一参数类型是 MyTarget3.User
    @Pointcut("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget3.targetMethod*(..)) && args(user,..)")
    // pointcut 参数名 user 与表达式 args 的 user 匹配
    public void pointcut(MyTarget3.User user) {
    }

    /**
     * Before 写法一：与 @Pointcut 结合使用
     *
     * @param user
     */
    @Before(value = "pointcut(user)", argNames = "user")
    public void simpleBeforeAdvice1(MyTarget3.User user) {
        System.out.println("@Before 写法1");
        System.out.println(user);
    }

    /**
     * Before 写法二: 不与 @Pointcut 结合使用
     *
     * @param user
     */
    @Before("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget3.targetMethod*(..)) && args(user,..)")
    public void simpleBeforeAdvice2(JoinPoint jp, MyTarget3.User user) {
        System.out.println("@Before 写法2");
        System.out.println(user);
    }
}

public class MyTarget3 {

    static public class User {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        @Override
        public String toString() {
            return "User{" +
                    "name='" + name + '\'' +
                    '}';
        }
    }

    public void targetMethod1(User user) {
        System.out.println("调用目标方法1 ...");
    }

    public void targetMethod2() {
        System.out.println("调用目标方法2 ...");
    }

    public void targetMethod3(User user, String a) {
        System.out.println("调用目标方法3 ...");
    }
}


class Test3 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        MyTarget3 myTarget3 = (MyTarget3) context.getBean("myTarget3");
        MyTarget3.User user = new MyTarget3.User();
        user.setName("testName");
        myTarget3.targetMethod1(user);
        System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>");
        myTarget3.targetMethod2();
        System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>");
        myTarget3.targetMethod3(user, "123");
    }
}
// 输出结果：
// @Before 写法1
// User{name='testName'}
// @Before 写法2
// User{name='testName'}
// 调用目标方法1 ...
// >>>>>>>>>>>>>>>>>>>>>>>>>>
// 调用目标方法2 ...
// >>>>>>>>>>>>>>>>>>>>>>>>>>
// @Before 写法1
// User{name='testName'}
// @Before 写法2
// User{name='testName'}
// 调用目标方法3 ...
```

### 参数解析机制

todo

## 通知（Advice）执行顺序

在一个切面中不同类型的通知方法如下图所示：

![一个切面中通知（Advice）执行顺序](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207102035300.png)

## 切面（Aspect）执行顺序

当多个切面作用于同一个连接点，切面执行先后顺序是不知道的，可以 `@Order(org.springframework.core.annotation.Order)` 定义切面的执行顺序。

- 仅在切面类上注释有效
- 数字越小优先级别越高

::: tip
当在同一个 `@Aspect` 类中定义的两条相同类型的通知（例如，两个`@After` 通知方法）都需要在同一个连接点运行时，排序是不确定的（因为无法检索源通过 javac 编译类的反射的代码声明顺序）。
若有排序的需求，则将通知定义为单独的切面，在通过 `@Order` 排序即可。
:::

## Introductions

<https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-schema-introductions>

不是很明白怎么翻译，看使用是给接口，定义默认实现类

TODO：案例也不是很明白

## 切面实例化模型

<https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-instantiation-models>
TODO: 不是很明白
