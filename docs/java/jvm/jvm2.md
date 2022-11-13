# JVM

::: info 说明

- 查看反编译后的字节码文件可以通过 `javap -v` 命令也可以通过 IDEA [jclasslib Bytecode Viewer](https://plugins.jetbrains.com/plugin/9248-jclasslib-bytecode-viewer) 插件。
- 关于 JVM 指令集官方说明请[点击⤴️](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html)查看。

:::

### ClassLoder

JDK中默认的 ClassLoader 有 `Bootstrap` 、 `Extension` 、 `Application` 3种:

![ClassLoader](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208192013943.png)

- `Bootstrap ClassLoader` 负责 `$JAVA_HOME/jre/lib/rt.jar`等核心 jar 的加载。底层由 c/c++ 语言编写，尝试获取其classloader 时由于拿不到引用返回 `null`。
- `Extension ClassLoader` 负责 `$JAVA_HOME/jre/lib/ext/*` 下 jar 的加载。
- `Application ClassLoader` 负责加载项目（应用）classpath 下的。

`Extension ClassLoader` 和 `Application ClassLoader` 的类名分别是 `ExtClassLoader`、 `AppClassLoader` ，都属于 `sun.misc.Launcher` 的内部类：

```java
public class Launcher {
    private ClassLoader loader;
    public Launcher() {
        // ......
        ClassLoader extcl;
        extcl = ExtClassLoader.getExtClassLoader(); // 获取 Extension ClassLoader
        loader = AppClassLoader.getAppClassLoader(extcl); // 获取 Application ClassLoader
        // ......
    }
    static class ExtClassLoader extends URLClassLoader {
        private static ExtClassLoader createExtClassLoader() throws IOException {
            try {
                return AccessController.doPrivileged(
                    new PrivilegedExceptionAction<ExtClassLoader>() {
                        public ExtClassLoader run() throws IOException {
                            // ......
                            return new ExtClassLoader(dirs);
                        }
                    });
            } catch (java.security.PrivilegedActionException e) {
                throw (IOException) e.getException();
            }
        }
        private static File[] getExtDirs() {
            String s = System.getProperty("java.ext.dirs"); // Extension ClassLoader 加载的路径
            // ......
        }
    }

    static class AppClassLoader extends URLClassLoader {
        public static ClassLoader getAppClassLoader(final ClassLoader extcl)
            throws IOException
        {
            final String s = System.getProperty("java.class.path"); // Application ClassLoader 加载的路径
            // ......
        }
    }
}
```

#### 默认类加载器的范围

尝试通过如下代码打印以下：

```java
public static void main(String[] args) {
    System.out.println(System.getProperty("sun.boot.class.path"));
    System.out.println("++++++++++++++++++++++++++++");
    System.out.println(System.getProperty("java.ext.dirs"));
    System.out.println("++++++++++++++++++++++++++++");
    System.out.println(System.getProperty("java.class.path"));
}
```

IDEA 执行 `main` 方法时默认会把 `sun.boot.class.path` 和 `java.ext.dirs` 的所有路径通过 `-classpath` 参数添加到 classpath，所以下面的输出内容已经删除了重复项：

```text
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\charsets.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\jce.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\jfr.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\jsse.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\management-agent.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\resources.jar
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\rt.jar
++++++++++++++++++++++++++++
C:\Users\chang\scoop\apps\openjdk8-redhat\current\jre\lib\ext
C:\WINDOWS\Sun\Java\lib\ext
++++++++++++++++++++++++++++
D:\apps\github\notes-java-demo\classLoader\target\classes
```

#### 类加载器的父类加载器不是父类（非继承）

> `getClassLoader()` JavaDoc 片段：
>
> This method will return null in such implementations if this class was loaded by the bootstrap class loader.
>
> 当返回 null 表示该类是由 bootstrap classloader 加载的。

`Bootstrap` 、 `Extension` 、 `Application` 3 种类加载是逻辑的父子关系，并非实际的继承关系：

```java
public static void main(String[] args) {
    // 加载 ClassLoaderDemo2 的类加载器是 AppClassLoader
    System.out.println(ClassLoaderDemo2.class.getClassLoader());

    // AppClassLoader 的父类是 URLClassLoader
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getClass().getSuperclass());

    // AppClassLoader 的父类加载器是 ExtClassLoader
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getParent());

    // 加载 AppClassLoader 的加载器是 BootStrap ClassLoader ，这里返回的 null
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getClass().getClassLoader());

    // ExtClassLoader 的父类是 URLClassLoader
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getParent().getClass().getSuperclass());

    // AppClassLoader 的父类加载器是 BootStrap ClassLoader ，这里返回的 null
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getParent().getParent());

    // 加载 ExtClassLoader 的父类加载器是 BootStrap ClassLoader ，这里返回的 null
    System.out.println(ClassLoaderDemo2.class.getClassLoader().getParent().getClass().getClassLoader());
}
// 输出结果
// sun.misc.Launcher$AppClassLoader@18b4aac2
// class java.net.URLClassLoader
// sun.misc.Launcher$ExtClassLoader@75b84c92
// null
// class java.net.URLClassLoader
// null
// null
```

### 类加载的过程

VM 开启 `-XX:+TraceClassLoading` 选项，可以看到有哪些类被加载。

### 双亲委派原则

- 正如一开始图中所示，类加载器要加载一个类，它并不会自己直接加载，
- 而是先检查该类是否已经被当前类加载器加载（通过 `findLoadedClass` 方法），若加载则返回结果，若未加载则委托给父类加载器，它的父类加载器同样也会检查该类是否已经被自己加载，依此类推一直到顶层类加载器（Application->Extension->BootStrap）
- 若顶层类加载器检查该类也未被自己加载，则开始判断是否能找到要加载的类（通过 `findClass` 方法），若找到则加载返回结果，若找不到则向下委派，每一层类加载器重复这样的操作，一直到底部类加载器（BootStrap->Extension->Application，若还是无法找到则抛出 `ClassNotFoundException` 。

#### 双亲委派优点

- 安全，保证核心代码不被篡改

    ```java
    // 通过 java .\String.java 运行，较新版本的 IDEA 不会显示运行按钮
    public class String {

        public static void main(String[] args) {
        }
    }
    // 输出结果：
    // 错误: 在类 com.jojojo.classloader.cl.String 中找不到 main(String[]) 方法

    // 原因分析：
    // 这是因为 String 类是 BootStrap 类加载器加载的，
    // 根据双亲委派原则，会在 BootStrap 类加载器时检查到 String 返回结果，（🚨🚨完全限定名不一样为什么可以找到，要看底层C++源码，能力有限看不了，看网上说是通过类加载器+类名查找的）
    // 即 java.lang.String 它是没有main 方法的
    ```

- 避免重复加载，由于会先询问当前类加载器以及所有父类加载是否加载过某个类，当其中任意类加载器已经加载过该类，则直接返回结果。

#### 双亲委派问题

举个例子，现在有一个项目 A，依赖项目 `to-string（v2）`，他有个 `ToString` 类

```java
public class ToString {
    public void ToString() {
        System.out.println("toString v2");
    }
}
```

同时，项目 A 中部分代码需要使用 `to-string（v1）`，则创建 `URLClassLoader` 的实例（相当于自定义类加载，其父类加载器是 `AppClassLoader` ），来加载 `to-string（v1）`的 jar 包，v1 版本的 `ToString` 类如下：

```java
public class ToString {
    public void ToString() {
        System.out.println("toString v1");
    }
}
```

代码如下，期望输出 `toString v1`，实际输出 `toString v2` ：

```java
public class ClassLoadDemo3 {

    public static void main(String[] args) throws Exception {
        question();
    }

    public static void question() throws Exception {
        System.out.println("+++++++++++++ Question +++++++++++++");
        // to-string v1 版本
        File file1 = new File("C:\\Users\\chang\\Documents\\class1\\to-string-1.0-SNAPSHOT.jar");

        URL[] urls = new URL[]{file1.toURI().toURL()};

        URLClassLoader myClassLoader = new URLClassLoader(urls);

        System.out.println("自定义 ClassLoader 的父加载器：" + myClassLoader.getParent()); // AppClassLoader

        Class<?> toString = myClassLoader.loadClass("com.jojojo.jvm.tostring.ToString");

        Method method = toString.getMethod("ToString");
        method.invoke(toString.newInstance());

    }
}
// 输出结果：
// +++++++++++++ Question +++++++++++++
// 自定义 ClassLoader 的父加载器：sun.misc.Launcher$AppClassLoader@18b4aac2
// toString v2
```

分析原因如图：

![自定义类加载器1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208211548149.png)

于是改进了一番，设置 `URLClassLoader` 实例的父类加载器为 `ExtClassLoader` ，达到预期 ：

```java {8-10}
public static void solve() throws Exception {
    System.out.println("+++++++++++++ Solve +++++++++++++");
    // to-string v1 版本
    File file1 = new File("C:\\Users\\chang\\Documents\\class1\\to-string-1.0-SNAPSHOT.jar");

    URL[] urls = new URL[]{file1.toURI().toURL()};

    ClassLoader extClassLoader = ClassLoadDemo3.class.getClassLoader().getParent();
    // 将自定义 classLoader 的父加载器设置未 extClassLoader， 使得与 appClassLoader 同级
    URLClassLoader myClassLoader = new URLClassLoader(urls, extClassLoader);

    System.out.println("自定义 ClassLoader 的父类加载器：" + myClassLoader.getParent()); // extClassLoader

    Class<?> toString = myClassLoader.loadClass("com.jojojo.jvm.tostring.ToString");

    Method method = toString.getMethod("ToString");
    method.invoke(toString.newInstance());
}
// 输出结果：
// +++++++++++++ Solve +++++++++++++
// 自定义 ClassLoader 的父加载器：sun.misc.Launcher$ExtClassLoader@232204a1
// toString v1
```

原理图如下：

![自定义类加载器2](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208211550417.png)

### 自定义类加载器

上一小节，已经举例一个双亲委派原则可能带来的问题，这一节，继续上面的例子，举例另一个问题，并引出通过继承 `URLClassLoader` 重写 `loadClass` 方法创建自定义类加载器来打破双亲委派原则。

继续上面的例子，加载 `Parse` 类（在名为 parse 的项目）， `Parse` 实现了 `IParse` 接口（在名为 parse-api 的项目），同时为了代码的安全，项目 A 依赖 parse-api 项目，以此验证 `URLClassLoader` 加载的 `Parse` 是不是 `IParse` 的实现类：

```java
public class ClassLoadDemo4 {

    public static void main(String[] args) throws Exception {
        question();
    }

    public static void question() throws Exception {
        System.out.println("+++++++++++++ Question +++++++++++++");
        File file1 = new File("C:\\Users\\chang\\Documents\\class1\\to-string-1.0-SNAPSHOT.jar");
        File file2 = new File("C:\\Users\\chang\\Documents\\class1\\parse-2.0-SNAPSHOT.jar");
        File file3 = new File("C:\\Users\\chang\\Documents\\class1\\parse-api-2.0-SNAPSHOT.jar");

        URL[] urls = new URL[]{file1.toURI().toURL(), file2.toURI().toURL(), file3.toURI().toURL()};

        ClassLoader appClassLoader = ClassLoadDemo4.class.getClassLoader();
        ClassLoader extClassLoader = ClassLoadDemo4.class.getClassLoader().getParent();
        URLClassLoader myClassLoader = new URLClassLoader(urls, extClassLoader);
        System.out.println("自定义 ClassLoader 的父加载器：" + myClassLoader.getParent()); // extClassLoader

        Class<?> toString = myClassLoader.loadClass("com.jojojo.jvm.tostring.ToString");
        Method method1 = toString.getMethod("ToString");
        method1.invoke(toString.newInstance());


        Class<?> parse = myClassLoader.loadClass("com.jojojo.jvm.parse.Parse");
        if (!IParse.class.isAssignableFrom(parse)) {
            System.out.println("不是IParse的子类");
        } else {
            Method method2 = parse.getMethod("parse");
            method2.invoke(parse.newInstance());
        }
    }
}
// 输出结果：
// +++++++++++++ Question +++++++++++++
// 自定义 ClassLoader 的父加载器：sun.misc.Launcher$ExtClassLoader@75b84c92
// toString v1
// 不是IParse的子类
```

分析原因如下图：

![自定义类加载器3](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208211600035.png)

- 若不让 `URLClassLoader` 实例化的类加载器加载 parse-api 的 jar 会发生 `NoClassDefFoundError` 异常，因为  **`URLClassLoader` 实例和 `AppClassLoader` 同级不共享数据**；
- 若将 `URLClassLoader` 实例化的类加载器的父类加载器设置为 `AppClassLoader` 可以解决 Parse 的问题，但是 ToString 版本的问题又随之而来；

这时就需要重写 `loadClass` 方法来打破双亲委派机制，让自定义类加载器先尝试加载类，无法加载再委托父类加载器，而不是先检查是否已经加载类，未加载委托父类加载器继续检查：

```java
class CustClassLoader extends URLClassLoader {

    public CustClassLoader(URL[] urls, ClassLoader parent) {
        super(urls, parent);
    }

    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            try {
                c = findClass(name);
            } catch (ClassNotFoundException e) {
                c = this.getParent().loadClass(name);
            }
        }
        return c;
    }
}
```

```java
public static void solve3() throws Exception {
    System.out.println("+++++++++++++ Solve3 +++++++++++++");
    File file1 = new File("C:\\Users\\chang\\Documents\\class1\\to-string-1.0-SNAPSHOT.jar");
    File file2 = new File("C:\\Users\\chang\\Documents\\class1\\parse-2.0-SNAPSHOT.jar");

    URL[] urls = new URL[]{file1.toURI().toURL(), file2.toURI().toURL()};

    ClassLoader appClassLoader = ClassLoadDemo4.class.getClassLoader();
    ClassLoader extClassLoader = ClassLoadDemo4.class.getClassLoader().getParent();

    URLClassLoader myClassLoader = new CustClassLoader(urls, appClassLoader);
    System.out.println("自定义 ClassLoader 的父加载器：" + myClassLoader.getParent()); // appClassLoader

    Class<?> toString = myClassLoader.loadClass("com.jojojo.jvm.tostring.ToString");
    Method method1 = toString.getMethod("ToString");
    method1.invoke(toString.newInstance());


    Class<?> parse = myClassLoader.loadClass("com.jojojo.jvm.parse.Parse");
    if (!IParse.class.isAssignableFrom(parse)) {
        System.out.println("不是IParse的子类");
    } else {
        Method method2 = parse.getMethod("parse");
        method2.invoke(parse.newInstance());
    }
}
```

分析原理如下图：

![自定义类加载器4](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208211630964.png)
