
# Throwable

![Java异常类层次结构](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208131406202.png)

Throwable 是所有异常类的超类：

- `Eroor` 类及其子类表示程序无法处理的异常，处于严重错误
- `Exception` 类及其子类表示程序可捕获可处理的异常， `Exception` 有分为运行时异常（`RuntimeException`）和非运行时异常。
  - 运行时异常在编译阶段无法检查出，程序可以不处理（`try`/`throws`），在程序运行时也可以被抛出。
  - 而非运行时异常在编译阶段可以检查出来，若不处理编译（`try`/`throws`）则无法通过编译，所以非运行时异常也叫编译异常。

## 可查的异常（checked exceptions）和不可查的异常（unchecked exceptions）

`Eroor` 和 `RuntimeException` 以及其子类都是不可检查异常，即编译时发现不了，其他非运行时异常都是可检查异常，可以在编译时发现，且处理编译（`try`/`throws`）无法通过编译。

## throw 和 throws

`throws` 表示声明可能会抛出某个异常：

```java
public static void main(String[] args) throws ClassNotFoundException {
    // 只有当 com.jojojo.test 真的不存在时才会抛出 ClassNotFoundException
    Class.forName("com.jojojo.test");
}
```

`throw` 表示抛出某个异常，立即生效：

```java
public static void main(String[] args) {
    throw new RuntimeException("这是手动抛出的异常，立即生效");
}
```

## Java 7 的 try-with-resource

当资源实现了 `AutoCloseable` 接口，你可以使用这个语法。当你在 `try` 子句中打开资源，资源会在 `try` 代码块执行后或异常处理后自动关闭。

![InputStream 实现 AutoCloseable](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208131437825.png)

resource 目录下有名为 `test.txt` 文件，其内容为 `123`

```java
public class TryResource {
    public static void main(String[] args) {
        try (InputStream is = TryResource.class.getClassLoader().getResourceAsStream("test.txt")) {
            byte[] bytes = is.readAllBytes();
            String s = new String(bytes);
            System.out.println(s);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
// 输出结果
// 123
```
