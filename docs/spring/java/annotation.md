# Java Annotation 注解

注解是 JDK1.5 版本开始引入的一个特性。注解由 `@interface` 修饰，常用的 `@Override` 就是一个元注解：

```java
// 重写注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}
```

JDK 自带的元注解还有：`@Deprecated` 、`@SuppressWarnings`

## 元注解

元注解是用来定义注解的注解。`@Target(ElementType.ANNOTATION_TYPE)` 注释的注解就是元注解。

- `@Documented`：标明是否生成 javadoc 文档

- `@Retention(RetentionPolicy.RUNTIME)`：标明注解被保留的阶段，`RUNTIME > CLASS > SOURCE`

```java
public enum RetentionPolicy {
    // 注解将在编译阶段被丢弃
    SOURCE,
    // 注解将由编译器记录在类文件中，但不需要在运行时由 VM 保留。这是默认行为
    CLASS,
    // 注释将由编译器记录在类文件中，并在运行时由 VM 保留，因此可以反射性地读取它们
    RUNTIME
}
```

- `@Target(value={CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, MODULE, PARAMETER, TYPE})`：标明注解的使用范围

```java
public enum ElementType {
    //用于类(class)、接口(interface)（包括注解接口(@interface)）、枚举(enum)或记录(Record)声明
    // Record 是在JDK14是预览特性，在JDK16称为正式特性
    // JSR 359: https://openjdk.org/jeps/359
    TYPE,

    // 字段（包括枚举常量）
    FIELD,

    // 方法
    METHOD,

    // 形参
    PARAMETER,

    // 构造函数
    CONSTRUCTOR,

    // 局部变量
    LOCAL_VARIABLE,

    // 注解接口
    ANNOTATION_TYPE,

    // 包
    PACKAGE,

    // 类型参数
    TYPE_PARAMETER,

    // 使用类型
    TYPE_USE,

    // 模块 since jdk 9
    MODULE,

    /**
     * 记录组件
     * @since 16
     */
    RECORD_COMPONENT;
}
```

- `@Inherited`：标明注解可继承，即用带有 `@Inherited` 的元注解的注解注释类A，其子类B，也继承注释信息。

- `@Repeatable`：JDK 1.8 才有，标明在 `@Target` 范围可重复使用该注解。

### 自定义注解

自定义注解，同时解释 `@Inherited` ：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface MyAnnotation {

    String name() default "";

    String code() default "";
}

@MyAnnotation(name = "test", code = "001")
public class Father {
}

public class Son extends Father {
}

public class Test {
    public static void main(String[] args) {
        Class<Son> sonClass = Son.class;

        for (Annotation annotation : sonClass.getAnnotations()) {
            if (annotation instanceof MyAnnotation) {
                MyAnnotation myAnnotation = (MyAnnotation) annotation;

                System.out.println(myAnnotation.name());
                System.out.println(myAnnotation.code());
            }
        }

    }
}
// 输出结果：
// test
// 001
```

自定义注解，同时解释 `@Repeatable`：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Roles {
    Role[] value();
}

@Retention(RetentionPolicy.RUNTIME)
@Repeatable(value = Roles.class)
@Target(ElementType.TYPE)
public @interface Role {
    String value();
}

@Role("admin")
@Role("ceo")
public class User {

    public static void main(String[] args) {
        for (Annotation annotation : User.class.getAnnotations()) {
            System.out.println("注解类型：" + annotation.annotationType().getTypeName());

            if (annotation instanceof Roles) {
                Roles roles = (Roles) annotation;
                for (Role role : roles.value()) {
                    System.out.println("注解值" + role.value());
                }
            }
        }
    }
}
// 输出结果
// 注解类型：com.jojojo.annotation.repeatable.Roles
// 注解值admin
// 注解值ceo
```
