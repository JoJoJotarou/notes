---
title: Servlet
date: 2022-06-04
---

::: info Servlet规范三篇文章的源码项目名
hello-servlet
:::

# Servlet

**我的理解：Servlet（Server Applet 的简写，也叫 Java Servlet） 是 Java EE （后面也叫 Jakarta EE）中定义的一套规范（接口），用来处理 Web 请求并对请求做出响应。**

- Applet 是小程序的意思，Server Applet 就是在服务端的小程序，这个服务端也就是我们使用 Java 写的项目（顺便提一嘴：Java Applet 是“客户端小程序”，一般被嵌入到 HTML 页面，运行在支持 Java 的浏览器中。）。
- [狭义的Servlet是指Java语言实现的一个接口，广义的 Servlet 是指任何实现了这个Servlet接口的类，一般情况下，人们将Servlet理解为后者。](https://baike.baidu.com/item/Servlet/477555)

::: warning 约定
本文后续若无特殊强调，提到的 Servlet 都是广义上的，若提到狭义的 Servlet （`javax.servlet.Servlet`）通常称为 Servlet 接口。
:::

## Servlet 容器

> The Apache Tomcat® software is an open source implementation of the Jakarta Servlet, Jakarta Server Pages, Jakarta Expression Language, Jakarta WebSocket, Jakarta Annotations and Jakarta Authentication specifications. These specifications are part of the Jakarta EE platform.

- Tomcat 一个实现 Java EE（从 Tomcat 10 开始使用 Jakarta EE） Servlet 规范轻量级应用服务器，我们写的 Servlet 并不能直接运行，而是由 Tomcat 维护。Tomcat 提供了 Servlet 运行的环境，也叫 Servlet 容器。

- 常见的 Servlet 容器除了 Tomcat 还有 Jetty。

- Tomcat 处理请求的简易图示（/project1 和 /project2 代表 2 个 web 项目，/s1 和 /s2 代表 2 个 Servlet）：

  ![Tomcat 处理请求的简易图示](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206151615899.png)

## Hello Servlet

如图 Servlet 规范是编写一个 Web 应用的最小依赖，让我们快速回顾下如何创建传统 Java Web 项目：

- IDEA （2022.2 EAP） 创建项目

    ![IDEA 创建项目 1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152221471.png)

    ![IDEA创建项目 2](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152221641.png)

- 创建 `webapp/WEB-INF/jsp/hello.jsp`

    ```html
    <%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <html>
    <head>
        <title>${title}</title>
    </head>
    <body>
        <h1>${content}</h1>
    </body>
    </html>
    ```

- 创建 `HelloServlet` 类并实现 `javax.servlet.Servlet`

    ```java
    package com.study.helloservlet;

    import javax.servlet.*;
    import javax.servlet.annotation.WebServlet;
    import java.io.IOException;

    // name 相当于 web.xml 的 <servlet-name>
    // urlPatterns 和 value 作用相同，同时出现忽略 value，相当于 web.xml 的 <url-pattern>
    // ref： http://c.biancheng.net/servlet2/webservlet.html
    @WebServlet(name = "hello", urlPatterns = {"/hello"})
    public class HelloServlet implements Servlet {

        /*
        * init 方法默认只在初次运行是执行
        * 设置 loadOnStartup 为大于等于0的值，就可以启动时运行
        * */
        @Override
        public void init(ServletConfig servletConfig) throws ServletException {
            System.out.println("init ...");
        }

        @Override
        public ServletConfig getServletConfig() {
            return null;
        }

        @Override
        public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
            System.out.println("response ...");
            servletResponse.setContentType("text/html;charset=UTF-8");
            servletRequest.setAttribute("title", "Hello Servlet");
            servletRequest.setAttribute("content", "Hello Servlet");
            RequestDispatcher rd = servletRequest.getRequestDispatcher("/WEB-INF/jsp/hello.jsp");
            rd.forward(servletRequest, servletResponse);
        }

        @Override
        public String getServletInfo() {
            return null;
        }

        /*
        * 中止程序时运行
        * */
        @Override
        public void destroy() {
            System.out.println("destroy ...");
        }
    }
    ```

- 这里使用了 `@WebServlet` 简化配置，以下是 `web.xml` 的配置方法与 `@WebServlet` 相同效果

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
            version="4.0">
        <servlet>
            <servlet-name>hello</servlet-name>
            <servlet-class>com.study.helloservlet.HelloServlet</servlet-class>
            <load-on-startup>0</load-on-startup>
        </servlet>
        <servlet-mapping>
            <servlet-name>hello</servlet-name>
            <url-pattern>/hello</url-pattern>
        </servlet-mapping>
    </web-app>
    ```

- 最终的项目结构（精简后的）

    ```text
    ├─hello-servlet
    │  │  .gitignore
    │  │  hello-servlet.iml
    │  │  pom.xml
    │  │  readme.md
    │  ├─src
    │  │  ├─main
    │  │  │  ├─java
    │  │  │  │  └─com
    │  │  │  │      └─study
    │  │  │  │          └─helloservlet
    │  │  │  │                  HelloServlet.java
    │  │  │  │
    │  │  │  ├─resources
    │  │  │  └─webapp
    │  │  │      │
    │  │  │      └─WEB-INF
    │  │  │          │  web.xml
    │  │  │          │
    │  │  │          └─jsp
    │  │  │                  hello.jsp
    │  │  │
    │  │  └─test
    │  │      ├─java
    │  │      └─resources

    ```

- 最后启动 tomcat ，访问 `http://localhost:8080/hello_servlet_war_exploded/hello` 即可。

知识点：

- `web.xml` 可以定义了一个或者多个 servlet 的处理路径和处理类，Tomcat 解析 `web.xml` 并存入 `servlet` 上下文中。`@WebServlet` 是自 Servlet 3.0 开始支持的注解，目的是简化 XML 配置，与 XML 效果相同。

- **HelloServlet 类实现了 `javax.servlet.Servlet`，`service()` 具体处理请求，并最终让用户在浏览器看到 `hello.jsp` 的内容**，这也恰好符合我对 Servlet 的理解。

- `hello_servlet_war_exploded` 是 IDEA 默认生成的，相当于把程序部署在 `$tomcat_home/webapps/hello_servlet_war_exploded` 目录下 ，可以通过 `运行/调试配置` → `部署` → `应用程序上下文` 修改。

  ![IDEA 修改 war 部署路径](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152243534.png)

## Servlet 生命周期

依旧是上面的例子，假如你尝试多次请求 `http://localhost:8080/hello_servlet_war_exploded/hello` ，仔细看打印的输出信息，你会发现 `init ...` 只会在第一次请求时输出，而 `response ...` 每次请求都会输出，当你中止程序时 `destroy ...` 输出。

**什么是生命周期？生命周期就是从出生到死亡的过程。Servlet 的生命周期就对应着 `init(ServletConfig)` → `service(ServletRequet, ServletResponse)` → `destroy()` 三个方法。**

是谁控制了 Servlet 的生命周期呢？答案是 Servlet 容器（Tomcat），上面提到 Servlet 并不能直接运行，同样也没有手动调用，**Servlet 容器负责 Servlet 的实例化，调用和销毁**。

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152246264.png "图片来源：http://c.biancheng.net/servlet2/life-cycle.html")

