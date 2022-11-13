# Spring AOP 代理实现的选择

> [If the target object to be proxied implements at least one interface, a JDK dynamic proxy is used. All of the interfaces implemented by the target type are proxied. If the target object does not implement any interfaces, a CGLIB proxy is created.](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-proxying)

- 目标对象实现了至少一个接口，则创建 JDK 动态代理。目标类型实现的所有接口都被代理。
- 目标对象没有实现任何接口，则创建 CGLIB 代理。

## 探究 Spring 如何选择代理机制

先说结论，Spring 在 `DefaultAopProxyFactory` 的 Javadoc 这样描述：

- `AdvisedSupport` 实例满足以下条件之一使用 CGLIB 代理：

  - 设置了 optimize 标志（设置为 `true` ）
  - 设置了 proxyTargetClass 标志（设置为 `true` ）
  - 没有指定实现的接口

- 其他情况使用 JDK 代理

测试目标类在有无实现接口时使用的代理方式（[Spring AOP API 实现方式](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-api)）：

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
        // proxy1 未实现接口使用GCLIB代理
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
        // proxy2 实现接口，且指定了实现接口，则使用JDK动态代理
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

相关源码：

```java
// 从上面案例这行代码开始分析（只显示关键代码）
T2 proxy2 = (T2) proxyFactory2.getProxy();

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

::: tip
💡 Spring Boot 默认设置 ProxyConfig.proxyTargetClass 为 `true`（带求证） TODO
:::

## 强制使用 CGLIB 动态代理

Spring Framework 文档在 [Proxying Mechanisms](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-proxying) 章节提到可以通过设置 `proxy-target-class=true` 强制使用 CGLIB 动态代理。

- 当使用 @Aspect 注解定义 AOP，基于 Java Configuration 设置 `proxy-target-class=true`

```java
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AppConfig {
    // ...
}
```

- 当使用 @Aspect 注解定义 AOP，基于 XML 设置 `proxy-target-class=true`

```xml
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

- 当使用 XML 定义 AOP，设置 `proxy-target-class=true`

```xml
<aop:config proxy-target-class="true">
    <!-- other beans defined here... -->
</aop:config>
```

测试：

```java
public class MyTarget7 {
    public interface T {
        void foo();
    }
    static public class DefaultTarget implements T {
        public void foo() {
            System.out.println("foo ...");
        }
    }
}

@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
// @EnableAspectJAutoProxy()
public class AppConfig3 {
    @Bean
    public MyAspect7 myAspect7() {
        return new MyAspect7();
    }
    @Bean
    public MyTarget7.DefaultTarget myTarget7() {
        return new MyTarget7.DefaultTarget();
    }
}

@Aspect
public class MyAspect7 {
    @Before("execution(public * com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget7.T.foo(..))")
    public void simpleBeforeAdvice() {
        System.out.println("Before Advice ...");
    }
}
```

- `@EnableAspectJAutoProxy` 不设置 `proxyTargetClass = true`

```java{4,10}
class Test7 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig3.class);
        MyTarget7.T myTarget7 = (MyTarget7.T) context.getBean("myTarget7");
        System.out.println(myTarget7.getClass());
        myTarget7.foo();
    }
}
// 输出结果：
// class jdk.proxy2.$Proxy17
// Before Advice ...
// foo ...
```

- `@EnableAspectJAutoProxy` 设置 `proxyTargetClass = true`

```java{4,10}
class Test7 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig3.class);
        MyTarget7.DefaultTarget myTarget7 = (MyTarget7.DefaultTarget) context.getBean("myTarget7");
        System.out.println(myTarget7.getClass());
        myTarget7.foo();
    }
}
// 输出结果：
// class com.jojojotarou.springframeworkaopbasedannotation.target.MyTarget7$DefaultTarget$$EnhancerBySpringCGLIB$$16f1d328
// Before Advice ...
// foo ...
```
