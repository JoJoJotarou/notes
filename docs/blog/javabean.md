---
title: ✏️ Java 中的术语
---

# {{ $frontmatter.title }}

## JavaBean

JavaBean 是应遵循以下约定的 Java 类：

- 它应该有一个无参数的构造函数。
- 它应该是可序列化的。实现 `Serializable` 接口
- 它应该提供设置和获取属性值的方法，称为 getter 和 setter 方法。

```java
public class Employee implements Serializable {

    private String name;

    private float salary;

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public float getSalary() {
        return salary;
    }

    public void setSalary(float salary) {
        this.salary = salary;
    }
}
```
