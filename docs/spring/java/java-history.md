---
title : Java 版本及历史
date: 2022-06-15
---

# {{ $frontmatter.title }}

## Java Platform

[![Java Platform](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206181635286.png)](https://docs.oracle.com/en/java/index.html)

**我的理解：所谓 Java Platform 就是有助于开发和运行用 Java 编程语言编写的程序的环境**。为了满足不同设备和应用领域，自 Java 2 开始 Java 被分为如下三个平台：

- **Java SE（Java Platform，Standard Edition）**：标准版，用于开发和部署桌面、服务器以及嵌入设备和实时环境中的 Java 应用程序，Java SE为Java EE 和 Java ME 提供了基础。通常指 JDK 。

- **Java EE（Java Platform, Enterprise Edition）**：企业版，是基于 Java SE 并由社区驱动的企业软件（Web）技术标准，例如：JSP（Java Server Page）、Servlet（Java Servlet）、WebSocket、JDBC（Java Database Connectivity） 等。***2017 年 9 月，Oracle 决定将 [Java EE 转让给 Eclipse Foundation](https://eclipse-foundation.blog/2017/09/12/java-ee-moves-to-the-eclipse-foundation/) ，之后 Java EE 改名 Jakarta EE（从 Jakarta EE 9 开始命名空间从 `javax.*` 变为 `jakarta.x`）***。

- **Java ME（Java Platform，Micro Edition）**：Micro 版，是为机顶盒、移动电话和PDA之类嵌入式消费电子设备提供的Java语言平台，包括虚拟机和一系列标准化的 Java API 。（**不做讨论并非学习的目标**）

## Java SE

### JVM JDK JRE、

### 名词解释

**TODO**

- JVM

- Java 编译器（Java Compiler）：也就是 `javac` 这个命令，将源码（`.java`文件）编译成字节码（`.class` 文件）
- Java 解释器（Java Interpreter）：将字节码翻译成机器码，通俗的说物理机器并不认识字节码，那么就需要一个“翻译官”给物理机器解释这段字节码是什么意思，而 Java 解释器就是这个“翻译官”，这样物理机器才能运行我们的代码。
- JIT 编译器（Just-In-Time Compiler）将字节码文件转换成机器码

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206152150225.png "图片源地址：https://blog.csdn.net/luzhensmart/article/details/108278108")

### SE 版本历史

参考：[Java version history - Wikipedia](https://en.wikipedia.org/wiki/Java_version_history)

|         版本         | JDK版本 |   发布日期    |                                                                           最终免费公开更新时间                                                                            | 最后延伸支持日期 | 备注                                                                                           |
| :------------------: | ------- | :-----------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------: | ---------------------------------------------------------------------------------------------- |
|       JDK Beta       |         |     1995      |                                                                                     ?                                                                                     |        ?         |                                                                                                |
|       JDK 1.0        | 1.0     | 1996 年 1 月  |                                                                                     ?                                                                                     |        ?         | 第一个版本于1996年1月23日发布，叫做为Oak。而真正第一个稳定的版本JDK 1.0.2，被称作Java 1        |
|       JDK 1.1        | 1.1     | 1997 年 2 月  |                                                                                     ?                                                                                     |        ?         |                                                                                                |
|       J2SE 1.2       | 1.2     | 1998 年 12 月 |                                                                                     ?                                                                                     |        ?         | 该版本到J2SE 5.0更名为Java 2，取代JDK命名。标准版命名为J2SE，与企业版J2EE和Micro版J2ME做区分。 |
|       J2SE 1.3       | 1.3     | 2000 年 5 月  |                                                                                     ?                                                                                     |        ?         |                                                                                                |
|       J2SE 1.4       | 1.4     | 2002 年 2 月  |                                                                               2008 年 10 月                                                                               |   2013 年 2 月   |                                                                                                |
|       J2SE 5.0       | 1.5     | 2004 年 9 月  |                                                                               2009 年 11 月                                                                               |   2015 年 4 月   | 版本号由1.5变为5.0是为更好的反映成熟度、稳定性、可扩展性和 J2SE 的安全水准。                   |
|      Java SE 6       | 1.6     | 2006 年 12 月 |                                                                               2013 年 4 月                                                                                |  2018 年 12 月   |                                                                                                |
|      Java SE 7       | 1.7     | 2011 年 7 月  |                                                                               2015 年 4 月                                                                                |   2022 年 7 月   |                                                                                                |
| **Java SE 8 (LTS)**  | 1.8     | 2014 年 3 月  | Oracle 于 2019 年 1 月停止更新（商用） Oracle 于 2030 年 12 月停止更新（非商用） AdoptOpenJDK 于 2026 年 5 月或之后停止更新 Amazon Corretto 于 2026 年 5 月或之后停止更新 |  2030 年 12 月   | 长期支持的版本                                                                                 |
|      Java SE 9       | 9       | 2017 年 9 月  |                                                                      OpenJDK 于 2018 年 3 月停止更新                                                                      |      不适用      | 从此版本开始新版本发布周期缩短至6个月。                                                        |
|      Java SE 10      | 10      | 2018 年 3 月  |                                                                      OpenJDK 于 2018 年 9 月停止更新                                                                      |      不适用      |                                                                                                |
| **Java SE 11 (LTS)** | 11      | 2018 年 9 月  |                                         AdoptOpenJDK 于 2024 年 10 月或之后停止更新 Amazon Corretto 于 2027 年 9 月或之后停止更新                                         |   2026 年 9 月   | 长期支持的版本                                                                                 |
|      Java SE 12      | 12      | 2019 年 3 月  |                                                                      OpenJDK 于 2019 年 9 月停止更新                                                                      |      不适用      |                                                                                                |
|      Java SE 13      | 13      | 2019 年 9 月  |                                                                      OpenJDK 于 2020 年 3 月停止更新                                                                      |      不适用      |                                                                                                |
|      Java SE 14      | 14      | 2020 年 3 月  |                                                                      OpenJDK 于 2020 年 9 月停止更新                                                                      |      不适用      |                                                                                                |
|      Java SE 15      | 15      | 2020 年 9 月  |                                                                      OpenJDK 于 2021 年 3 月停止更新                                                                      |      不适用      |                                                                                                |
|      Java SE 16      | 16      | 2021 年 3 月  |                                                                      OpenJDK 于 2021 年 9 月停止更新                                                                      |      不适用      |                                                                                                |
| **Java SE 17 (LTS)** | 17      | 2021 年 9 月  |                                                      Azul 于 2029 年 9 月停止更新 Microsoft 于 2027 年 9 月停止更新                                                       |   2029 年 9 月   | 长期支持的版本                                                                                 |
|      Java SE 18      | 18      |  2022年 3月   |                                                                      OpenJDK 于 2022 年 9 月停止更新                                                                      |      不适用      |                                                                                                |
|         ...          |         |               |                                                                                                                                                                           |                  |                                                                                                |

- JDK 版本号变更

  ```java
  > java -version
  openjdk version "1.8.0_322"
  OpenJDK Runtime Environment (build 1.8.0_322-b06)
  OpenJDK 64-Bit Server VM (build 25.322-b06, mixed mode)

  > java -version
  openjdk version "9.0.4"
  OpenJDK Runtime Environment (build 9.0.4+11)
  OpenJDK 64-Bit Server VM (build 9.0.4+11, mixed mode)
  ```

- **推荐选择 LTS 版本的使用**
- [Java Platform, Standard Edition Documentation - Releases (oracle.com)](https://docs.oracle.com/en/java/javase/index.html)

## Java EE / Jakarta EE

### 技术清单

- [Java EE 8 Technologies - Oracle](https://www.oracle.com/java/technologies/java-ee-8.html)

- [Jakarta EE Releases - Eclipse Foundation](https://jakarta.ee/release/)

### EE 版本历史

参考：[Jakarta EE - Wikipedia](https://en.wikipedia.org/wiki/Jakarta_EE#History)

|      版本      |  发布日期  |     Java SE 支持      |                重要更改                 |
| :------------: | :--------: | :-------------------: | :-------------------------------------: |
| Jakarta EE 10  |   未发布   | Java SE 17 Java SE 11 |                                         |
| Jakarta EE 9.1 | 2021-05-25 | Java SE 11 Java SE 8  |               JDK 11 支持               |
|  Jakarta EE 9  | 2020-12-08 |       Java SE 8       | API 命名空间从 `javax` 移动到 `jakarta` |
|  Jakarta EE 8  | 2019-09-10 |       Java SE 8       |          与 Java EE 8 完全兼容          |
|   Java EE 8    | 2017-08-31 |       Java SE 8       |       基于 HTTP/2 和 CDI 的安全性       |
|   Java EE 7    | 2013-05-28 |       Java SE 7       |      WebSocket、JSON 和 HTML5 支持      |
|   Java EE 6    | 2009-12-10 |       Java SE 6       |          CDI 托管 Bean 和 REST          |
|   Java EE 5    | 2006-05-11 |       Java SE 5       |                Java 注释                |
|    J2EE 1.4    | 2003-11-11 |       J2SE 1.4        |        WS-I 可互操作的 Web 服务         |
|    J2EE 1.3    | 2001-09-24 |       J2SE 1.3        |             Java 连接器架构             |
|    J2EE 1.2    | 1999-12-17 |       J2SE 1.2        |              初始规格发布               |

### Servlet API 版本版本对照

来自[维基百科](https://zh.wikipedia.org/wiki/Java_Servlet)

| Servlet API 版本 |   发布日期    |         平台         |                                  重要更改                                   |
| :--------------: | :-----------: | :------------------: | :-------------------------------------------------------------------------: |
|   Servlet 6.0    |    未发布     |    Jakarta EE 10     |          [see](https://jakarta.ee/zh/specifications/platform/10/)           |
|   Servlet 5.0    | 2020年6月12日 |     Jakarta EE 9     |                         移到包名到`jakarta.servlet`                         |
|  Servlet 4.0.3   | 2019年3月13日 |     Jakarta EE 8     |                               去除“Java”商标                                |
|   Servlet 4.0    |   2017年9月   |      Java EE 8       |                                   HTTP/2                                    |
|   Servlet 3.1    |   2013年5月   |      Java EE 7       |        Non-blocking I/O, HTTP protocol upgrade mechanism (WebSocket)        |
|   Servlet 3.0    |  2009年12月   | Java EE 6, Java SE 6 | Pluggability, Ease of development, Async Servlet, Security, File Uploading  |
|   Servlet 2.5    |   2005年9月   | Java EE 5, Java SE 5 |                   Requires Java SE 5, supports annotation                   |
|   Servlet 2.4    |  2003年11月   |  J2EE 1.4, J2SE 1.3  |                           web.xml uses XML Schema                           |
|   Servlet 2.3    |   2001年8月   |  J2EE 1.3, J2SE 1.2  |                            Addition of `Filter`                             |
|   Servlet 2.2    |   1999年8月   |  J2EE 1.2, J2SE 1.2  | Becomes part of J2EE, introduced independent web applications in .war files |
|   Servlet 2.1    |  1998年11月   |     Unspecified      |  First official specification, added `RequestDispatcher`, `ServletContext`  |
|   Servlet 2.0    |               |       JDK 1.1        |                  Part of Java Servlet Development Kit 2.0                   |
|   Servlet 1.0    |   1997年6月   |                      |                                                                             |

### Tomcat

🚨 Tomcat 从 10 开始实现 Jakarta EE，命名空间从 `javax.*` 变为 `jakarta.x`。
[Tomcat Version](https://tomcat.apache.org/whichversion.html)

| Servlet Spec version | Apache Tomcat Version | Supported Java Versions |
| :------------------: | :-------------------: | :---------------------: |
|         6.0          |        10.1.x         |      11 and later       |
|         5.0          |        10.1.x         |       8 and later       |
|         4.0          |         9.0.x         |       8 and later       |
|         3.1          |         8.5.x         |       7 and later       |
