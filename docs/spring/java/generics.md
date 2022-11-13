# 泛型

## 泛型类

## 泛型接口

## 泛型方法

## 多元泛型

## 通配符

### 泛型上限

不可以修改

### 泛型下限

可以修改，不做校验

## 类型擦除

泛型类型校验只会出现在编译阶段，一旦编译通过泛型类型就会被擦除

泛型是JDK1.5才有的，为了兼容之前的版本，当 Java 代码编译成字节码时，会将泛型信息擦除。无边界泛型通配符会被修改为 Object，有边界（上、下边界）泛型通配符会被修改为边界类型。

即 List<?> -> List<Object> List<? extend String> -> List<String> ;  List<Object> List<? super String> -> List<String>

证明：通过 `jclasslib` 插件（`javap -v xxx.class` 也是可以的）查看字节码信息

LocalVariableTable 存储了编译后真实的类型

![LocalVariableTable](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208122126230.png)

```java
LocalVariableTable:
Start  Length  Slot  Name   Signature
    0     113     0  args   [Ljava/lang/String;
    8     105     1  demo   Lcom/jojojo/generics/GenericsDemo4;
    16      97     2  list   Ljava/util/List;
    79      34     3 list1   Ljava/util/List;
```

LocalVariableTypeTable 存储了泛型类实际值

![LocalVariableTypeTable](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208122127112.png)

```java
LocalVariableTypeTable:
Start  Length  Slot  Name   Signature
    16      97     2  list   Ljava/util/List<Ljava/lang/Integer;>;
    79      34     3 list1   Ljava/util/List<Ljava/lang/Number;>;
```

如何获取泛型类

### 交接方法

## 泛型数组

可以声明泛型数组，但是不能直接创建泛型数组，可以将非泛型数组赋值给泛型数组的声明。

```java
ArrayList<String>[] list = new ArrayList[5];
```
