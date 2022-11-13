---
title: "Java 小技巧"
date: 2022-06-27
description: ""
---

## 可变参数

当函数的传参不确定个数时，我们可以使用可变参数表示，它的标识符 `...` ，例如：

```java
public Object invoke(Object obj, Object... args){}
```

**注意：可变参数只能放在参数列表的最后。**

调用方式有以下2种：

```java
// 方式一：所有参数直接传递给函数
invoke(obj, arg1, arg2, arg3);

// 方式二：将参数存入数组，只用传递数组给函数即可
Object[] args = new Object[3];
invoke(obj, args);
```

{{< highlight t \"linenos=table,noclasses=false\" >}}
  t
{{< / highlight >}}

<details>
<summary>展开查看</summary>
```java
System.out.println("Hello to see U!");
String anme = "213";
```
</details>

:::details{open="true" summary="世界和平"}
摘要内容
:::

[导航页↩️](../index.md)