- Servlet 容器解析请求，选择对应的 Servlet，然后实例化我们写的 Servlet 并调用 `init` 方法（**只会调用一次，默认首次请求时调用**）
- Servlet 容器接收到来自客户端请求时，容器会针对该请求分别创建一个 `ServletRequst` 对象和 `ServletResponse` 对象，将它们以参数的形式传入 `service()` 方法内，并调用该方法对请求进行处理。在 `service()` 方法中，Servlet 通过 `ServletRequst` 对象获取客户端的相关信息和请求信息。在请求处理完成后，通过 `ServletResponse` 对象将响应信息进行包装，返回给客户端。当 Servlet 容器将响应信息返回给客户端后，`ServletRequst` 对象与 `ServletResponse` 对象就会被销毁。
- 当 Servlet 容器关闭、重启或移除 Servlet 实例时，容器就会调用 `destory()` 方法，释放该实例使用的资源，例如：关闭数据库连接，关闭文件的输入流和输出流等，随后该实例被 Java 的垃圾收集器所回收。

::: tip

Spring Boot 并不由 Servlet 容器实例化和init的，而是使用 Spring 配置来引导自身和嵌入式 Servlet 容器。在 Spring 配置中检测 Filter 和 Servlet ，并在 Servlet 容器中注册。查看 [Spring Boot 文档](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-embedded-container)

