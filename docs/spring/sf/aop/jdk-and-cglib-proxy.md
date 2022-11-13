
# JDK 动态代理 & CGLIB 动态代理

Spring AOP 有以下 2 种实现方式：

- JDK 动态代理
- CGLIB 动态代理

<!-- 默认情况下，Spring Framework 仅在类没有实现接口时，使用 CGLIB 动态代理，其他情况使用 JDK 动态代理，大多数情况下，业务类实现一个或者多个接口（提倡使用接口编程）， -->
<!--

### AspectJ

### agent -->

## 简单比较

| 实现方式 |        JDK 动态代理        |                        CGLIB 动态代理                        |
| :------: | :------------------------: | :----------------------------------------------------------: |
| 项目来源 |          JDK 内置          | 基于开源项目 [cglib](https://github.com/cglib/cglib) 并打包到 spring-core |
| 目标对象 |        继承接口的类        |                   继承接口的类或普通类都行                   |
| 实现方式 | 动态创建实现接口的代理对象 | 动态创建实现接口的代理对象或者动态创建继承目标类重写目标类方法的代理对象 |

::: tip

- Spring Framework 中，CGLIB 仅在普通类上使用。
- Spring Boot 强制使用 CGLIB 动态代理（**🚨需求证🚨**）。
- JDK 动态代理和 CGLIB 动态代理都使用 [ASM](https://asm.ow2.io/) 技术直接动态生成字节码。

:::

## JDK 动态代理

现在有这样一段代码， `Target` 类实现了 `T` 接口：

```java
public class JDKProxyTest1 {
    interface T {
        void foo();
        void bar();
    }

    // 目标类只实现了一个接口
    static class Target implements T {
        @Override
        public void foo() {
            System.out.println("JDK Proxy foo ...");
        }
        @Override
        public void bar() {
            System.out.println("JDK Proxy bar ...");
        }
    }
}
```

我们希望通过 JDK 动态代理实现对 `foo()` 方法功能的扩展，需求很简答：在 `foo()` 方法执行前后分别打印 `before` 、 `after` 即可。我们可以通过 `java.lang.reflect.Proxy` 的类方法 `newProxyInstance` 生成代理。

```java
/**
 * loader – 类加载器
 * interfaces – 代理类要实现的接口列表(也就是目标类实现的接口列表)
 * h - InvocationHandler 接口实现类的对象
 */
@CallerSensitive
public static Object newProxyInstance(ClassLoader loader,
                                      Class<?>[] interfaces,
                                      InvocationHandler h) {
    // ...
}
```

如何将增加的执行代码告诉 `newProxyInstance` 创建的代理对象？代理对象会调用特定接口方法，我们实现该接口的方法即可，这也是依赖倒置原则的体现，而这个特定的接口就是 `InvocationHandler` ：

```java
/**
 * 通过实现 InvocationHandler 接口的 invoke 方法来增强目标类的方法
 */
public class JDKInvocationHandler implements InvocationHandler {

    // 反射调用方法需要方法所在类的对象
    private final Object target;

    public JDKInvocationHandler(Object target) {
        this.target = target;
    }

    /**
     * @param proxy  代理对象本身
     * @param method 目标对象要执行的方法
     * @param args   目标对象要执行的方法的参数
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 实际方法前执行
        System.out.println("before ... ");
        // 实际方法执行（本例中指 Traget.foo()）
        Object result = method.invoke(target, args);
        // 实际方法后执行
        System.out.println("after ... ");
        return result;
    }
}
```

::: warning 为什么 `Object result = method.invoke(target, args);` 不传入代理对象 `proxy` 而是传入 `target` ？
代理对象调用 `InvocationHandler.invoke` ，若在 `InvocationHandler.invoke` 方法内部继续调用代理对象的 `foo()` 方法会陷入死循环。
:::

测试代码：

```java
public class JDKProxyTest1 {
    // ......

    public static void main(String[] args) {
        T t = (T) Proxy.newProxyInstance(
                // 类加载器
                ClassLoader.getSystemClassLoader(),
                // 目标类实现的接口类别
                new Class[]{T.class},
                //
                new JDKInvocationHandler(new Target())
        );
        System.out.println(t.getClass());
        t.foo();
        t.bar();
    }
}

// 输出结果：
// class com.jojojotarou.springframeworkaop.proxy.$Proxy0
// before ...
// JDK Proxy test ...
// after ...
// before ...
// JDK Proxy bar ...
// after ...
```

上面的例子中目标类 Target 只实现了一个接口，现在测试下实现多个接口情况：

```java
public class JDKProxyTest2 {
    interface T1 {
        void foo();
    }
    interface T2 {
        void bar();
    }
    static class Target implements T1, T2 {
        @Override
        public void foo() {
            System.out.println("JDK Proxy foo ...");
        }
        @Override
        public void bar() {
            System.out.println("JDK Proxy bar ...");
        }
    }

    public static void main(String[] args) {
        Object proxy = Proxy.newProxyInstance(ClassLoader.getSystemClassLoader(), new Class[]{T1.class, T2.class}, new JDKInvocationHandler(new Target()));
        System.out.println(proxy.getClass());
        T1 t1 = (T1) proxy;
        T2 t2 = (T2) proxy;
        t1.foo();
        t2.bar();
    }
}

// 输出结果：
// class com.jojojotarou.springframeworkaop.proxy.$Proxy0
// before ...
// JDK Proxy foo ...
// after ...
// before ...
// JDK Proxy bar ...
// after ...
```

根据测试可以发现以下几点：

- `Proxy.newProxyInstance` 创建的对象类型是 `class.com.jojojotarou.springframeworkaop.proxy.$Proxy0` ，并非 `Traget` 类，这个创建出来的对象就是代理对象。
- 使用 JDK 动态代理，目标类实现所有接口以及所有方法都会被代理。

### $Proxy0

代理对象的类型 `class.com.jojojotarou.springframeworkaop.proxy.$Proxy0` 是什么呢，很是好奇！但是查找项目各个目录即没有 `.java` 文件也没有 `.class` 文件生成，这是因为 ASM 生成字节码存在于内存中。那有办法看看这个 `$Proxy0` 代码是什么样的，答案是有的，借助 Alibaba 开源工具 [arthas](https://arthas.aliyun.com/zh-cn/) 可以反编译 JDK 代理类的 java 代码：

- 添加 `System.in.read();` 到测试代码中，这是因为只有程序在运行中 arthas 才起作用。

```java {5}
public class JDKProxyTest1 {
    // ...省略代码
    public static void main(String[] args) throws IOException {
        // ...省略代码
        System.in.read();
    }
}
```

- 下载 arthas-boot.jar 并连接运行中的程序

```bash
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar
```

![arthas-use-1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207092140787.png)

- `jad` 命令反编译获取 `$Proxy0` 的 java 代码

```bash
# com.jojojotarou.springframeworkaop.proxy.$Proxy0 是测试代码中
# System.out.println(proxy.getClass()); 打印的类型，每个人可能不一样
jad com.jojojotarou.springframeworkaop.proxy.$Proxy0
```

::: details `$Proxy0` 的 java 代码

```java
package com.jojojotarou.springframeworkaop.proxy;

import com.jojojotarou.springframeworkaop.proxy.JDKProxyTest1;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;

final class $Proxy0
extends Proxy
implements JDKProxyTest1.T {
    private static final Method m0;
    private static final Method m1;
    private static final Method m2;
    private static final Method m3;
    private static final Method m4;

    public $Proxy0(InvocationHandler invocationHandler) {
        super(invocationHandler);
    }

    static {
        try {
            m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
            m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
            m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
            m3 = Class.forName("com.jojojotarou.springframeworkaop.proxy.JDKProxyTest1$T").getMethod("foo", new Class[0]);
            m4 = Class.forName("com.jojojotarou.springframeworkaop.proxy.JDKProxyTest1$T").getMethod("bar", new Class[0]);
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

    public final void foo() {
        try {
            this.h.invoke(this, m3, null);
            return;
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

    public final void bar() {
        try {
            this.h.invoke(this, m4, null);
            return;
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

:::

查看 `$Proxy0` 的代码可以发现：

- `$Proxy0` 代理目标实际是实现了目标类的父接口。
- `$Proxy0` 的继承至 `java.lang.reflect.Proxy` , `Proxy` 类的有参构造函数接收 `InvocationHandler` 对象作为参数。

    ```java
    protected Proxy(InvocationHandler h) {
            Objects.requireNonNull(h);
            this.h = h;
    }

    public $Proxy0(InvocationHandler invocationHandler) {
            super(invocationHandler);
    }
    ```

- 通过 static 代码块，在类加载时创建目标类 `foo()` 、`bar()` 方法对象。`hashCode` 、`equals` 、 `toString` 来自 `Object` 。

    ```java
    m3 = Class.forName("com.jojojotarou.springframeworkaop.proxy.JDKProxyTest1$T").getMethod("foo", new Class[0]);
    m4 = Class.forName("com.jojojotarou.springframeworkaop.proxy.JDKProxyTest1$T").getMethod("bar", new Class[0]);
    ```

- `$Proxy0` 重写了 `foo()` 方法，并且调用 `InvocationHandler` 的 `invoke()` 方法。

    ```java {3}
    public final void foo() {
        try {
            this.h.invoke(this, m3, null);
            return;
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    ```

到这里已经真相大白，JDK 动态代理生成代理对象（本例中是 `t`），当执行 `t.foo()` 时，会调用 `InvocationHandler` 的 `invoke()`，并将相应的方法对象（`java.lang.reflect.Method`）作为参数传入，通过反射即可调用目标类的方法（本例中是 `Target.foo()`），在反射调用方法前后便可以随意增加业务代码（本例中 `JDKInvocationHandler` 实现了 `InvocationHandler` ）。

## CGLIB 动态代理

同样有如下测试代码，使用 CGLIB 动态代理在 `foo()` 方法执行前后分别打印 before 、 after 即可。

```java
public class CGLIBProxyTest1 {
    static class Target {
        public void foo() {
            System.out.println("JDK Proxy test ...");
        }
        public void bar() {
            System.out.println("JDK Proxy bar ...");
        }
    }
}
```

前面说过，CGLIB 已经打包在 spring-core 包下，所以可以直接使用，CGLIB 创建代理使用 `org.springframework.cglib.proxy.Enhancer` 的类方法 `crete`：

```java
/**
* - type 要继承或者实现的类，即目标对象
* - callback 回调函数，与 InvocationHandler 类似
*/
public static Object create(Class type, Callback callback) {
    Enhancer e = new Enhancer();
    e.setSuperclass(type);
    e.setCallback(callback);
    return e.create();
}
```

实现 `org.springframework.cglib.proxy.Callback` 的子类 `org.springframework.cglib.proxy.MethodInterceptor`：

```java
public class CGLIBMethodInterceptor implements MethodInterceptor {

    private final Object target;

    public CGLIBMethodInterceptor(Object target) {
        this.target = target;
    }

    /**
     * @param o           代理对象本身
     * @param method      目标对象要执行的方法
     * @param args        目标对象要执行的方法的参数
     * @param methodProxy 代理类方法的代理
     * @return
     * @throws Throwable
     */
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        // 实际方法前执行
        System.out.println("before ... ");
        // 实际方法执行
        Object result = method.invoke(target, args);
        System.out.println("after ... ");
        return result;
    }
}
```

测试代码：

```java
public class CGLIBProxyTest1 {
    public static void main(String[] args) {
        Target proxy = (Target) Enhancer.create(Target.class, new CGLIBMethodInterceptor(new Target()));
        System.out.println(proxy.getClass());
        proxy.foo();
        proxy.bar();
    }
}
// 输出结果
// class com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6
// before ...
// JDK Proxy foo ...
// after ...
// before ...
// JDK Proxy bar ...
// after ...
```

::: details arthas 反编译获取 CGLIB 代理类的 java 代码

```java
package com.jojojotarou.springframeworkaop.proxy;

import com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1;
import java.lang.reflect.Method;
import org.springframework.cglib.core.ReflectUtils;
import org.springframework.cglib.core.Signature;
import org.springframework.cglib.proxy.Callback;
import org.springframework.cglib.proxy.Factory;
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;

public class CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6
extends CGLIBProxyTest1.Target
implements Factory {
    private boolean CGLIB$BOUND;
    public static Object CGLIB$FACTORY_DATA;
    private static final ThreadLocal CGLIB$THREAD_CALLBACKS;
    private static final Callback[] CGLIB$STATIC_CALLBACKS;
    private MethodInterceptor CGLIB$CALLBACK_0;
    private static Object CGLIB$CALLBACK_FILTER;
    private static final Method CGLIB$foo$0$Method;
    private static final MethodProxy CGLIB$foo$0$Proxy;
    private static final Object[] CGLIB$emptyArgs;
    private static final Method CGLIB$bar$1$Method;
    private static final MethodProxy CGLIB$bar$1$Proxy;
    private static final Method CGLIB$equals$2$Method;
    private static final MethodProxy CGLIB$equals$2$Proxy;
    private static final Method CGLIB$toString$3$Method;
    private static final MethodProxy CGLIB$toString$3$Proxy;
    private static final Method CGLIB$hashCode$4$Method;
    private static final MethodProxy CGLIB$hashCode$4$Proxy;
    private static final Method CGLIB$clone$5$Method;
    private static final MethodProxy CGLIB$clone$5$Proxy;

    public CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6() {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = this;
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6);
    }

    static {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$STATICHOOK1();
    }

    public final boolean equals(Object object) {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            Object object2 = methodInterceptor.intercept(this, CGLIB$equals$2$Method, new Object[]{object}, CGLIB$equals$2$Proxy);
            return object2 == null ? false : (Boolean)object2;
        }
        return super.equals(object);
    }

    public final String toString() {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            return (String)methodInterceptor.intercept(this, CGLIB$toString$3$Method, CGLIB$emptyArgs, CGLIB$toString$3$Proxy);
        }
        return super.toString();
    }

    public final int hashCode() {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            Object object = methodInterceptor.intercept(this, CGLIB$hashCode$4$Method, CGLIB$emptyArgs, CGLIB$hashCode$4$Proxy);
            return object == null ? 0 : ((Number)object).intValue();
        }
        return super.hashCode();
    }

    protected final Object clone() throws CloneNotSupportedException {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            return methodInterceptor.intercept(this, CGLIB$clone$5$Method, CGLIB$emptyArgs, CGLIB$clone$5$Proxy);
        }
        return super.clone();
    }

    @Override
    public Object newInstance(Class[] classArray, Object[] objectArray, Callback[] callbackArray) {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6;
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(callbackArray);
        Class[] classArray2 = classArray;
        switch (classArray.length) {
            case 0: {
                cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = new CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6();
                break;
            }
            default: {
                throw new IllegalArgumentException("Constructor not found");
            }
        }
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(null);
        return cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6;
    }

    @Override
    public Object newInstance(Callback callback) {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(new Callback[]{callback});
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = new CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6();
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(null);
        return cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6;
    }

    @Override
    public Object newInstance(Callback[] callbackArray) {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(callbackArray);
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = new CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6();
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$SET_THREAD_CALLBACKS(null);
        return cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6;
    }

    public final void foo() {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            Object object = methodInterceptor.intercept(this, CGLIB$foo$0$Method, CGLIB$emptyArgs, CGLIB$foo$0$Proxy);
            return;
        }
        super.foo();
    }

    public final void bar() {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            Object object = methodInterceptor.intercept(this, CGLIB$bar$1$Method, CGLIB$emptyArgs, CGLIB$bar$1$Proxy);
            return;
        }
        super.bar();
    }

    public static void CGLIB$SET_THREAD_CALLBACKS(Callback[] callbackArray) {
        CGLIB$THREAD_CALLBACKS.set(callbackArray);
    }

    public static void CGLIB$SET_STATIC_CALLBACKS(Callback[] callbackArray) {
        CGLIB$STATIC_CALLBACKS = callbackArray;
    }

    @Override
    public void setCallback(int n, Callback callback) {
        switch (n) {
            case 0: {
                this.CGLIB$CALLBACK_0 = (MethodInterceptor)callback;
                break;
            }
        }
    }

    @Override
    public void setCallbacks(Callback[] callbackArray) {
        Callback[] callbackArray2 = callbackArray;
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = this;
        this.CGLIB$CALLBACK_0 = (MethodInterceptor)callbackArray[0];
    }

    @Override
    public Callback getCallback(int n) {
        MethodInterceptor methodInterceptor;
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
        switch (n) {
            case 0: {
                methodInterceptor = this.CGLIB$CALLBACK_0;
                break;
            }
            default: {
                methodInterceptor = null;
            }
        }
        return methodInterceptor;
    }

    @Override
    public Callback[] getCallbacks() {
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
        CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = this;
        return new Callback[]{this.CGLIB$CALLBACK_0};
    }

    public static MethodProxy CGLIB$findMethodProxy(Signature signature) {
        String string = ((Object)signature).toString();
        switch (string.hashCode()) {
            case -1396292990: {
                if (!string.equals("bar()V")) break;
                return CGLIB$bar$1$Proxy;
            }
            case -1268936465: {
                if (!string.equals("foo()V")) break;
                return CGLIB$foo$0$Proxy;
            }
            case -508378822: {
                if (!string.equals("clone()Ljava/lang/Object;")) break;
                return CGLIB$clone$5$Proxy;
            }
            case 1826985398: {
                if (!string.equals("equals(Ljava/lang/Object;)Z")) break;
                return CGLIB$equals$2$Proxy;
            }
            case 1913648695: {
                if (!string.equals("toString()Ljava/lang/String;")) break;
                return CGLIB$toString$3$Proxy;
            }
            case 1984935277: {
                if (!string.equals("hashCode()I")) break;
                return CGLIB$hashCode$4$Proxy;
            }
        }
        return null;
    }

    private static final void CGLIB$BIND_CALLBACKS(Object object) {
        block2: {
            Object object2;
            block3: {
                CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6 = (CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6)object;
                if (cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BOUND) break block2;
                cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BOUND = true;
                object2 = CGLIB$THREAD_CALLBACKS.get();
                if (object2 != null) break block3;
                object2 = CGLIB$STATIC_CALLBACKS;
                if (CGLIB$STATIC_CALLBACKS == null) break block2;
            }
            cGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$CALLBACK_0 = (MethodInterceptor)((Callback[])object2)[0];
        }
    }

    final boolean CGLIB$equals$2(Object object) {
        return super.equals(object);
    }

    final void CGLIB$foo$0() {
        super.foo();
    }

    final String CGLIB$toString$3() {
        return super.toString();
    }

    static void CGLIB$STATICHOOK1() {
        CGLIB$THREAD_CALLBACKS = new ThreadLocal();
        CGLIB$emptyArgs = new Object[0];
        Class<?> clazz = Class.forName("com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6");
        Class<?> clazz2 = Class.forName("java.lang.Object");
        Method[] methodArray = ReflectUtils.findMethods(new String[]{"equals", "(Ljava/lang/Object;)Z", "toString", "()Ljava/lang/String;", "hashCode", "()I", "clone", "()Ljava/lang/Object;"}, clazz2.getDeclaredMethods());
        CGLIB$equals$2$Method = methodArray[0];
        CGLIB$equals$2$Proxy = MethodProxy.create(clazz2, clazz, "(Ljava/lang/Object;)Z", "equals", "CGLIB$equals$2");
        CGLIB$toString$3$Method = methodArray[1];
        CGLIB$toString$3$Proxy = MethodProxy.create(clazz2, clazz, "()Ljava/lang/String;", "toString", "CGLIB$toString$3");
        CGLIB$hashCode$4$Method = methodArray[2];
        CGLIB$hashCode$4$Proxy = MethodProxy.create(clazz2, clazz, "()I", "hashCode", "CGLIB$hashCode$4");
        CGLIB$clone$5$Method = methodArray[3];
        CGLIB$clone$5$Proxy = MethodProxy.create(clazz2, clazz, "()Ljava/lang/Object;", "clone", "CGLIB$clone$5");
        clazz2 = Class.forName("com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target");
        Method[] methodArray2 = ReflectUtils.findMethods(new String[]{"foo", "()V", "bar", "()V"}, clazz2.getDeclaredMethods());
        CGLIB$foo$0$Method = methodArray2[0];
        CGLIB$foo$0$Proxy = MethodProxy.create(clazz2, clazz, "()V", "foo", "CGLIB$foo$0");
        CGLIB$bar$1$Method = methodArray2[1];
        CGLIB$bar$1$Proxy = MethodProxy.create(clazz2, clazz, "()V", "bar", "CGLIB$bar$1");
    }

    final int CGLIB$hashCode$4() {
        return super.hashCode();
    }

    final void CGLIB$bar$1() {
        super.bar();
    }

    final Object CGLIB$clone$5() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

