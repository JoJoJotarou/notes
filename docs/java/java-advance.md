## equals()与hashCode()方法详解

`Object.hashCode()` 返回对象的哈希码值。支持此方法是为了有利于哈希表，例如 `java.util.HashMap` 提供的哈希表。

hashCode的一般约定是（具体查看 Object 的 JavaDoc）：

- Java 应用程序执行期间对同一个对象多次调用它时， hashCode方法必须始终返回相同的整数。

- 如果两个对象根据 `equals(Object)` 方法相等，则对两个对象调用 `hashCode()` 方法返回值相等。

- 如果根据 `equals(Object)` 方法，如果两个对象不相等，则不需要对两个对象中的每一个调用hashCode方法都必须产生不同的整数结果。但是，程序员应该意识到，为不相等的对象生成不同的整数结果可能会提高哈希表的性能。

`Object.equals(object)` 方法用来判断 2 个对象是否相等。

- 每当重写 `Object.equals(object)` 方法时，通常都需要重写 `hashCode()` 方法，以维护 `hashCode()` 方法的一般约定，**即相等的对象必须具有相等的哈希码。**

::: tip

`==` 比较的是内存地址。在不重写 `equals` 方法时，它们是等价。

:::

**总结：**

- equals 相等，则 hashCode 相等（前提是代码符合规范），hashCode 相等，但是 equals 不一定相等。
- 重写 `equals` 方法必须重写 `hashCode` 方法。

**举个例子：**

```java
public class Test {

    public static class User {

        public String name;
        public int age;

        public User(String name, int age) {
            this.name = name;
            this.age = age;
        }
    }

    public static void main(String[] args) {
        User user1 = new User("alex", 18);
        User user2 = new User("alex", 18);

        System.out.println(user1 == user2);
        System.out.println(user1.equals(user2));
        System.out.println(user1.hashCode());
        System.out.println(user2.hashCode());
        HashSet<User> set = new HashSet<User>() {{
            add(user1);
            add(user2);
        }};
        System.out.println(set.size());
    }
}
// false
// false
// 1975012498
// 1808253012
// 2
```

虽然 `user1` 和 `user2` 拥有相同的属性，它们是不相等的（`==` 和 `equals` 都不相等）。故 `set` 的长度是 `2` 。接下来只重写 `User` 类的 `equals` 如下：

```java
public static class User {
    @Override
    public boolean equals(Object obj) {
        User u = (User) obj;
        return this.name.equals(u.name);
    }
}
// false
// true
// 1975012498
// 1808253012
// 2
```

通过打印发现 `user1` 和 `user2` 相等了，但是 `set` 的长度任然是 `2`，接下来重写 `User` 类的 `equals` 和 `hashCode` 如下：

```java
public static class User {
    @Override
    public boolean equals(Object obj) {
        User u = (User) obj;
        return this.name.equals(u.name);
    }
    @Override
    public int hashCode() {
        return this.name.hashCode();
    }
}
// false
// true
// 2996766
// 2996766
// 1
```

此时 `equals` 输出 `true`， `hashCode` 的值也是相等。 `set` 的长度变成了是 `1` ，这也就是前面所说的**哈希表**的作用，总所周知 `Set` 是不能存放相同元素，如果使用 `equals` 比较元素是否相同，那么 1000 个元素，就会比较 1000 次，这样效率很低，于是就维护了一张**哈希表**，通过比较元素的 `hashCode` 确定元素是否相等，在 `Set` 中相等则替换。

相关文章：<https://www.cnblogs.com/Qian123/p/5703507.html>

## 如何终止线程？

中断线程的核心是 `Thread.interrupt()` 方法，该方法有如下特征：

- 调用该方法的线程并不会像 `stop()` 那样直接终止线程（`stop()` 已经被废弃了，不推荐使用），而是将调用该方法的线程的中断标志将变成 `true` 。

    ```java
    public class ThreadInterruptDemo1 {
        public static void main(String[] args) throws InterruptedException {
            Thread thread = new Thread(() -> {
                System.out.println("thread start");
                for (int i = 0; i < 100000; i++) {
                    System.out.println(i);
                }
                System.out.println("thread end");
            });

            thread.start();
            Thread.sleep(100);
            thread.interrupt();
            System.out.println("thread is interrupted: " + thread.isInterrupted());
            System.out.println("main end");
        }
    }
    // 输出结果：
    // thread start
    // ...
    // 50428
    // thread is interrupted: true
    // ...
    // 50458
    // main end
    // ...
    // 99999
    // thread end
    ```

- 中断标志将等于 `true` 的线程遇到 `sleep()/wait()` 等中断线程的操作时会抛出 `InterruptedException` 异常。并且会清除中断标志，即变成 `false` 。

    ```java
    public class ThreadInterruptDemo2 {
        public static void main(String[] args) throws InterruptedException {
            Thread thread = new Thread(() -> {
                System.out.println("thread start");
                for (int i = 0; i < 100; i++) {
                    System.out.println(i);
                    try {
                        Thread.sleep(30);
                    } catch (InterruptedException e) {
                        System.out.println(Thread.currentThread().isInterrupted());
                        throw new RuntimeException(e);
                    }
                }
                System.out.println("thread end");
            });

            thread.start();
            Thread.sleep(100);
            thread.interrupt();
            System.out.println("thread is interrupted: " + thread.isInterrupted());
            System.out.println("main end");
        }
    }
    // 输出结果：
    // thread start
    // 0
    // 1
    // 2
    // 3
    // false
    // thread is interrupted: true
    // main end
    // Exception in thread "Thread-0" java.lang.RuntimeException: java.lang.InterruptedException: sleep interrupted
    ```

最佳实践：

- 抛出 `InterruptedException` 异常，线程中断。
- `while(!Thread.currentThread().isInterrupted())` 判断业务代码是否执行，不抛出 `InterruptedException` 异常，处理该异常时 `Thread.currentThread().interrupt()` 将标志位再次设置为 `true` （抛出该异常清除中断标志，即变成 `false` ），这个 `while` 条件不满足。

### 包装类也能使用常量池

当 `Byte` 、 `Short` 、 `Integer` 、 `Long` 赋值小于等于 127，大于等于 -128 （自动装箱）则存放常量池。

```java
Integer a = 127; // 等价 Integer.valueOf(127);
Integer b = 127;
Integer c = 128;  // 等价 Integer.valueOf(128);
Integer d = 128;
int e = 128;
int f = 128;

System.out.println(a == b); // true
System.out.println(c == d); // false
System.out.println(e == f); // true
```

`Integer.valueOf`：

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```