:::

## Servlet 加载顺序

Servlet 加载顺序是由 `loadOnStartup` 属性控制，`@WebServlet` 传入 `loadOnStartup = 0`：

```java {1}
@WebServlet(name = "hello", urlPatterns = {"/hello"}, loadOnStartup = 0)
public class HelloServlet implements Servlet {
    .....
}
```

等效的 XML 配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
        version="4.0">
    <servlet>
        <servlet-name>hello</servlet-name>
        <servlet-class>com.study.helloservlet.HelloServlet</servlet-class>
        <load-on-startup>0</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>hello</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>
</web-app>
```

重新启动项目，你会发现在启动时，就会打印 `init ...`，再次请求不会再打印 `init ...`。

::: tip

- `loadOnStartup` 的值必须是一个整数。
- `loadOnStartup` 的值 < 0，或者 `loadOnStartup` 不存在，则 Servlet 容器可以在选择时自由加载 Servlet。
- `loadOnStartup` 的值 >= 0，则容器必须在部署应用程序时加载并初始化 Servlet。值越小加载顺序越靠前。
:::

## HttpServlet

![HttpServlet 的继承关系](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152301070.png)

Java Web 项目开发中通常使用 `javax.servlet.http.HttpServlet`，`HttpServlet` 基于 HTTP 协议根据请求方法定义了响应的处理方法，例如： `doGet()` 、 `doPost()`，默认响应 `405` ：

```java
public abstract class HttpServlet extends GenericServlet{
    // ......
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException
    {
        String protocol = req.getProtocol();
        String msg = lStrings.getString("http.method_get_not_supported");
        if (protocol.endsWith("1.1")) {
            resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, msg);
        } else {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, msg);
        }
    }
    // ......
}
```

使用：

```java
@WebServlet(name = "helloHttpServlet", value = "/hello-http-servlet", loadOnStartup = 0)
public class HelloHttpServlet extends HttpServlet {
    private String message;

    public void init() {
        System.out.println("HttpServlet init ...");
        message = "Hello HttpServlet!";
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        // Hello
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>" + message + "</h1>");
        out.println("</body></html>");
    }

    public void destroy() {
    }
}
```

## 服务端内部转发和客户端重定向

![forward 和 redirect 示意图](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206161548487.png)

首先，假设这是转发请求和重定向请求的目标 servlet

```java
@WebServlet(urlPatterns = "/requestTarget")
public class HelloForwardOrRedirectTarget extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        System.out.println(String.format("this request from %s", req.getAttribute("from") == null ? "Redirect" : req.getAttribute("from")));
    }
}
```

### 服务端内部转发

- 模拟转发请求

  ```java
  @WebServlet(urlPatterns = "/forwardRequest")
  public class HelloForwardRequest extends HttpServlet {
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
          req.setAttribute("from", "Forward");

          req.getRequestDispatcher("requestTarget").forward(req, resp);
      }
  }
  ```

- 浏览器请求 `http://localhost:8080/hello_servlet_war_exploded/forwardRequest` 查看输出信息

- 转发的特点与表现：

  - 客户端只会请求一次
  - 客户端请求地址不变

### 客户端重定向

- 模拟重定向请求

  ```java
  @WebServlet(urlPatterns = "/redirectRequest")
  public class HelloRedirectRequest extends HttpServlet {
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
          resp.sendRedirect("requestTarget");
      }
  }
  ```

- 浏览器请求 `http://localhost:8080/hello_servlet_war_exploded/redirectRequest` 查看输出信息

- 重定向特点与表现：

  - 客户端请求 2 次
  - 客户端请求地址发生改变
  - 客户端首次请求响应码 `302`
  - 客户端首次请求通过 `req.setAttribute("from", "Redirect");` 设置的属性无法在在目标 servlet 中获取到的。

## ServletConfig

`javax.servlet.ServletConfig` 记录了当前 Servlet 的初始化信息。一个项目组可以有多个 ServletConfig ，但是一个 Servlet 只能有一个 ServletConfig （**这里的 Servlet 是广义的即每个 Servlet 接口的子类**）。

### ServletConfig 获取方式

- 方式一：通过 `javax.servlet.Servlet` 的 `init(ServletConfig servletConfig)` 方法的参数获取

  ```java
  public class HelloServlet implements Servlet {
      private ServletConfig config；
      @Override
      public void init(ServletConfig servletConfig) throws ServletException {
    this.config = servletConfig;
      }
  }
  ```

