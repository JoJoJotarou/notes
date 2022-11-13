# 类的加载

类的生命周期包含如下图 7 个阶段：

![类的生命周期](https://www.linuxidc.com/upload/2016_01/160118104030983.png)

本文讨论类的加载分为 **加载 (loading) 、连接 (linking)、初始化（Initialization）** 三个阶段。

## 加载

[类加载器 (ClassLoder)](./classloader) 通过类的完全限定名找到编译后的字节码文件 (.class)，将其加载到内存（**元空间 metaspace**）中。并为 .class 所代表的类创建唯一的 `java.lang.Class` 对象(Class 对象，反射中通常使用 `getClass()` 获取)，存入堆内存中，作为程序访问元空间中类信息的代理。

## 连接

将二进制文件加载到运行时数据区的过程，包含**验证**、**准备**、**解释**三个阶段。

### 验证

验证加载的 Class 文件的字节流中包含的信息符合当前虚拟机的要求，并且不会危害虚拟机自身的安全。

验证的内容：

- 是否以魔数 `0xCAFEBABE` 开头。
- 主次版本号是否在当前虚拟机处理范围内（jvm向下兼容）。
- ......

### 准备

在方法区中给类变量开辟空间并赋系统默认值（原始数据类型的默认值，引用类型 null）真的赋值操作是在初始化阶段完成的：

```java
public static String B = "B";
// 在当前阶段 B 将被赋值为 0
```

特殊点：当静态常量存在初始值，对应到字节码中就是其 `ConstantValue` 属性有值则直接初始为 `ConstantValue` 的值。

```java
// java 代码
public static final String A = "A";
```

```java{5}
// 字节码
  public static final java.lang.String A;
    descriptor: Ljava/lang/String;
    flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL
    ConstantValue: String A
```

验证：

```java
public class Demo1 {
    public static final String A = "A";
    public static String B = "B";
    static {
        System.out.println("static code block");
    }
}

class Test {
    public static void main(String[] args) {
        System.out.println(Demo1.A);
        System.out.println("=========");
        System.out.println(Demo1.B);
    }
}
// 输出结果：
// A
// =========
// static code block
// B
```

### 解释？

- 将 .class文件中常量池中符号引用转换为直接引用的过程
- 符号引用指使用一组符号来描述引用的目标，例如类的完全限定名

## 初始化

- 执行类或接口初始化方法 `<clinit>`。
- `<clinit>` 由 `javac` 编译器收集**静态变量的赋值**和**静态代码块中的语句**合并而来（静态常量由于是 `final` 修饰不会改变在准备阶段已经赋值）。
- `<clinit>` 中指令按照代码在源文件中出现的顺序执行（类变量按照实际赋值的顺序）

```java
public class Demo2 {
    public static final String A = "静态常量 A";
    public static final String B;
    public static String C = "静态变量（类变量）C";
    public static String D;
    public final String E = "常量";
    static {
        D = "静态变量（类变量）D";
        B = "静态常量 B";
        System.out.println("static code block");
    }
}
```

通过 `jclasslib` 获取 `<clinit>` 方法，可以看出 JVM 指令调用顺序是类变量（静态常量和静态变量）的赋值顺序，即 `C -> D -> B`，而不是类变量声明的顺序 `B -> C -> D`：

```java
 0 ldc #15 <静态变量（类变量）C>
 2 putstatic #17 <com/jojojo/classloader/Demo3.C : Ljava/lang/String;>
 5 ldc #20 <静态变量（类变量）D>
 7 putstatic #22 <com/jojojo/classloader/Demo3.D : Ljava/lang/String;>
10 ldc #25 <静态常量 B>
12 putstatic #27 <com/jojojo/classloader/Demo3.B : Ljava/lang/String;>
15 getstatic #30 <java/lang/System.out : Ljava/io/PrintStream;>
18 ldc #36 <static code block>
20 invokevirtual #38 <java/io/PrintStream.println : (Ljava/lang/String;)V>
23 return
```

::: info 相关 JVM 指令说明

- `ldc` ：从运行时常量池推送元素到操作数栈
- `putstatic` ：给 static 修饰的字段赋值，并将元素弹出操作数栈
- `getstatic` ：从类中获取静态字段
- `invokevirtual` ：调用实例方法
- `return` ：返回 void

:::

### 虚拟机必须对类进行初始化的5种情况

- 遇到 `new` , `getstatic`, `putstatic`, `invokestatic` 这4条字节码指令时，如果类没有进行过初始化，则需要先触发其初始化。生成这4条指令的最常见的 Java 代码场景是：使用 `new` 关键字实例化对象、读取或赋值一个类的静态字段（被final修饰、已在编译期间把结果放入常量池的静态字段除外）的时候，以及调用类的静态方法。

    ```java
    public class Demo3 {
        public static final String A = "A";
        public static final String B = UUID.randomUUID().toString();
        static {
            System.out.println("static code block");
        }
    }
    class Demo3Test1 {
        public static void main(String[] args) {
            new Demo3();  // 字节码是：0 new #2 <com/jojojo/classloader/Demo3>
        }
    }
    // 输出结果：
    // static code block
    class Demo3Test2 {
        public static void main(String[] args) {
            System.out.println(Demo3.A);
        }
    }
    // 输出结果：
    // A
    class Demo3Test3 {
        public static void main(String[] args) {
            // 虽然 B 是静态常量但是其值不是在编译期就能确定的依旧会触发初始化
            System.out.println(Demo3.B);
        }
    }
    // 输出结果：
    // static code block
    // 0acecb33-77b6-4e27-8d1c-115c3afb4c10
    ```

- 使用 `java.lang.reflect` 包的方法对类进行反射调用时，如类没有进行初始化，则需先触发其初始化。

    ```java
    public class Demo3 {
        static {
            System.out.println("static code block");
        }
    }
    class Demo3Test2 {
        public static void main(String[] args) throws ClassNotFoundException {
            Class.forName("com.jojojo.classloader.Demo3");
        }
    }
    // 输出结果：
    // static code block
    ```

- 虚拟机启动时，用户需要指定一个启动类（包含main()方法的类），jvm会先初始化这个主类。

    ```java
    public class Demo5 {
        static {
            System.out.println("static code block");
        }

        public static void main(String[] args) {

        }
    }
    // 输出结果：
    // static code block
    ```

- 当初始化一个类的时候，如果发现其父类还没有进行过初始化，则需要先触发其父类的初始化。

    ```java
    public class Demo4 {
        static {
            System.out.println("father");
        }
    }

    class Som extends Demo4 {
        static {
            System.out.println("son");
        }
        public static void main(String[] args) {
        }
    }
    // 输出结果：
    // father
    // son
    ```

- 当使用jdk1.7动态语言支持时，如果一个 `java.lang.invoke.MethodHandle` 实例最后的解析结果 REF_getstatic , REF_putstatic , REF_invokeStatic 的方法句柄，并且这个方法句柄所对应的类没有进行初始化，则需要先出触发其初始化。

    ```java
    不是很懂
    ```