:::

以代理类的 `foo()` 方法为例，可以发现CGLIB 和 JDK 具体实现很相识。

```java
// 继承 CGLIBProxyTest1.Target
public class CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6
extends CGLIBProxyTest1.Target implements Factory {

    // 设置 callback 本例中是 CGLIBMethodInterceptor 对象
    @Override
    public void setCallback(int n, Callback callback) {
        switch (n) {
            case 0: {
                this.CGLIB$CALLBACK_0 = (MethodInterceptor)callback;
                break;
            }
        }
    }

    // 查找 foo、 bar 方法
    static void CGLIB$STATICHOOK1() {
        clazz2 = Class.forName("com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target");
        Method[] methodArray2 = ReflectUtils.findMethods(new String[]{"foo", "()V", "bar", "()V"}, clazz2.getDeclaredMethods());
        CGLIB$foo$0$Method = methodArray2[0];
    }

    // 代理目标类的方法 Target.foo()
    public final void foo() {
        MethodInterceptor methodInterceptor = this.CGLIB$CALLBACK_0;
        if (methodInterceptor == null) {
            CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6.CGLIB$BIND_CALLBACKS(this);
            methodInterceptor = this.CGLIB$CALLBACK_0;
        }
        if (methodInterceptor != null) {
            // 调用增强后的方法 CGLIBMethodInterceptor.intercept()
            Object object = methodInterceptor.intercept(this, CGLIB$foo$0$Method, CGLIB$emptyArgs, CGLIB$foo$0$Proxy);
            return;
        }
        super.foo();
    }
}
```

