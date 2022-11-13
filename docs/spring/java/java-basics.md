---
title: "Java 基础知识"
slug: java-basics
date: '2022-02-12 18:36:57'
categories:
  - Java
tags:
  - 基础
weight: 1
cover:
    image: "https://tse3-mm.cn.bing.net/th/id/OIP-C.A2Zm5dIzR-bNolG-v-3BywFZC1?pid=ImgDet&rs=1"
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "alt text"
    caption: "caption"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---
# {{ $frontmatter.title }}

## 计算机存储单位

### 基本储存单元

- 位（bit，b）：二进制数中的一个数位，可以是 0 或者 1，是计算机中数据的最小单位。
- 字节（Byte，B）：计算机中数据的基本单位，每 8 位组成一个字节。各种信息在计算机中存储、处理至少需要一个字节。例如，一个 ASCII 码用一个字节表示，一个汉字用两个字节表示。
- 字（Word）：两个字节称为一个字。汉字的存储单位都是一个字。

## 字符/字符集、字体、码位、编码

- 字符/字符集： 诸如`a`、`中`等都被称为字符，它们的集合就是字符集
- 字体：用于在计算机上显示字符
- 码位：每一个字符都有一个码位，例如ASCII
- 编码：按照编码规则（例如：GBK、UTF-8）将字符以二进制的形式存储到计算机上

### UTF-16和UTF-8

