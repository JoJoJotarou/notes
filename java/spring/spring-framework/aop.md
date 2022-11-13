---
title: Spring AOP
date: 2022-07-08
---

## AOP 术语

AOP（Aspect Oriented Programming）意思为面向切面编程。

- **连接点（Join point）**：在 Spring AOP 中，一个连接点总是代表一个方法执行。
- **切入点（Pointcut）**：明确的表示那些连接点需要增强，可以用 AspectJ 表达式匹配。
- **通知（Advice）**：也可以叫增强，在连接点具体执行代码。许多 AOP 框架，包括 Spring，将通知设计成拦截器（interceptor），并将一系列拦截器放在连接点周围，形成通知链（chain）。
- **切面（Aspect）**：切入点连成的面（线）以及通知的集合称为切面。

- **目标对象（Target object）**：切面覆盖到的对象，即具有连接点，且切入点能够匹配的对象。
- **AOP 代理（AOP proxy）**：由 Spring AOP 代理生成的对象，叫代理对象（AOP 代理对象），Spring AOP 代理的实现方式由 JDK 代理和 GBLIB 代理 2 种。
- **编织（Weaving）**：将切面（Aspect）与目标程序链接以创建 Advised 对象。可以在编译时（例如，使用 AspectJ 编译器）、加载时或运行时完成。 Spring AOP 与其他纯 Java AOP 框架一样，在运行时执行编织。

Spring AOP 包括以下类型的通知：

- **前置通知（Before advice）**：在连接点之前运行的通知。
- **后置通知（After returning advice）**：在连接点正常完成后运行的通知。
- **异常通知（After throwing advice）**：如果连接点抛出异常退出，则运行此通知。
- **最终通知（After (finally) advice）**：不管连接点退出的方式（正常或异常返回）都将运行的通知。类似 `try/catch/finally` 的 `finally` 。
- **环绕通知（Around advice）**：环绕通知可以在方法调用之前和之后执行自定义行为。环绕通知可以根据需求选择是运行连接点还是通过返回自己的返回值或抛出异常来缩短增强的方法执行。

## AOP 的实现方式

Spring AOP 有 2 种实现方式：

- JDK 动态代理
- CGLIB 动态代理

<!-- 默认情况下，Spring Framework 仅在类没有实现接口时，使用 CGLIB 动态代理，其他情况使用 JDK 动态代理，大多数情况下，业务类实现一个或者多个接口（提倡使用接口编程）， -->

### AspectJ

### agent

### JDK 动态代理