将 `foo()` 设置为 `final` ，输出结果如下：

```
class com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6
JDK Proxy foo ...
before ...
JDK Proxy bar ...
after ...
```

将 `Traget` 类设置为 `final` ，直接抛出异常：

```
java.lang.IllegalArgumentException: Cannot subclass final class com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target
```

- CGLIB 代理目标类实际是继承目标类，并重写目标类的方法。
- 目标类以及其方法不能是 `final` 的，当目标类是 `final` 时，编译报错、当被代理类的方法时 `final` 时，不会报错，但是没有增强效果。因为它们不能在运行时生成的子类中被覆盖。
- 从 Spring 4.0 开始，代理对象的构造函数不再被调用两次，因为 CGLIB 代理实例是通过 Objenesis 创建的。仅当您的 JVM 不允许绕过构造函数时，您可能会看到来自 Spring 的 AOP 支持的双重调用和相应的调试日志条目。

### MethodProxy

不知道你是否注意到 CGLIB 代理类的 java 代码中如下片段：

```java
public class CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6
extends CGLIBProxyTest1.Target
implements Factory {
    private static final MethodProxy CGLIB$foo$0$Proxy;
    private static final MethodProxy CGLIB$bar$1$Proxy;
    final void CGLIB$foo$0() {
        super.foo();
    }
    final void CGLIB$bar$1() {
        super.bar();
    }
    static void CGLIB$STATICHOOK1() {
        Class<?> clazz = Class.forName("com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target$$EnhancerByCGLIB$$3eff9cb6");
        clazz2 = Class.forName("com.jojojotarou.springframeworkaop.proxy.CGLIBProxyTest1$Target");
        Method[] methodArray2 = ReflectUtils.findMethods(new String[]{"foo", "()V", "bar", "()V"}, clazz2.getDeclaredMethods());
        CGLIB$foo$0$Proxy = MethodProxy.create(clazz2, clazz, "()V", "foo", "CGLIB$foo$0");
        CGLIB$bar$1$Proxy = MethodProxy.create(clazz2, clazz, "()V", "bar", "CGLIB$bar$1");
    }
}
```