- 方式二：通过调用 `javax.servlet.GenericeServlet` 的 `getServletConfig()` 方法获取

  ```java
  public class HelloHttpServlet extends HttpServlet {
      public void doGet(HttpServletRequest request, HttpServletResponse response) {
          ServletConfig servletConfig = this.getServletConfig();
      }
  }
  ```

### 设置初始化参数

`@WebServlet` 通过 `initParams` 设置：

```java
@WebServlet(name = "hello3", urlPatterns = {"/hello3"}, loadOnStartup = 1, initParams = {@WebInitParam(name = "init", value = "param")} )
public class HelloServlet3 implements Servlet {
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        System.out.println(servletConfig.getInitParameter("init"));
    }
}
```

`web.xml` 通过 `<init-param>` 设置与 `@WebServlet` 效果一致:

```xml
    <servlet>
        <servlet-name>s3</servlet-name>
        <servlet-class>com.study.project01helloservlet.HelloServlet3</servlet-class>
        <init-param>
            <param-name>init</param-name>
            <param-value>param</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>s3</servlet-name>
        <url-pattern>/hello3</url-pattern>
    </servlet-mapping>
```

启动项目将看到控制台输出 `param`

## ServletContext

Servlet 容器在每个 Web 项目启动时会创建唯一的 `javax.servlet.ServletContext` 对象，一般称为 “Servlet 上下文”。项目中所有 Servlet 共同享有 `ServletContext` 。

### ServletContext 获取方式

方式1：通过 `GenericServlet` 提供的 `getServletContext()` 方法

```java
//通过 GenericServlet 的 getServletContext 方法获取 ServletContext 对象 ServletContext
servletContext = this.getServletContext();
```

方式2：通过 `ServletConfig` 提供的 `getServletContext()` 方法

```java
//通过 ServletConfig 的 getServletContext 方法获取 ServletContext 对象 ServletContext
servletContext = this.getServletConfig().getServletContext();
```

方式3：通过 `HttpSession` 提供的 `getServletContext()` 方法

```java
//通过 HttpSession 的 getServletContext 方法获取 ServletContext 对象 ServletContext
servletContext = req.getSession().getServletContext();
```

方式4：通过 `HttpServletRequest` 提供的 `getServletContext()` 方法

```java
//通过 HttpServletRequest 的 getServletContext 方法获取 ServletContext 对象ServletContext
servletContext = req.getServletContext();
```

简单使用，创建如下 Servlet ：

```java
@WebServlet("/helloServletContextSet")
public class HelloServletContextGet extends HttpServlet {
    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        //1.向application保存作用域保存数据
        //ServletContext : Servlet上下文
        ServletContext application = request.getServletContext();
        application.setAttribute("uname", "jojojo");
        //2.客户端重定向
        response.sendRedirect("helloServletContextGet");
    }
}
@WebServlet("/helloServletContextGet")
public class HelloServletContextSet extends HttpServlet {
    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) {
        //1.获取application保存作用域保存的数据，key为uname
        ServletContext application = request.getServletContext();
        Object uname = application.getAttribute("uname");
        System.out.println("uname = " + uname);
    }
}
```

请求 `http://localhost:8080/hello_servlet_war_exploded/helloServletContextGet` 你将看到控制台输出 `uname = jojojo`

## Session

::: tip
**HTTP 是无状态有会话的。**

- **何为无状态？**：在同一个连接中，两个执行成功的请求之间是没有关系的。

- **带来的问题**：用户没有办法在同一个网站中进行连续的交互，比如在一个电商网站里，用户把某个商品加入到购物车，切换一个页面后再次添加了商品，这两次添加商品的请求之间没有关联，服务端无法知道是哪个用户选择了哪些商品。

HTTP 更多知识可以前往 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)

:::

session，会话，抽象的概念是客户端和服务端建立的具有有效期（默认是1800秒）的对话。

具体说就是，客户端请求服务端，服务端创建 session，然后将 sessionId 返回给客户端（通常指浏览器），并以 cookie 的形式存储在客户端（通常指浏览器），客户端（通常指浏览器）再次请求时会在请求头中携带 cookie ，这样服务端可以根据 cookie 中 sessionId 找客户端相关信息从而确认客户端。**注意：session 会在所有 servlet 中共享。**

