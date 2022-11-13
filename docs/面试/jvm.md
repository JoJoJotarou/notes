
> 类什么时候被加载

类的加载是由虚拟机决定，常用用的 HotSpot 虚拟机时按需加载，可通过添加 vm 参数 `-XX:+TraceClassLoading` 监控类的加载

> a = a + b 与 a += b 的区别

> 3*0.1 == 0.3 将会返回什么? true 还是 false?

> 能在 Switch 中使用 String 吗?

> 对equals()和hashCode()的理解?

> final、finalize 和 finally 的不同之处?

> String、StringBuffer与StringBuilder的区别？

- String 一旦复制不可变，
- StringBuffer与StringBuilder 都是可变的容量的，StringBuffer 是线程安全的，其 append 方法通过 synchronized 关键字修饰

```java
public StringBuffer(String str) {
    super(str.length() + 16); // 创一个传入字符串长度 + 16 的 char[] 数组
    append(str);
}
// 线程安全
public synchronized StringBuffer append(String str) {
    toStringCache = null;
    super.append(str);
    return this;
}

public AbstractStringBuilder append(String str) {
    if (str == null)
        return appendNull();
    int len = str.length();
    ensureCapacityInternal(count + len); // 当已用长度+要添加的字符串长度 > char[] 数组时进行宽容，
    str.getChars(0, len, value, count);
    count += len;
    return this;
}

private int newCapacity(int minCapacity) {
    // overflow-conscious code
    int newCapacity = (value.length << 1) + 2; // 默认扩容量
    if (newCapacity - minCapacity < 0) {
        newCapacity = minCapacity; // 还是不够直接用新字符串长度
    }
    return (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0)
        ? hugeCapacity(minCapacity)
        : newCapacity;
}
```

> 接口与抽象类的区别？

- 抽象类使用 abstract 修饰，接口使用 interface 修饰
- 抽象类与普通类基本一致，但可以有 abstract 修饰的抽象方法，抽象方法只有声明没有实现，抽象方法不能使用 private 修饰；接口中只能存在 public static final 修饰的静态常量和 public abstract 修饰的抽象方法，默认添加可以不写，jdk8 开始可以使用 public default 修饰的默认方法（public可以不写）。jdk9开始可以添加 private 方法和 privat static 方法。

- 普通类继承抽象类必须实现所有的抽象方法，抽象类继承抽象类不需要实现所有的抽象方法。实现接口必须实现所有的抽象方法

> this() & super()在构造方法中的区别？

- super() 表示调用父类的构造函数，this() 表示调用本类的其他构造函数，二者不能同时出现，且都必须放在构造函数的首行。
- `super.` 、`this.` 不能在静态方法中使用
- super 是关键字，this 是本对象的指针。

[this 和 super 的底层原理](https://blog.csdn.net/weixin_32529407/article/details/113451818)：

![this 原理](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208121537894.png)

![super 底层原理](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208121527162.png)

## STW 机制

STW（Stop The World）机制是指 JVM 在执行Full GC 和 minor GC 时会停止用户线程，这样做时为了在进行可达性分析时确保对象状态不被改变，若没有 STW 则可能发生原本标记为存活的对象，在 GC 未结束时由于用户线程结束，实际对象应该为标记回收了，这时不管是不处理或重新计算可达性都是不可取的，不处理那么这对象将一致存活，重新计算则耗费大量时间。