以及 `CGLIBMethodInterceptor` 的 `MethodProxy methodProxy` 参数，如下代码显示该参数的 2 种使用方法：

```java {12,14}
public class CGLIBMethodInterceptor implements MethodInterceptor {
    private final Object target;
    public CGLIBMethodInterceptor(Object target) {
        this.target = target;
    }
    /**
     * @param o           代理对象本身
     * @param method      目标对象要执行的方法
     * @param args        目标对象要执行的方法的参数
     * @param methodProxy 代理类方法的代理
     * @return
     * @throws Throwable
     */
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        // 实际方法前执行
        System.out.println("before ... ");
        // 实际方法执行
        // 方式1
        Object result = methodProxy.invoke(target, args);
        // 方式2
        // Object result = methodProxy.invokeSuper(o, args);
        // 实际方法后执行
        System.out.println("after ... ");
        return result;
    }
}
```

没啥头绪，顺藤摸瓜，查看 `methodProxy.invoke` 方法，相关源代码如下：

```java {2-4,8-10}
public class MethodProxy {
    private Signature sig1;
    private Signature sig2;
    private volatile FastClassInfo fastClassInfo;

    public Object invoke(Object obj, Object[] args) throws Throwable {
        try {
            init();
            FastClassInfo fci = fastClassInfo;
            return fci.f1.invoke(fci.i1, obj, args);
        }
        catch (InvocationTargetException ex) {
            throw ex.getTargetException();
        }
        catch (IllegalArgumentException ex) {
            if (fastClassInfo.i1 < 0)
                throw new IllegalArgumentException("Protected method: " + sig1);
            throw ex;
        }
    }
    public Object invokeSuper(Object obj, Object[] args) throws Throwable {
        try {
            init();
            FastClassInfo fci = fastClassInfo;
            return fci.f2.invoke(fci.i2, obj, args);
        }
        catch (InvocationTargetException e) {
            throw e.getTargetException();
        }
    }
    private static class FastClassInfo {
        FastClass f1;
        FastClass f2;
        int i1;
        int i2;
    }
    // ⬇️ 调用 ⬇️
    // invoke() 方法的 fci 在 init() 方法中初始化
    // fci.f1 和 fci.f2 类型是 FastClass
    // fci.i1 和 fci.i2 是个索引 - index，谁的索引呢？ sig1 和 sig2 的，并且通过 fci.f1 和 fci.f2 的 getIndex 方法获取的
    // sig1 和 sig2 哪里来的？
    private void init() {
        if (fastClassInfo == null) {
            synchronized (initLock) {
                if (fastClassInfo == null) {
                    CreateInfo ci = createInfo;
                    FastClassInfo fci = new FastClassInfo();
                    fci.f1 = helper(ci, ci.c1);
                    fci.f2 = helper(ci, ci.c2);
                    fci.i1 = fci.f1.getIndex(sig1);
                    fci.i2 = fci.f2.getIndex(sig2);
                    fastClassInfo = fci;
                    createInfo = null;
                }
            }
        }
    }

    // ⬇️ 查找 ⬇️
    // 发现在调用 create() 方法时赋值，什么时候调用的 create() 方法？
    // 这是就要查看 CGLIB 生成的代理类了，有如下 2 句话：
    // CGLIB$foo$0$Proxy = MethodProxy.create(clazz2, clazz, "()V", "foo", "CGLIB$foo$0");
    // CGLIB$bar$1$Proxy = MethodProxy.create(clazz2, clazz, "()V", "bar", "CGLIB$bar$1");
    // ()V： ()表示该方法没有参数，V表示返回值是void
    public static MethodProxy create(Class c1, Class c2, String desc, String name1, String name2) {
        MethodProxy proxy = new MethodProxy();
        proxy.sig1 = new Signature(name1, desc);
        proxy.sig2 = new Signature(name2, desc);
        proxy.createInfo = new CreateInfo(c1, c2);
        return proxy;
    }
}
```

所以正向的解释是（以 `foo` 方法为例）：

- CGLIB 动态代理通过 `MethodProxy.create()` 方法为代理类的 `foo` 方法创建 `MethodProxy` 对象。
- 同时为代理类的 `foo` 、`CGLIB$foo$0` 方法分别创建 `Signature` 对象（方法签名）。
- 每个 `MethodProxy` 对象 包含 2 个 `Signature` 对象 ，其中 sig1 对应代理类的 `foo` 方法，sig2 对应代理类的 `CGLIB$foo$0` 方法。
- 当调用 `methodProxy.invoke()` 方法时会调用 `foo`。需要注意的是 `invoke()` 参数传的是目标对象，所以实际调用目标对象的 `foo` 方法，**传代理对象会造成死循环**。
- 当调用 `methodProxy.invokeSuper()` 方法时会调用 `CGLIB$foo$0` 。这里 `invokeSuper()` 参数传的是代理对象，`CGLIB$foo$0` 方法只存在于代理类。

::: tip
`methodProxy.invoke()` 和 `methodProxy.invokeSuper()` 不是反射调用，效率要比 `method.invoke()` 高。
:::