- JDK 动态代理是 JDK 内置的，使用 [ASM](https://asm.ow2.io/) 动态生成字节码。
- 当目标对象实现了一个或者多个接口时，Spring Framework 使用 JDK 动态代理，且目标类实现的所有接口都被代理。

java.lang.reflect.Proxy 的 newProxyInstance()

代理类实在运行期间生成字节码，传入 ClassLoader 用来加载生成的字节码

- 目标类或目标方法可以是 final 修饰的

```java
public final class UserServiceImpl implements UserService {
}
```

通过 [arthas](https://arthas.aliyun.com/zh-cn/) 反编译出来的 JDK 代理类的 java 文件：

```java
package jdk.proxy2;

import com.jojojotarou.springframeworkaop.services.UserService;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.List;

public final class $Proxy9
extends Proxy
implements UserService {
    private static final Method m0;
    private static final Method m1;
    private static final Method m2;
    private static final Method m3;

    public $Proxy9(InvocationHandler invocationHandler) {
        super(invocationHandler);
    }

    static {
        try {
            m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
            m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
            m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
            m3 = Class.forName("com.jojojotarou.springframeworkaop.services.UserService").getMethod("getUsers", new Class[0]);
            return;
        }
        catch (NoSuchMethodException noSuchMethodException) {
            throw new NoSuchMethodError(noSuchMethodException.getMessage());
        }
        catch (ClassNotFoundException classNotFoundException) {
            throw new NoClassDefFoundError(classNotFoundException.getMessage());
        }
    }

    public final boolean equals(Object object) {
        try {
            return (Boolean)this.h.invoke(this, m1, new Object[]{object});
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final String toString() {
        try {
            return (String)this.h.invoke(this, m2, null);
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final int hashCode() {
        try {
            return (Integer)this.h.invoke(this, m0, null);
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    private static MethodHandles.Lookup proxyClassLookup(MethodHandles.Lookup lookup) throws IllegalAccessException {
        if (lookup.lookupClass() == Proxy.class && lookup.hasFullPrivilegeAccess()) {
            return MethodHandles.lookup();
        }
        throw new IllegalAccessException(lookup.toString());
    }

    public final List getUsers() {
        try {
            return (List)this.h.invoke(this, m3, null);
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
}
```

### CGLIB 动态代理

<https://github.com/cglib/cglib>

- 在 Spring Framework 中，如果目标对象没有实现任何接口，则创建一个 CGLIB 代理。（实际上如果目标对象实现了任意接口 CGLIB 动态代理为其创建代理）
- CGLIB 代理目标类实际是继承目标类，并重写目标类的方法。
- 目标类以及其方法不能是 `final` 的，当目标类是 `final` 时，编译报错、当被代理类的方法时 `final` 时，不会报错，但是没有增强效果。因为它们不能在运行时生成的子类中被覆盖。
- 从 Spring 4.0 开始，代理对象的构造函数不再被调用两次，因为 CGLIB 代理实例是通过 Objenesis 创建的。仅当您的 JVM 不允许绕过构造函数时，您可能会看到来自 Spring 的 AOP 支持的双重调用和相应的调试日志条目。

### 强制使用 CGLIB 代理

- **使用 XML 配置 AOP 时**，在 XML 文件中将 `<aop:config>` 标签的 `proxy-target-class` 属性设置为 `true` ：

```xml
<aop:config proxy-target-class="true">
    <!-- other beans defined here... -->
</aop:config>
```

- **使用 @AspectJ 注解配置 AOP 时**，XML 文件中将 `<aop:aspectj-autoproxy>` 元素的 `proxy-target-class` 属性设置为 `true`

```xml
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

## Java code 方法实现一个 AOP

## AOP 代理机制

<https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-proxying>

先说结论，Spring 在 `DefaultAopProxyFactory` 的 Javadoc 这样描述：

- `AdvisedSupport` 实例满足以下条件之一使用 CGLIB 代理：

  - 设置了optimize标志（设置为 `true` ）
  - 设置了proxyTargetClass标志（设置为 `true` ）
  - 没有指定代理接口

- 其他情况使用 JDK 代理

相关源码：

```java
// 只显示关键代码

Target2 proxy2 = (Target2) proxyFactory2.getProxy();
// 必须主动告诉工厂被代理类实现了什么接口，否则当作没有实现接口
proxyFactory2.setInterfaces(Target2.class.getInterfaces());

// ⬇️调用⬇️
public class ProxyFactory extends ProxyCreatorSupport {
    public Object getProxy() {
        return createAopProxy().getProxy();
    }
}

// ⬇️调用⬇️
public class ProxyCreatorSupport extends AdvisedSupport {
    protected final synchronized AopProxy createAopProxy() {
        if (!this.active) {
            activate();
        }
        return getAopProxyFactory().createAopProxy(this);
    }
}

// ⬇️调用⬇️
public interface AopProxyFactory {
    AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException;
}

// ⬇️实际调用 AopProxyFactory 的唯一实现⬇️
public class DefaultAopProxyFactory implements AopProxyFactory, Serializable {
    @Override
    public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {

        // 🚨🚨 这里是判断使用JDK 代理还是 CGLIB 代理的关键 🚨🚨
        if (!NativeDetector.inNativeImage() &&
                (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config))) {
            Class<?> targetClass = config.getTargetClass();
            if (targetClass == null) {
                throw new AopConfigException("TargetSource cannot determine target class: " +
                        "Either an interface or a target is required for proxy creation.");
            }
            if (targetClass.isInterface() || Proxy.isProxyClass(targetClass) || ClassUtils.isLambdaClass(targetClass)) {
                return new JdkDynamicAopProxy(config);
            }
            return new ObjenesisCglibAopProxy(config);
        }
        else {
            return new JdkDynamicAopProxy(config);
        }
    }

    private boolean hasNoUserSuppliedProxyInterfaces(AdvisedSupport config) {
        Class<?>[] ifcs = config.getProxiedInterfaces();
        return (ifcs.length == 0 || (ifcs.length == 1 && SpringProxy.class.isAssignableFrom(ifcs[0])));
    }
}
```

解释：关键是下面这句代码

```java
if (!NativeDetector.inNativeImage() &&
    (
        config.isOptimize() ||
        config.isProxyTargetClass() ||
        hasNoUserSuppliedProxyInterfaces(config)
    )
) {}
```

- `DefaultAopProxyFactory.createAopProxy` 方法的参数 `AdvisedSupport config` 为 `ProxyConfig` 的子类， `config.isOptimize() || config.isProxyTargetClass()` 实际是看 `ProxyConfig.optimize` 和 `ProxyConfig.proxyTargetClass` , 这两个的默认值都是 `false` 。
- 然后就是 `hasNoUserSuppliedProxyInterfaces(config)` 的结果，若实现接口数即 `AdvisedSupport.interfaces` 大于 0 时就会返回 `false` ，那么表达式不成立，就使用 JDK 代理。所以当 `proxyFactory2.setInterfaces(Target2.class.getInterfaces());` 时，使用 JDK 代理。

> 💡 Spring Boot 默认设置 ProxyConfig.proxyTargetClass 为 `true`（带求证） TODO

测试代码：

```java
public class Aop1 {

    public static void main(String[] args) {

        // 1. 切入点
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression("execution(* foo())");

        // 2. 通知
        MethodInterceptor methodInterceptor = new MethodInterceptor() {
            @Override
            public Object invoke(MethodInvocation invocation) throws Throwable {
                System.out.println("before ...");

                Object obj = invocation.proceed();

                System.out.println("after ...");
                return obj;
            }
        };
        // 3. 切面

        DefaultPointcutAdvisor defaultPointcutAdvisor = new DefaultPointcutAdvisor(pointcut, methodInterceptor);

        // 4. 生成代理

        ProxyFactory proxyFactory1 = new ProxyFactory();
        proxyFactory1.setTarget(new Target1());
        proxyFactory1.addAdvisor(defaultPointcutAdvisor);
        Target1 proxy1 = (Target1) proxyFactory1.getProxy();

        System.out.println(proxy1.getClass());
        proxy1.foo();
        proxy1.bar();

        ProxyFactory proxyFactory2 = new ProxyFactory();
        proxyFactory2.setTarget(new Target2());
        // 必须主动告诉工厂被代理类实现了什么接口，否则当作没有实现接口
        proxyFactory2.setInterfaces(Target2.class.getInterfaces());
        proxyFactory2.addAdvisor(defaultPointcutAdvisor);
        T2 proxy2 = (T2) proxyFactory2.getProxy();

        System.out.println(proxy2.getClass());
        proxy2.foo();
        proxy2.bar();
    }

    static class Target1 {
        public void foo() {
            System.out.println("Target1 foo ...");
        }

        public void bar() {
            System.out.println("Target1 bar ...");
        }
    }

    interface T2 {
        public void foo();

        public void bar();
    }

    static class Target2 implements T2 {
        @Override
        public void foo() {
            System.out.println("Target2 foo ...");
        }

        @Override
        public void bar() {
            System.out.println("Target2 bar ...");
        }
    }
}
```

输出：

```text
class com.jojojotarou.springframeworkaop.java_code_aop.Aop1$Target1$$EnhancerBySpringCGLIB$$b7dddb34
before ...
Target1 foo ...
after ...
Target1 bar ...
class com.jojojotarou.springframeworkaop.java_code_aop.$Proxy0
before ...
Target2 foo ...
after ...
Target2 bar ...
```

## AspectJ 切入点表达式

### 方法名匹配

![切入点表达式](https://pdai-1257820000.cos.ap-beijing.myqcloud.com/pdai.tech/public/_images/spring/springframework/spring-framework-aop-7.png)

&&：要求连接点同时匹配两个切入点表达式
||：要求连接点匹配任意个切入点表达式
!:：要求连接点不匹配指定的切入点表达式

### 方法注解匹配

## 切面代理创建的时间

一般情况下（无循环依赖），在 bean 初始化后创建代理。

执行 Bean1 构造函数 → 执行 Bean1 初始化方法 → **生成 Bean1 AOP 代理对象** → 执行 Bean2 构造函数 → 执行 Bean2 setBean1(Bean1 AOP 代理对象) → 执行 Bean2 初始化方法

```java
// 切点表达式是：execution(* foo()) 所以只有 Bean1 会被代理

public class Bean1(){
    public Bean2(){
        Sysout.out.print("Bean2()");
    }
    public void foo(){}
    @PostConstruct public void init(){
        Sysout.out.print("bean1 init ...");
    }
}

public class Bean2(){
    public Bean2(){
        Sysout.out.print("Bean2()");
    }
    privaet Bean1 bean1();
    @Autowired
    public void setBean1(Bean1 bean1){
        this.bean1 = bean1;
    }
    @PostConstruct public void init(){
        Sysout.out.print("bean2 init ...");
    }
}

@Configuration
public class Config{
    @Bean
    public Bean1 bean1(){
        return new Bean1();
    }

    @Bean
    public Bean2 bean2(){
        return new Bean2();
    }
}
```

当出现循环依赖时，在依赖注入之前创建代理对象。

执行 Bean1 构造函数 → 执行 Bean2 构造函数 → **生成 Bean1 AOP 代理对象**  → 执行 Bean2 setBean1(Bean1 AOP 代理对象) → 执行 Bean2 初始化方法 → 执行 Bean1 setBean2(Bean2 对象) → 执行 Bean1 初始化方法

```java
// 切点表达式是：execution(* foo()) 所以只有 Bean1 会被代理

public class Bean1(){
    public Bean2(){
        Sysout.out.print("Bean2()");
    }
    privaet Bean2 bean2();
    @Autowired
    public void setBean2(Bean2 bean2){
        this.bean2 = bean2;
    }
    public void foo(){}
    @PostConstruct public void init(){
        Sysout.out.print("bean1 init ...");
    }
}

public class Bean2(){
    public Bean2(){
        Sysout.out.print("Bean2()");
    }
    privaet Bean1 bean1();
    @Autowired
    public void setBean1(Bean1 bean1){
        this.bean1 = bean1;
    }
    @PostConstruct public void init(){
        Sysout.out.print("bean2 init ...");
    }
}

@Configuration
public class Config{
    @Bean
    public Bean1 bean1(){
        return new Bean1();
    }

    @Bean
    public Bean2 bean2(){
        return new Bean2();
    }
}
```
