# JVM 内存模型

![JVM 内存模型](https://www.linuxidc.com/upload/2016_01/160120072323201.png)

## 堆（Heap）

- 堆是在虚拟机启动时创建的。
- 堆是所有线程共享。
- 堆用来存放类实例（对象）和数组的。

### 堆的组成

堆由**年轻代（young generation）**和**老年代（old generation）** 组成。年轻代包含**一个 Eden（伊甸园）区**和 **2 个 survivor（幸存者） 区**。

![Heap](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208221052847.png)

特点：

- 年轻代和老年代的内存大小比例默认 1:2，通过 `-XX:NewRatio=2` 设置。
- 默认情况下 eden : s0 : s1 的内存比例 8:1:1，通过 `-XX:SurvivorRatio=8` 设置。

### eden : s0 : s1 实际不是 8:1:1 ?

通过 IDEA 运行如下代码，同时设置 VM 参数 `-Xms600m -Xmx600m` ：

```java
public class Test {
    public static void main(String[] args) {
        while (true) { // 确保程序不会中断
        }
    }
}
```

通过 [VisualVM](https://visualvm.github.io/) 的 Visual GC 插件查看并计算 eden : s0 : s1 的内存比例是 6:1:1：

![eden : s0 : s1=6:1:1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208221215054.png)

百度了一番，根据[这篇文章](https://blog.51cto.com/u_14410880/2824970)的说法由于默认开启 `-XX:+UseAdaptiveSizePolicy` 参数，会自适应生成大小。根据[Oracle java 命令文档](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) 中 `-XX:+UseAdaptiveSizePolicy` 写道设置 `-XX:-UseAdaptiveSizePolicy` 并显式设置 `-XX:SurvivorRatio` 即可让 eden : s0 : s1 的内存比例称为 8:1:1。

实际测试只要显示设置 `-XX:SurvivorRatio=8` 就可以了：

![eden : s0 : s1=8:1:1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208221237882.png)

更多启动参数查看[Oracle java 命令文档](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)

### 对象存放和垃圾回收

- 大多数对象优先在 Eden 区中分配，部分特殊情况会直接分配到老年代。
- 当 Eden 区没有足够空间进行分配时，会触发一次 Minor GC，第一次 Minor GC 会计算出 Eden 区存活的对象，然后将对象赋值到一个 survivor 区，这个 survivor 区被称为 From survivor，那么另一个空的 survivor 区被称为 to survivor 。之后的 Minor GC 会清理 Eden 区和 From survivor 的对象，将存活的对象复制到 to survivor。对象以这种方式在幸存者区之间复制，直到它们足够老（通过 `-XX:MaxTenuringThreshold` 设置，默认 15 ）可以被永久保存（复制到老年代）。
- 当老年代没有足够的空间时，会触发一次 Full GC ，Full GC 会清理整个堆的垃圾对象，速度相比 Minor GC 慢很多。
- 每次 Minor GC 和 Full GC 都会触发 STW（stop-the-world） 机制，即暂停所有的线程。

#### 什么样的对象会进入老年代？

1. 长期存活的对象将进入老年代

    JVM 给每个对象定义了一个对象年龄计数器。当新生代发生一次 Minor GC 后，存活下来的对象年龄 +1，当年龄超过一定值时（通过 `-XX:MaxTenuringThreshold` 设置，默认 15 ），就将超过该值的所有对象转移到老年代中去。

2. 动态对象年龄判定

    当 survivor 区年龄等于 N 的对象的大小，超过 survivor 区总大小的 50% ，那么将年龄大于等于 N 的对象全部复制到老年代。

3. 大对象直接进入老年代

    大对象是指需要大量连续内存空间的 Java 对象，如很长的字符串或数据。虚拟机提供了一个 `-XX:PretenureSizeThreshold` 参数，令大于这个设置值的对象直接在老年代分配，这样做的目的是避免在 Eden 区及两个 Survivor 区之间发生大量的内存复制。

### HotSpot 垃圾收集器

JDK 8 默认的垃圾收集器是 Parallel GC， 从 JDK 9 开始默认使用 G1 GC

## 方法区

- 方法区是在虚拟机启动时创建的。
- 方法区是所有线程共享的。
- 方法区保存每个 .class 文件的类级别数据，例如运行时常量池、字段和方法数据，以及方法和构造函数的代码，包括类和实例初始化和接口初始化中使用的特殊方法。
- 方法区域可以是固定大小，也可以根据计算需要扩大，如果不需要更大的方法区域，可以缩小。方法区的内存不需要是连续的。如果方法区无法满足内存分配请求，JVM 会抛出 OOM 异常。

::: tip

- 运行时常量池存放 .class 文件中的 Constant pool。构建运行时常量池在类加载的linking阶段。
- HotSpot 在 JDK 8之前，方法区的实现是永久代，存放在堆中，很容易出现 OOM 异常，在 JDK 8 之后，方法区的实现是元空间，存放在直接内存（Java 堆外的、直接向系统申请的内存区间）。
:::

## 运行时数据区（Run-Time Data Areas）

Java 虚拟机定义了在程序执行期间使用的各种运行时数据区域。 其中一些数据区（堆、方法区）是在 Java 虚拟机启动时创建的，只有在 Java 虚拟机退出时才会被销毁。 其他数据区域（程序计数器、Java 虚拟机栈、本地方法栈）是每个线程。 每个线程的数据区域在创建线程时创建，并在线程退出时销毁。

### 程序计数器（The pc Register）

每个 Java 虚拟机线程都有自己的 pc（程序计数器）寄存器。在任何时候，每个 Java 虚拟机线程都在执行单个方法的代码，即该线程的当前方法。如果该方法不是 native 的，则 pc 寄存器包含当前正在执行的 Java 虚拟机指令的地址。如果线程当前正在执行的方法是 native 的，那么 Java虚拟机的pc寄存器的值是未定义的。

### Java 虚拟机栈（Java Virtual Machine Stacks）

每个 Java 虚拟机线程都有一个私有的 Java 虚拟机堆栈，与线程同时创建。Java 虚拟机栈可以是固定大小也可以是动态扩展的。Java 虚拟机栈符合是符合数据模型栈先进后出的特点。

Java 虚拟机栈抛出的异常：

- 当线程计算的所需的Java 虚拟机栈深度超过已存在的Java 虚拟机栈的深度，则会抛出 **StackOverflowError**
- 如果 Java 虚拟机栈可以动态扩展，并且尝试进行扩展，但没有足够的内存来实现扩展，或者如果没有足够的内存来为新线程创建初始 Java 虚拟机栈，则 JVM 抛出 **OutOfMemoryError**。

#### 帧（Frames）

线程每执行一个方法，都会在Java虚拟机栈中创建帧（Frame），栈顶的帧即为正在运行的方法，该帧称为当前帧，其方法称为当前方法，定义当前方法的类就是当前类。栈帧中通常包含局部变量表、操作数栈、动态链接、方法出口信息。帧在其方法调用完成时被销毁，无论该完成是正常的还是突然的（它会引发未捕获的异常）。

局部变量数组和操作数堆栈的大小在编译时确定，

- 局部变量表：
  - 单个局部变量可以保存 boolean、byte、char、short、int、float、reference 或 returnAddress 类型的值。一对局部变量可以保存一个 long 或 double 类型的值。局部变量通过索引来寻址。第一个局部变量的索引为零。
  - Java 虚拟机使用局部变量在方法调用时传递参数。在类方法调用时，任何参数都在从局部变量 0 开始的连续局部变量中传递。在实例方法调用时，局部变量 0 始终用于传递对正在调用实例方法的对象的引用（Java 编程语言中的 this）。随后，任何参数都从局部变量 1 开始在连续的局部变量中传递。
- 操作数栈：先进后出的栈数据类型，创建包含它的帧时，操作数堆栈为空。Java 虚拟机提供指令以将局部变量或字段中的常量或值加载到操作数堆栈上。其他 Java 虚拟机指令从操作数堆栈中获取操作数，对其进行操作，然后将结果推回操作数堆栈。例如，iadd 指令 (§iadd) 将两个 int 值相加。它要求要添加的 int 值是操作数堆栈的顶部两个值，由先前的指令推送到那里。两个 int 值都从操作数堆栈中弹出。它们被相加，它们的和被推回操作数堆栈。
- 动态链接
- 方法出口信息

### 本地方法栈（Native Method Stacks）

同Java虚拟机栈，但是是用来执行非 Java 代码，类如 C 语言。
