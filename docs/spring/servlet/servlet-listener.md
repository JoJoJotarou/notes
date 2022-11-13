---
title: Listener
date: 2022-06-16
---

# Listener

- **Listener（监听器）**，监听某个事件，在事件发生时触发执行。**一般指 Listener 接口或者接口的实现类。Listener 接口定义监听的事件，其实现类负责监听到事件发生后具体执行。**

- **事件**，可能发生的事情，在 Java 中可以是类的创建销毁，属性添加删除等。

- **Servlet Listener** 是 Servlet 规范中定义监听器，用于监听 ServletContext (application)、Httpsession (session)、ServletRequest (request) 等作用域对象的创建与销毁事件，以及监听这些作用域对象中属性发生修改的事件；

**监听器有很多本文主要说的是 Servlet Listener。**

## Servlet 规范中定义的 Listener

所有的监听器都继承 `java.util.EventListener`。下面是`@WebListener` javadoc 罗列的监听器。

### ServletContext

| 接口名                          | 监听事件                                  |
| ------------------------------- | ----------------------------------------- |
| ServletContextListener          | ServletContext 对象的创建与销毁过程       |
| ServletContextAttributeListener | ServletContext 对象的属性新增、移除和替换 |

### HttpSession

| 接口名                       | 监听事件                               |
| ---------------------------- | -------------------------------------- |
| HttpSessionListener          | HttpSession 对象的创建和销毁过程       |
| HttpSessionAttributeListener | HttpSession 对象的属性新增、移除和替换 |
| HttpSessionIdListener        | 会话 id 的变化                         |

### ServletRequest

| 接口名                          | 监听事件                                      |
| ------------------------------- | --------------------------------------------- |
| ServletRequestListener          | ServletRequest 对象的创建和销毁过程           |
| ServletRequestAttributeListener | HttpServletRequest 对象的属性新增、移除和替换 |

## Listener 注册

实现 Servlet Listener 并不能使其生效，必须通过 `@WebListener` 或者 `web.xml` 进行注册。下面是 `ServletRequestListener` 的例子：

- `@WebListener` 注册

  ```java
  @WebListener
  public class MyListener1 implements ServletRequestListener {
      /* 监听 ServletRequest 对象的销毁 */
      @Override
      public void requestDestroyed(ServletRequestEvent sre) {
          ServletRequestListener.super.requestDestroyed(sre);
          System.out.println("listener request destroyed ...");
      }

      /* 监听 ServletRequest 对象的创建 */
      @Override
      public void requestInitialized(ServletRequestEvent sre) {
          System.out.println("listener request initialized ...");
      }
  }
  ```

- `web.xml` 注册

  ```xml
  <listener>
      <listener-class>com.study.project01helloservlet.listener.MyListener1</listener-class>
  </listener>
  ```

- 发起任意请求控制台将在请求一开始输出 `listener request initialized ...` ，在请求结束 `listener request destroyed ...` 时输出 `listener request destroyed ...`
