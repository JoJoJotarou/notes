
## 字符串和字符串常量池

字符串常量池从jdk 1.8开始由于永久代移出堆内存变为元数据，字符串常量池保留在堆中，现在对照字节码文件对字符串存储一探究竟。

```java
String s1 = "java";
```

对应的字节码：

```java
0 ldc #7 <java>
2 astore_1
3 return
```

```java
String s2 = new String("java");
```

对应的字节码：

```java
0 new #7 <java/lang/String>
3 dup
4 ldc #9 <java>
6 invokespecial #11 <java/lang/String.<init> : (Ljava/lang/String;)V>
9 astore_1
```

```java
        String a = "ja";

        String b = "va";

        String c = a + b;
```

```java

 0 ldc #7 <ja>
 2 astore_1
 3 ldc #9 <va>
 5 astore_2
 6 aload_1
 7 aload_2
 8 invokedynamic #11 <makeConcatWithConstants, BootstrapMethods #0>
13 astore_3
14 return

```

```java
String d = "ja" + "va";
```

```java
0 ldc #7 <java>
2 astore_1
3 return
```