- UTF-16中的16指一个字符用2字节表示，UTF-8中的8指的是可变，可以是一个字节也可以是2、3个字节
- Java8使用UTF-16编码，[Java18使用UTF-8编码](https://openjdk.java.net/jeps/400)（在Java8-17可以使用`java -Dfile.encoding=UTF-8`改变字符集）

## 原始数据类型

**原始数据类型不是对象，不需要实例化即可直接使用**

- 字符型
  - char
- 布尔型
  - boolean: `true / false`
- 数值型
  - 整数型
    - byte 字符型
    - short
    - int 整型
    - long
  - 浮点型
    - float
    - double

| 关键字    | 字节数 | 默认值     |
| --------- | ------ | ---------- |
| `char`    | 2      | `'\u0000'` |
| `boolean` | -      | `false`    |
| `byte`    | 1      | 0          |
| `short`   | 2      | 0          |
| `int`     | 4      | 0          |
| `long`    | 8      | 0          |
| `float`   | 4      | 0.0F       |
| `double`  | 8      | 0.0L       |

### char

- char 涵盖了 Unicode 所有字符
- 取值范围 0~65,535
- 可以存放单引号引用的单个字符，以及正整数（输出其对应的字符，例如 51 对应字符 3）
- Java 中 char 是 2 个字节，C++中 char 是 1 字节

```java
char a = 5; // ✔️
char a = 51; // ✔️
char a = '51'; // ❌

char a = 'a'; // ✔️
char a = 'ab'; // ❌

char a = '中'; // ✔️
char a = '中国'; // ❌

// unicode 字符
char char1='\u0061'; // a ✔️
char char2='\u0041'; // A ✔️
```

- 2 个 char 相加返回值为 `int`

```java
char a = '5';
char b = 'd';

int c = a + b;
System.out.println(c); // 结果：153
```

- `String`与`char`相加结果为`String`

```java
System.out.println('中' + "国"); // 结果：中国
```

### boolean

- 在 Java 语言中，布尔类型的值不能转换成任何数据类型，true 常量不等于 1，而 false 常量也不等于 0。这两个值只能赋给声明为 boolean 类型的变量，或者用于布尔运算表达式中。
- [boolean 字节数依赖虚拟机（jvm）实现](https://zhuanlan.zhihu.com/p/234338432)

```java
boolean isable;    // 声明 boolean 类型的变量 isable
boolean b = false;    // 声明 boolean 类型的变量 a，并赋予初值为 false
```

### double & float

- Java 默认的浮点型为 double，一个值要能被真正看作 float，它必须以 f（或 F）后缓结束；否则，会被当作 double 值。对 double 值来说，d（或 D）后缀是可选的。

```java
// 定义float类型并赋予初值
float f = 1.1f;

// 定义double类型的变量并赋予初值
double f = 1.1d;
double f = 1.1;
```

### byte & short & int & long

- Java 中默认整数型为`int`， 在相应范围内可以直接赋值给`byte`、`short`、`long`

```java
byte a = 127;
short b = 32767;
int c = 2147483647;
long d = 2147483647;
// 若赋值超过int的范围，怎需要加上`L`后缀告诉编译器是长整型
long e = 2147483648L;
```

## 包装类（wrapper class）

![basic_data_type](http://82.156.201.201:10010/blog-img/2022/03/202203272143693.png)

- 包装类是一个对象，默认值时`null`
- `Collection`只存储引用类型而不是原始数据类型

### 自动装箱（Autoboxing）& 自动拆箱（Unboxing）

- 在实际写代码时，通常也不需要我们通过 new 的方式创建一个包装类，而是自动将原始数据类型转换成包装类，这种被称作自动装箱，例如：byte to Byte, char to Character, int to Integer, long to Long, float to Float, boolean to Boolean, double to Double, and short to Short
- 相应的自动将包装类转换成原始数据类型，被称为自动拆箱
- 自 **Java 1.5** 引入自动装箱（Autoboxing）& 自动拆箱（Unboxing）

```java
// j2se 5.0 before
Integer i = new Integer(10);
Integer i = Integer.valueOf(10);
// Autoboxing after j2se 5.0
Integer j = 10;

List<Integer> list = new ArrayList<>();
list.add(1); // autoboxing

// j2se 5.0 before
int n = j.intValue();
// Unboxing after j2se 5.0
int m = i;
```

## 面向对象(OOP)

Java是一**门向对象**的编程语言，在Java语言中**万物皆为对象**。

**那么什么是对象？**

一切客观存在的事物都是对象，猫是对象，人是对象。任意对象都有自己的特征和行为，例如颜色是猫的特征、跑是猫的行为。

**什么是抽象？**

抽象，就是把同一类事物中共有的特征(属性)和行为(功能、方法)进行归纳总结。抽象的过程其实就是面向对象编程的核心思想

**什么是类？**

类是描述具有相同特征（属性）和行为（方法）的一类对象，例如（猫、狗可以统称为动物，它们都有颜色都能跑）。

**类和对象的关系？**

- 类是对象的抽象
- 对象是类的实例

***所以面向对象，就是将具有相同特征（属性）和行为（方法）的一类对象抽象成类，并通过类使用和维护对象。***

**面向对象的三大基本特征：**

- 封装
- 继承
- 多态

## 类和方法

- 类就是用来描述一类具有相同特征（属性）和相同行为（方法）的实体（对象）。（类可以比喻为对象的模板）
- 一个`.java`文件可以有多个类，必须存在一个且只能存在一个与`.java`同名的类，被`public`修饰的类的名称必须与`.java`文件同名

```java
//语法
修饰符 class 类名{
    类属性：
    [修饰符] 属性类型 属性名 [=默认值]
    类方法：
    [修饰符] 返回值类型 方法名 (形参列表)
}

public class Cat {
    private String breed;
    private String color;

    public void say(){
        System.out.println("喵喵喵~");
    }
}

// 例子，假设只是一个名为Test.java的文件
public class Test {
    ......
}
// 那么Test.java文件内的其他类不能被public修饰
class Test1 {
    ......
}
```

## 修饰符

### 访问修饰符

![Java 访问控制符](http://82.156.201.201:10010/blog-img/2022/03/202203272144070.png)

- `public` : 对所有类可见。**使用对象：类、接口、变量、方法**
- `protected` : 对同一包内的类和所有子类可见。**使用对象：变量、方法。 注意：不能修饰类（外部类）、接口、抽象类**
- `no modifier` (即默认，什么也不写）: 在同一包内可见，不使用任何修饰符。**使用对象：类、接口、变量、方法**
- `private` : 在同一类内可见。**使用对象：变量、方法。 注意：不能修饰类（外部类）、接口、抽象类**

💡 关于 `protected` 和 `no modifier` 同一个包内可预见，你可能会疏忽的内容，先看用例， `Father` 类有三个子类 `Son1` 、 `Son2` 、 `Son3` ，其中 `Son3` 重写了 `getName` 访问：

`protectedTest.sub` 目录下：

```java
package protectedTest.sub;
public class Father {
    protected void getName() {
        System.out.println("Father name");
    }
    void getAge() {
        System.out.println("Father age");
    }
    public void getSex() {
        System.out.println("Father sex");
    }
}

package protectedTest.sub;
public class Son1 extends Father {
}
```

`protectedTest` 目录下：

```java
package protectedTest;
import protectedTest.sub.Father;
public class Son2 extends Father {
}

package protectedTest;
import protectedTest.sub.Father;
public class Son3 extends Father {
    @Override
    protected void getName() {
        super.getName();
    }
}
```

第一个测试用例在 `protectedTest` 下：

```java
package protectedTest;
import protectedTest.sub.Father;
import protectedTest.sub.Son1;
public class Test {
    public static void main(String[] args) throws CloneNotSupportedException {

        Son1 son1 = new Son1();
        son1.getName(); // ❌ not visible: Son1没重写任何方法，实际上调用都是Father.getName的，Test与Father不同包，所以不可见
        son1.getAge(); // ❌ not visible: Son1没重写任何方法，实际上调用都是Father.getAge的，Test与Father不同包，所以不可见
        son1.getSex(); // ✅ visible：因为是 public 修饰的

        Son2 son2 = new Son2();
        son2.getName(); // ❌ not visible: Son2没重写任何方法，实际上调用都是Father.getName的，Test与Father不同包，所以不可见
        son2.getAge(); // ❌ not visible： Son2 与 Father 不在同包中，所以不可见
        son2.getSex(); // ✅ visible

        // 除了getName，其他原因全部同上
        Son3 son3 = new Son3();
        son3.getName(); // ✅ visible：因为 Son3 中重写getName，使得其与 Test 在同一个包下
        son3.getAge(); // ❌ not visible
        son3.getSex(); // ✅ visible

        Father f = new Son3();
        f.getName(); // ❌ not visible：用Father接收，故这里实际看的是Father，Test与Father不同包，所以不可见
        f.getAge(); // ❌ not visible：用Father接收，故这里实际看的是Father，Test与Father不同包，所以不可见
        f.getSex(); // ✅ visible

        Father f1 = new Father();
        f1.getName(); // ❌ not visible：Test 与 Father 不同包，所以可见
        f1.getAge(); // ❌ not visible：Test 与 Father 不同包，所以可见
        f1.getSex(); // ✅ visible
    }
}
```

第二个测用例，将 `Son2` 修改如下：

```java
public class Son2 extends Father {
    public static void main(String[] args) {
        Son1 son1 = new Son1();
        son1.getName(); // ❌ not visible: Son1没重写任何方法，实际上调用都是Father.getName的，Son2与Father 不同包，所以不可见
        son1.getAge(); // ❌ not visible: Son1 是可见 Father.getAge的，但是Son1没重写任何方法，实际上调用都是Father.getAge的，Son2与Father 不同包，所以不可见
        son1.getSex(); // ✅ visible：因为是 public 修饰的

        Son2 son2 = new Son2();
        son2.getName(); // ✅ visible，因为是这子类，且在本类中访问
        son2.getAge(); // ❌ not visible：Father与Son2不在同一个包，所以不可见
        son2.getSex(); // ✅ visible

        Son3 son3 = new Son3();
        son3.getName(); // ✅ visible，Son3重写了getName方法，实际上调用是Son3.getName的，Son2与Son3 同包，所以可见
        son3.getAge(); // ❌ not visible：Father与Son3不在同一个包，所以不可见
        son3.getSex(); // ✅ visible

        Father f = new Father();
        f.getName(); // ❌ not visible： Son2与Father 不同包，所以可见
        f.getAge(); // ❌ not visible：Son2与Father 不同包，所以可见
        f.getSex(); // ✅ visible
    }
}
```

第三个测试用例在 `protectedTest.sub` 包下 ：

```java
package protectedTest.sub;

import protectedTest.Son2;
import protectedTest.Son3;
import protectedTest.sub.Father;
import protectedTest.sub.Son1;

public class Test {
    public static void main(String[] args) throws CloneNotSupportedException {

        Son1 son1 = new Son1();
        son1.getName(); // ✅ visible：Son1没重写任何方法，实际上调用都是Father.getName的，Test与Father同包，所以可见
        son1.getAge(); // ✅ visible：Son1没重写任何方法，实际上调用都是Father.getAge的，Test与Father同包，所以可见
        son1.getSex(); // ✅ visible：因为是 public 修饰的，任何人可见的

        // 原因全部同上
        Son2 son2 = new Son2();
        son2.getName(); // ✅ 调用者Test与被调用者Son2的方法在同一个包下（Son2并没有自己getName是继承的，实际上还是调用Father.getName）
        son2.getAge(); // ❌ not visible：Father 与 Son2 不同包，所以不可见
        son2.getSex(); // ✅ visible

        // 除了getName，其他原因全部同上
        Son3 son3 = new Son3();
        son3.getName(); // ❌ not visible：因为 Son3 中重写getName，那么调用就是Son3.getName，Son3 与Test不同包，所以不可见
        son3.getAge(); // ❌ not visible：Father 与 Son3 不同包，所以不可见
        son3.getSex(); // ✅ visible

        Father f = new Son3();
        f.getName(); // ✅ visible：由于用Father接收Son3，故这里实际看的是Father, Test 与 Father 同包，所以可见
        f.getAge(); // ✅ visible：由于用Father接收Son3，故这里实际看的是Father, Test 与 Father 同包，所以可见
        f.getSex(); // ✅ visible

        Father f1 = new Father();
        f1.getName(); // ✅ visible：Test 与 Father 同包，所以可见
        f1.getAge(); // ✅ visible：Test 与 Father 同包，所以可见
        f1.getSex(); // ✅ visible
    }
}
```

🥲 之前我误以为，`protected` 和 `no modified` 说的同包访问时只要 A 是 B 的子类或者同包，在哪里都可以访问，从用例来看显示这种想法是打算错特错（促使我探究这个问题是因在学习 `Object.clone()` 时，发现在测试类是无法使用该访问的，毕竟我们都知道Object是所有类的父类，当时就很纳闷，A 明明是 Object 的子类，为什么在测试类中就无法使用clone了，而在本类就可以）。

先明确3个角色（第一个测试用例来说）：

- **调用者**：`protectedTest.Test`
- **被调用者**：`protectedTest.Son2`、`protectedTest.Son3`、`protectedTest.sub.Father`、`protectedTest.sub.Son1`
- **实际执行者**：（出现继承、重写才有，没有继承被调用者和实际执行者时相同的） `Son2` 通过调用 `getName` 方法，那么实际执行者是 `protectedTest.sub.Father` ；而当 `Son3` 重写了父类方法，那么实际执行者是 `protectedTest.Son3` 。

**🔔 总结：**

- 当不存在继承关系时，我们直接判断**调用者**与被**调用者**是否符合访问条件（对于例子: 在 `Test` 中调用 `Father` 的各个方法）
- 当存在继承关系时
  - 先确定**被调用者**是否能访问到**实际执行者**，若不能，则**调用者**肯定也不能访问到。（对应例子： `Son2` 调用 `getAge()` ）
  - 然后我们应该判断**调用者**与**实际执行者**之间是否符合访问条件。（对应例子： `Test` 中 `Son3` 可以调用 `getName` 而 `Son2` 和 `Son1` 不行）

### 非访问修饰符

- `static`：修饰变量、方法、类（内部类）、代码块
- `final`：修饰类、方法、变量、参数
- `abstract`：修饰类和方法
- `synchronized`
- `transient`
- `volatile`

[more info](https://www.runoob.com/java/java-modifier-types.html)

## 变量的作用域

类变量（静态变量）、实例变量、局部变量

```java
class Person {
    public static String name; // 类变量
    public int age; // 实例变量

    public void myHobby(){
        String hobby = "唱跳Rap篮球"; // 局部变量
    }
}
```

## [static](https://www.baeldung.com/java-static)

- `static`关键字表示修饰的成员属于类本身，而非类的实例，我们可以是类名直接访问，而无需实例化类、
- `static`修饰的变量、方法、类只能访问静态的变量、方法、类

### 修饰变量-静态变量（类变量）

- `static`关键字修饰不能修饰局部变量
- `static`关键字修饰的变量声明时不强制初始化，编译器会给定默认值（引用类型默认值为null，原始数据类型有各自默认值）
- 类加载时只会初始化一次，并在该类的所有实例之间共享（从内存的角度来看，`static`关键字修饰的静态变量存储在堆内存（**Heap Memory**）中）
- 避免使用实例名获取静态变量，使用类名获取，这样有助于区分类变量还是对象属变量

**什么时候需使用静态变量？**

- 当变量需要在所有对象之间共享
- 当变量的值和对象无关

### 修饰方法-静态方法（又叫：类方法）

- 静态方法与普通方法基本一样，返回值前必须添加一个`static`关键字，main 方法就是一个静态方法

    ```java
    public static void main(String[] args) {
         System.out.println('中国必将伟大');
    }
    ```

- 静态方法不能被子类重写，但是可以根据访问限定符的限定访问
- 静态方法可以被本类重载
- 抽象方法不能时静态的

### [修饰代码块-静态代码块](#静态代码块)

### 修饰内部类-静态内部类

- 静态内部类只能调用静态变量和方法，实例属性只能通过创建实例访问，但是普通内部类可以访问任意外部类的成员变量和方法
- 静态内部类可以声明普通成员变量和方法，而普通内部类不能声明static成员变量和方法。
- 静态内部类可以单独初始化，而普通内部类必须先初始化外部类，才能初始化。

```java
// 静态内部类初始化
Inner i = new Outer.Inner();

// 普通外部类初始化
Outer o = new Outer();
Inner i = o.new Inner();
```

```java
// 静态内部类 单例模式
public class Singleton {
    private Singleton() {
    }

    private static class SingletonHolder {
        public static final Singleton instance = new Singleton();
    }

    public static Singleton getInstance() {
        return SingletonHolder.instance;
    }
}
```

**什么时候使用静态内部类？**

- 只在一个地方使用的类，可以提高封装性。我们让代码更接近唯一使用它的地方。这提高了可读性，代码更易于维护。
- 当内部类无需访问实例属性时，最好使用静态内部类，这样，它就不会与外部类耦合。**这样静态内部类就不需要任何堆或堆栈内存，这样写更好**

```java
public class Test{
    public String a;
    String b;
    protected String c;
    private String d;

    public static void test1() {
        ......
    }
    protected static void test1() {
        ......
    }
    static void test1() {
        ......
    }
    private static void test1() {
        ......
    }
}
```

## [final](https://www.baeldung.com/java-final)

- `final`修饰的类，不能被继承，这也意味这失去了可扩展性
- `final`修饰的方法，不能被子类重写，可以达到限制扩展性的目的(例如被构造器调用的方法应该使用`final`修饰，否则子类创建时，父类构造器调用被子类重写后的方法)

    ```java
    // 控制台输出：
    // father - 构造器
    // son - 中国九百六十万平方公里
    class CharTest {
        public static void main(String[] args) {
            China c = new China();
        }
    }
    class Country {
        private String name;
        private String area;
        public Country() {
            System.out.println("father - 构造器");
            info();
        }
        void info() {
            System.out.println("father - 中国九百六十万平方公里");
        }
    }
    class China extends Country {
        @Override
        void info() {
            System.out.println("son - 中国九百六十万平方公里");
        }
    }
    ```

- `final`修饰原始数据类型和引用类型的变量，必须初始化，且在初始化后不被改变，但是引用类型可以通过其内置方法修改（例如:`set`方法），若在方法做声明，可以不初始化，但使用之前必须初始化

    ```java
    final Cat cat = new Cat();
    cat.setWeight(5);
    assertEquals(5, cat.getWeight());
    ```

- `static final`修饰的变量，即常量（序列化时不包含该字段，则不是对象的一部分，则该字段是一个常量），变量名大写（这是规范），含有多个单词时应该用`_`连接。变量必须初始化，且只能在类中或者静态构造代码块，在构造代码块或者构造器中初始化将提示异常

    ```java
    static final int MAX_WIDTH = 999;
    ```

- `final`修饰的参数，在函数中不能被改变

    ```java
    public void methodWithFinalArguments(final int x) {
        // The final local variable x cannot be assigned.
        // It must be blank and not using a compound assignment
        x=1;
    }
    ```

## 类扩展

### 代码块

- 类中被`{}`包裹的代码
- 在类创建的时候被执行

```java
// 执行main函数后，控制台输出:
// 构造代码块
public class Test {

    public static void main(String[] args) {

        InnerCharTest innerCharTest = new InnerCharTest();
    }
}

class InnerTest {
    {
        System.out.println("构造代码块");
    }
}
```

### 静态代码块

- 类中被`static {}`包裹的代码
- 在类初始化的时候被执行，且在构造代码块之前
- 静态构造代码块只会执行一次
- 类可以有多个静态代码块，按照至上而下的顺序执行

```java
// 执行main函数后，控制台输出:
// 静态构造代码块
// 静态构造代码块-1
// 构造代码块
// 构造代码块
public class Test {
    public static void main(String[] args) {
        InnerCharTest innerCharTest1 = new InnerCharTest();
        InnerCharTest innerCharTest2 = new InnerCharTest();
    }
}

class InnerTest {
    {
        System.out.println("构造代码块");
    }
    static {
        System.out.println("静态构造代码块");
    }

    static {
            System.out.println("静态构造代码块-1");
        }
}
```

- 调用静态访问也会初始化类，执行静态构造代码块

```java
// 执行main函数后，控制台输出:
// 静态构造代码块
// 中国九百六十万平方公里
// 中国九百六十万平方公里
public class Test {
    public static void main(String[] args) {
        InnerCharTest.info();
        InnerCharTest.info();
    }
}

class InnerTest {
    {
        System.out.println("构造代码块");
    }
    static {
        System.out.println("静态构造代码块");
    }

    public static void info() {
        System.out.println("中国九百六十万平方公里");
    }
}
```

**什么时候需使用静态代码块？**

- 用来初始化，有除赋值以外逻辑的静态变量
- 静态变量初始化需要镜像异常处理的

### 构造函数（又叫：构造器）

- 与类同名，没有返回值类型，没有 return 语句的函数，存在无参构造器、有参构造器
- 在类创建的时候执行，在静态构造代码块和构造代码块后被执行
- 无参构造器必须存在，在没有写有参构造器时，Java 代码编译时会默认是加上一个无参构造器，若写了有参构造器，必须显示的写上无参构造器，否者无法使用`Country country = new Country();`

```java
// 执行main函数后，控制台输出:
// 静态构造代码块
// 构造代码块
// 构造器
public class Test {
    public static void main(String[] args) {
        Country c = new Country();
    }
}

class Country {
    private String name;
    private String area;

    {
        System.out.println("构造代码块");
    }

    static {
        System.out.println("静态构造代码块");
    }
    // 无参构造器
    public Country() {
        System.out.println("构造器");
    }
    // 有参构造器
    public Country(String name, String area) {
        this.name = name;
        this.area = area;
    }
    // 有参构造器
    public Country(String name) {
        this.name = name;
    }
}
```

### 方法：可变长度参数

从 Java5 开始支持, 只能存在一个可变长度参数，且只能是最后一个参数

```java
public static void test1(String... args) {
    ......
}

public static void test2(String string, String... args) {
    ......
}
```

**遇到方法重载的情况怎么办呢？会优先匹配固定参数还是可变参数的方法呢？**

## [抽象类 - abstract class](https://www.baeldung.com/java-abstract-class)

- 被`abstract`修饰的类是抽象类
- 被`abstract`修饰的是抽象方法，抽象方法只有方法声明,没有具体实现
- 抽象类不能够被实例化，但是可以被继承。普通类继承抽象类必须重写所有抽象方法，抽象类继承抽象类可以重写也可以选择不重写抽象方法
- 抽象类可有存在普通方法
- 一个类包含抽象方法一定是抽象类，但是抽象类不一定包含抽象方法
- 使用抽象类可以复用代码

```java
// 抽象类
public abstract class AbstractTest{
    // 抽象方法
    abstract void testA();
    abstract void testB();
}

class InnerAbstractTestA extends AbstractTest {
    @Override
    void testA() {...}
    @Override
    void testB() {...}
    void testC();
}

abstract class InnerAbstractTestB extends AbstractTest {
    @Override
    void testA() {...}
    abstract void testC();
}
```

## 接口 - interface

```java
public interface InterfaceTest {
    public abstract void testA(); // 即
    default void testB() {
        System.out.println("this a default method in interface");
    }
    static void testC() {
        System.out.println("this a static method in interface");
        System.out.println(param1);
    };
    void testD();
    String param1 = "str";
    public static final String param2 = "str";
}
```

- 接口是特殊的抽象类，接口不能实例化，只能实例化其实现类（接口的访问修饰符只能是`public`和默认）
- Java8接口只能存在抽象方法（方法的声明会默认加上`abstract`）、常量（默认加上`public static final`）、default方法、static方法，Java9中增加了私有方法和私有静态方法

    ```java
    public interface Java9Interface {
        private void method(){
             //TODO
        }
        private static void method(){
             //TODO
        }
    }
    ```

- 实现接口的类必须实现接口所有的方法，`default`方法可以选择性的重写，`static`修饰方法属于类方法不能被重写
- 接口支持多继承
- [类可以实现多个接口，但是接口中不能出现同名方法，若出现同名常量，需要通过接口名访问](https://www.baeldung.com/java-inheritance#2-issues-with-multiple-inheritance)

**提问：如何像JPA那么动态实现接口的重写？**

## 面向对象的三大基本特征

### 封装

封装是指属性私有化，增强数据安全性，不能让其他用户随意访问和修改数据，简化编程，使用者不必在意具体实现细节，而只是通过外部接口即可访问类的成员

- 根据需要提供setter和getter方法来访问属性
- 隐藏具体属性和实现细节，仅对外开放接口
- 控制程序中属性的访问级别

### 继承

```java
public class Father{
}

class Son extends Father{
}
```

- 子类继承父类所有非私有、非静态方法和属性，并且可以重写父类方法
- 子类在实例化时会先实例化父类（其实很好理解，若不先实例化父类，怎么访问父类实例属性）
- 类不支持多继承，接口支持多继承

    ```java
    public interface Floatable {
        void floatOnWater();
    }
    interface interface Flyable {
        void fly();
    }
    public interface SpaceTraveller extends Floatable, Flyable {
        void remoteControl();
    }
    ```

- 当父类和子类出现同名的实例方法或属性时，可以通过`this`和`super`明确的指定你要访问的实例方法或属性
- 当父类和子类出现同名的类方法或属性时，若要在子类中访问父类属性或方法需要通过类名访问

### 多态

多态是指在父类中定义的属性和方法被子类继承之后，可以具有不同的数据类型或表现出不同的行为，这使得同一个属性或方法在父类及其各个子类中具有不同的含义

```java
// 输出：
// 动物叫
// 喵喵喵 ~
// 汪汪汪 ~
public class Polymorphism {
    public static void main(String[] args) {
        Animal animal = new Animal();
        Animal cat = new Cat();
        Animal dog = new Dog();
        animal.call();
        cat.call();
        dog.call();
    }
}
class Animal {
    private String color;
    private String breed;

    public void call() {
        System.out.println("动物叫");
    }
}

class Cat extends Animal {
    @Override
    public void call() {
        System.out.println("喵喵喵 ~");
    }
}

class Dog extends Animal {
    @Override
    public void call() {
        System.out.println("汪汪汪 ~");
    }
}
```

## 函数的重载和重写

- 重写
  - 函数的名称、参数类型、返回值、抛出的异常都不能改变，只能改变其内部逻辑
  - 函数重写发生在类的继承
  - 被`static`和`final`修饰的静态方法不能被重写
- 重载
  - 函数的名称、返回值必须相同，参数类型或者个数必须不相同，访问控制符可以不想同
  - 函数重载发生在当前类中
  - 被`static`修饰的静态方法可以被重载

## 类的加载属性

```java

```

## this & super

### [this](https://www.baeldung.com/java-this)

this 关键字表示当前正在被调用方法的对象

- 可以帮助我们消除局部参数和实力变量之前的歧义

```java
public class KeywordTest {

    private String name;
    private int age;

    public KeywordTest(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

- 调用同类中的其他构造器

```java
public class KeywordTest{
    public KeywordTest(){
        // some code
    }
    public KeywordTest(String name, int age) {
        this();

        // the rest of the code
    }
}
```

- 作为参数传递

```java
public KeywordTest() {
    printInstance(this);
}

public void printInstance(KeywordTest thisKeyword) {
    System.out.println(thisKeyword);
}
```

- 作为返回值，便是当前类的实例
- 内部类访问外部类的实例

```java
public class KeywordTest {
    private String name;
    class ThisInnerClass {
        boolean isInnerClass = true;
        public ThisInnerClass() {
            KeywordTest thisKeyword = KeywordTest.this;
            String outerString = KeywordTest.this.name;
        }
    }
}
```

### [super](https://www.baeldung.com/java-super)

- 在子类构造器中，调用父类构造器，**且必须是第一句**

```java
class Father{
    private String name;
    public Father(){}
    public Father(String name){...}
}

class Son extends Father{
    public Son(){
        super();
    }
    public Son(String name){
        super(name);
    }
}
```

- 表示父类的实例，在子类中通过`super`访问父类的实例变量和方法

```java
public class KeywordSuper {
    String name = "Superman";
    public void myName() {
        System.out.println(this.name);
    }
}

class Son extends KeywordSuper {
    public void one() {
        System.out.println(super.name);
    }
    public void two() {
        super.myName();
    }
    public static void main(String[] args) {
        Son son = new Son();
        son.one();
        son.two();
    }
}

```

## 枚举 Enum

```java
public enum Numbers {

    One("one") {
        @Override
        public void myName() {
            System.out.println("1");
        }
    },
    Two("two") {
        @Override
        public void myName() {
            System.out.println("2");
        }
    },
    Three("three") {
        @Override
        public void myName() {
            System.out.println("3");
        }
    };

    private String name;

    private EnumTest(String name) {
        this.name = name;
    }

    public abstract void myName();
}
```

通过`javap`查看编译后的文件

```java
public final class Numbers extends java.lang.Enum<Numbers> {
  public static final Numbers One;
  public static final Numbers Two;
  public static final Numbers Three;
  public static Numbers[] values();
  public static Numbers valueOf(java.lang.String);
  static {};
}
```

- 枚举类继承`java.lang.Enum`，`java.lang.Enum`是一个抽象类

    ```java
    public abstract class Enum<E extends Enum<E>>
            implements Comparable<E>, Serializable {...}
    ```

- 枚举类中的每个值都是常量`static final`，且类型都是枚举类，枚举类中的值为枚举类的实例
- 枚举类的构造函数必须是`private`
- 枚举类中定义的抽象方法，枚举类的每个实例都必须实现
