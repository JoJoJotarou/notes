---
title: Filter
date: 2022-06-16
---

# Filter

**Filter**： 过滤器，根据设定 url-pattern 属性值拦截请求，从而实现对请求和响应检查和修改。

![Filter 作用示意图](http://c.biancheng.net/uploads/allimg/210702/1504236208-0.png "图片来自网络侵删")

## @WebFilter

添加 `/filter/HelloFilter1.java` 实现 `javax.servlet.Filter`

```java{2}
// “/hello” 是该过滤器匹配的路径
@WebFilter("/hello")
public class HelloFilter1 implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // 拦截清晰处理
        System.out.println("filter1 start");
        // 放行语句
        chain.doFilter(request, response);
        // 拦截响应处理
        System.out.println("filter1 end");
    }

    @Override
    public void destroy() {}
}
```

访问 `http://localhost:8080/project01_hello_servlet_war_exploded/hello` 输出语句如下：

```java
init ...
filter1 start
response ...
filter1 end
```

与 `@WebFilter` 等效的 `web.xml` 配置：

```xml
<!-- 和 servlet 基本一致  -->
<filter>
    <filter-name>f1</filter-name>
    <filter-class>com.study.project01helloservlet.filter.HelloFilter1</filter-class>
</filter>
<filter-mapping>
    <filter-name>f1</filter-name>
    <url-pattern>/hello</url-pattern>
</filter-mapping>
```

### initParams

- `initParams`：定义过滤器初始化期间需要向其传递信息。

- `javax.servlet.FilterConfig` 接口与 `javax.servlet.ServletConfig` 类似，用于在过滤器初始化期间向其传递信息。

`@WebFilter` 用法：

```java{2}
// 定义初始化参数
@WebFilter(value = "/hello", initParams = { @WebInitParam(name="init", value = "init-param")})
public class HelloFilter1 implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 获取初始化参数，并输出
        System.out.println(filterConfig.getInitParameter("init"));
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("filter1 start");
        chain.doFilter(request, response);
        System.out.println("filter1 end");
    }

    @Override
    public void destroy() {
    }
}
```

等效的 XML 配置：

```xml
<filter>
        <filter-name>f1</filter-name>
        <filter-class>com.study.project01helloservlet.filter.HelloFilter1</filter-class>
        <init-param>
            <param-name>init</param-name>
            <param-value>init-param</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>f1</filter-name>
        <url-pattern>/hello</url-pattern>
    </filter-mapping>
```

启动项目时就会看到控制台输出 `init-param`

### DispatcherType

`DispatcherType` 元素的取值及其意义：

- **REQUEST**：当用户直接访问页面时，容器将会调用过滤器。如果目标资源是通过 `RequestDispatcher` 的 `include()` 或 `forward()` 方法访问，则该过滤器就不会被调用。
- **INCLUDE**：如果目标资源通过 RequestDispatcher 的 `include()` 方法访问，则该过滤器将被调用。除此之外，该过滤器不会被调用。
- **FORWARD**：如果目标资源通过 RequestDispatcher 的 `forward()` 方法访问，则该过滤器将被调用，除此之外，该过滤器不会被调用。
- **ERROR**：如果目标资源通过声明式异常处理机制访问，则该过滤器将被调用。除此之外，过滤器不会被调用。

`@WebFilter` 用法：

```java{2-7}
@WebFilter(
        dispatcherTypes = {
                DispatcherType.REQUEST,
                DispatcherType.FORWARD,
                DispatcherType.INCLUDE,
                DispatcherType.ERROR
        },
        description = "f4",
        urlPatterns = {"/hello2"},
)
public class HelloFilter4 implements Filter {
    // ...

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // ...
    }

    // ...
}
```

等效的 XML 配置：

```xml
<filter-mapping>
    <filter-name>f3</filter-name>
    <url-pattern>/hello2</url-pattern>
    <dispatcher>ASYNC</dispatcher>
    <dispatcher>ERROR</dispatcher>
    <dispatcher>FORWARD</dispatcher>
    <dispatcher>INCLUDE</dispatcher>
    <dispatcher>REQUEST</dispatcher>
</filter-mapping>
```

## FilterChain

**项目中可以有多个 Filter，若这些 Filter 都拦截同一目标资源，则它们就组成了一个 `FilterChain`（也称过滤器链）。**

假设可以过滤到 `/hello2` 的过滤器有多个：

```java
@WebFilter("/hello2")
public class HelloFilter2 implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("filter2 start");
        chain.doFilter(request, response);
        System.out.println("filter2 end");
    }

    @Override
    public void destroy() {}
}

@WebFilter("/hello2")
public class HelloFilter3 implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("filter3 start");
        chain.doFilter(request, response);
        System.out.println("filter3 end");
    }

    @Override
    public void destroy() {}
}
```

访问 `http://localhost:8080/project01_hello_servlet_war_exploded/hello2` 输出语句如下：

```java
filter2 start
filter3 start
hello2 response ...
filter3 end
filter2 end
```

等效的 XML 配置：

```xml
<filter>
    <filter-name>f2</filter-name>
    <filter-class>com.study.project01helloservlet.filter.HelloFilter2</filter-class>
</filter>
<filter-mapping>
    <filter-name>f2</filter-name>
    <url-pattern>/hello2</url-pattern>
</filter-mapping>

<filter>
    <filter-name>f3</filter-name>
    <filter-class>com.study.project01helloservlet.filter.HelloFilter3</filter-class>
</filter>
<filter-mapping>
    <filter-name>f3</filter-name>
    <url-pattern>/hello2</url-pattern>
</filter-mapping>
```

![FilterChain 作用示意图](http://c.biancheng.net/uploads/allimg/210702/150R61R3-0.png)

::: tip 💡 当有多个 Filter 拦截同一目标资源时的执行顺序：

- 当使用 `@WebFilter` 时根据过滤器类的类名字母排序先后执行
- 当使用 `web.xml` 时右上而下执行
:::