![session和cookie工作示意图](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206161532127.jpg)

- 模拟首次请求创建 session，添加属性

    ```java
    @WebServlet(urlPatterns = "/helloSessionSet")
    public class HelloSessionSet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            /* 返回与此请求关联的当前会话，或者如果请求没有会话，则创建一个 */
            HttpSession session = request.getSession();
            /* 指定允许客户端最后一次请求到现在的空闲时间（以秒为单位），超过这个时间 servlet 容器使该会话无效 */
            session.setMaxInactiveInterval(600);
            /* 添加参数 */
            session.setAttribute("key1", "test1");
            session.setAttribute("key2", "test2");
        }
    }
    ```

- 浏览器请求 `http://localhost:8080/hello_servlet_war_exploded/helloSessionSet`，响应头 `Set-Cookie` 属性包含 SESSIONID

    ![helloSessionSet](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206161535061.png)

- 模拟非首次请求获取、删除 session 属性

    ```java
    @WebServlet(urlPatterns = "/helloSessionGet")
    public class HelloSessionGet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            /* 返回与此请求关联的当前会话，参数 create 为 false 时，若不存在 session 则返回null */
            HttpSession session = request.getSession(false);
            /* 删除 session 中属性 */
            session.removeAttribute("key2");
            /* 获取 session 中属性 */
            /* 预期输出 test1 */
            System.out.println(session.getAttribute("key1"));
            /*预期输出 null */
            System.out.println(session.getAttribute("key2"));
        }
    }
    ```

- 浏览器请求 `http://localhost:8080/hello_servlet_war_exploded/helloSessionGet`，请求头 `Cookie` 属性包含 SESSIONID

    ![helloSessionGet](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206161536801.png)

- 这样服务器就可能根据 SESSIONID 判定用户

知识点：

- `request.getSession()` 与 `request.getSession(true)` 都表示当 Session 不存在时创建 Session 。
- `request.getSession(false)` 表示当 Session 存在时返回 Session ，不存在时返回 null 。
- `session.invalidate()` 可以使 Seesion 无效，若 Session 失效后再次获取 Session ，相当于变更 SESSIONID。

## 保存作用域

**我的理解：信息在特定范围内都是有效且存在的，这个范围就是作用域。**

- **page**：页面级别，现在几乎不用
- **request**：一次请求响应范围，适用于某个用户（通常指浏览器）的某次请求。[Demo：服务端内部转发](#服务端内部转发)
- **session**：一次会话范围，适用于某个用户（通常指浏览器）。[Deom: Session](#session)
- **application**：整个应用程序范围，也就是全局，适用于所有用户（通常指浏览器），只有在程序中止才会失效。[Demo: Application](#ServletContext)

## 处理 \*.html 和 \*.jsp 请求

尝试 在 `webapp` 目录创建 `hello.html` 和 `hello1.jsp`，分别请求
`http://localhost:8080/hello_servlet_war_exploded/hello.html` 和 `http://localhost:8080/hello_servlet_war_exploded/hello1.jsp` 可以成功获取响应页面，但是我们并没有写过任何处理 `*.html` 和 `*.jsp` 的 Servlet，为什么？这是因为 Tomcat 已经帮助我们实现了：

```xml
<!-- $TOMCAT_HOME/conf/web.xml 定义了 *.JSP 和静态资源请求的处理方式 -->

    <servlet>
        <servlet-name>default</servlet-name>
        <servlet-class>org.apache.catalina.servlets.DefaultServlet</servlet-class>
        <init-param>
            <param-name>debug</param-name>
            <param-value>0</param-value>
        </init-param>
        <init-param>
            <param-name>listings</param-name>
            <param-value>false</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet>
        <servlet-name>jsp</servlet-name>
        <servlet-class>org.apache.jasper.servlet.JspServlet</servlet-class>
        <init-param>
            <param-name>fork</param-name>
            <param-value>false</param-value>
        </init-param>
        <init-param>
            <param-name>xpoweredBy</param-name>
            <param-value>false</param-value>
        </init-param>
        <load-on-startup>3</load-on-startup>
    </servlet>
```

![Tomcat 处理 *.html 和 *.jsp 请求](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152303328.png "图片来源：https://zhuanlan.zhihu.com/p/465936851")
