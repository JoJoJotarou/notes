---
title: 三层架构模式和 MVC 架构模式
date: 2022-06-28
---

## 架构模式

[维基百科：架构模式（architectural pattern）](<https://zh.wikipedia.org/wiki/%E6%9E%B6%E6%9E%84%E6%A8%A1%E5%BC%8F>)是[软件架构](https://zh.wikipedia.org/wiki/%E8%BD%AF%E4%BB%B6%E6%9E%B6%E6%9E%84#%E4%BB%8B%E7%BB%8D)中在给定环境下，针对常遇到的问题的、通用且可重用的解决方案。类似于[软件设计模式](https://zh.wikipedia.org/wiki/%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F_(%E8%AE%A1%E7%AE%97%E6%9C%BA))但覆盖范围更广。

> 通俗的说架构模式告诉我们软件应该怎么搭建，设计模式告诉代码具体怎么写。

架构模式有很多，这里主要说**三层架构模式**和 **MVC 架构模式**，Java Web 开发中常常将两者结合到一起使用，它们的最终目的都是为了程序代码的**解耦**。

## 三层架构模式

> 我认为 Tony Marston 的 [What is the 3-Tier Architecture?](http://www.tonymarston.net/php-mysql/3-tier-architecture.html#what-is-a-tier) 是一篇非常值得阅读文章！

三层架构将软件系统划分为如下三层：

- **表示层（Presentation Layer）**：用户界面 （UI），负责向用户显示数据和接受用户的输入。在 Web 应用程序中，就是接收 HTTP 请求并返回 HTML 响应的部分。
- **业务逻辑层（Business Logic Layer）**：负责处理数据验证、业务规则和特定于任务。
- **数据访问层（Data Access Layer）**: 通过调用相关 API （如：JDBC）执行 SQL 语句来与数据库进行通信。

**请注意在三层架构中，表示层与数据访问层没有直接通信，它们只能通过业务逻辑层通信。**

三层架构模式：

![三层架构模式](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206291444168.png)

三层架构模式中的请求和响应：

![三层架构模式中的请求和响应](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206291444052.png)

<!-- 为什么特地标注 三层（**layer**）架构 ，是因为相应的还有[三层（**tier**）架构](https://en.wikipedia.org/wiki/Multitier_architecture#Three-tier_architecture)，它包括：

- Presentation tier：表示层，用户交互层（UI），通常以客户端或者浏览器网页的形式展示给用户。
- Logic tier：逻辑层，所有业务相关的执行逻辑，通常指应用软件本身。
- Data tier：数据、文件等的存储，如数据库、文件服务器等

通常它们的界限是很模糊，有时候甚至混为一谈。但是我更愿意把 **layer** 看出逻辑上的分层，**tier** 是物理上的分层。**tier** 更像一组服务，本地开发时，客户端，应用服务和数据库都在一台机器上，这时它是一层（**tier**），当部署上线，客户端在用户电脑、应用服务器和数据库部署在不同的服务器上，那么它是三层（**tier**）。当项目编程前后端分离的，web服务器也单独放在一台服务器上，那么它是四层（**tier**）。当分库分表，或者微服务时，只是纵向扩展，他依旧是三或四层（**tier**）。 -->

## MVC 架构模式

**MVC** 把软件系统分为三个基本部分：**模型（Model）**、**视图（View）**和**控制器（Controller）**。

- **Model（M）**：负责业务逻辑（数据验证、业务规则等）和数据库逻辑（增删改查）的处理，同时将响应结果返回给**控制器**。
- **View（V）**：用户界面 （UI），负责向用户显示数据和接受用户的输入。
- **Controller（C）**：相当于**视图**和**模型**的中转站，将用户通过**视图**的发来的请求转给**模型**，同时也将**模型**的响应结果返回给**视图**，从而实现了**视图**数据的更新。

**MVC 中控制器承担中转站的角色（控制器应该尽可能少的包含逻辑代码），拆分视图和模型代码，实现解耦。** 下图是一个典型的 Web MVC 流程：

![MVC 演示图](https://www.awaimai.com/wp-content/uploads/2017/10/web_mvc.gif "图片来源：https://www.awaimai.com/wp-content/uploads/2017/10/web_mvc.gif")

## MVC 加三层架构模式

由于 MVC 并没有关注数据访问层，而是划分到了Model，所以三层架构模式和 MVC 架构模式是互补的。

![MVC 加三层架构模式 1](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206291452249.png)

> `DAO` 就是指负责数据访问的对象 —— Data Access Object。

![MVC 加三层架构模式 2](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206291450234.png)

[导航页↩️](../index.md)
