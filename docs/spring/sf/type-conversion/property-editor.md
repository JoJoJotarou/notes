---
title: Spring 类型转换：PropertyEditor
date: 2022-07-15
---


<script setup>
import { onMounted } from 'vue';
import mediumZoom from 'medium-zoom';

onMounted(() => {
  mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' });
});
</script>

<style>
.medium-zoom-overlay {
  z-index: 20;
}

.medium-zoom-image {
  z-index: 21;
}
</style>

# {{ $frontmatter.title }}

`PropertyEditor` 是 [java beans](https://docs.oracle.com/javase/8/docs/api/java/beans/package-summary.html) 的概念，用来实现 Object 和 String 之间的转换。Spring Framework 中[内置了许多 PropertyEditor 的实现](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-beans-conversion)。

Spring 文档提到 2 种使用 Property Editor 场景，一种是 XML 中值的转换，一种是 MVC 项目中接收请求参数的转换，都可以用 Property Editor 将字符串转成对象。例如 `ClassEditor` 允许在 XML 文件中声明的某个 bean 的属性值是类的完全限定名（属性类型需要是 `Class` 类型），Spring 使用 `ClassEditor` 尝试将参数解析为 Class 对象。

::: details Spring 内置 PropertyEditor 实现 `ClassEditor` 演示：

`User` 属性 cls 的类型是 `Class` ：

```java
public class User {
    private Class cls;
}
public class Phone {}
```

app.xml 定义名为 user 的 bean ，同时 `<property>`（即 setter）的 `value` 是某个类的完全限定名

```xml
<bean id="user" class="com.jojojotarou.springframeworkpropertyeditor.User">
    <property name="cls" value="com.jojojotarou.springframeworkpropertyeditor.Phone">
    </property>
</bean>
```

测试代码，通过输出结果，Spring 通过 `ClassEditor` 将 String 转成了 Class (在 `ClassEditor` 类的 `setAsText` 方法加个断点即可发现)：

```java
public class Test {

    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("app.xml");
        User user = (User) context.getBean("user");
        System.out.println(user);
    }
}

// 输出结果：
// User{cls=class com.jojojotarou.springframeworkpropertyeditor.Phone}
```

:::

![自定义 Property Editor 相关的核心类](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207151717409.png "图片来源网络侵删"){data-zoomable}

上图展示了自定义 Property Editor 涉及的核心类，其中 `PropertyEditor` 和 `PropertyEditorSupport` 是 `java.beans` 包下的，其他都是 `org.springframework.beans` 下的。

- `PropertyEditor` 是 Property Editor 的顶级接口， `PropertyEditorSupport` 是其内置实现，我们自定义 Property Editor 一般继承该类即可。
- `PropertyEditorRegistrar` 是用来登记 Property Editor 类与它所支持的类，即绑定关系。
- `CustomEditorConfigurer` 是自定义 Property Editor 的配置器，是一个 BeanFactoryPostProcess，通过 `setCustomEditors` 直接配置 Property Ediotr 与它支持的类，也能通过 `setPropertyEditorRegistrars` 配置 Property Ediotr 与它支持的类。
- `PropertyEditorRegistry` 用来注册 Property Ediotr 到容器。

## Automatic Property Editor Binding

得益于 Java 标准 JavaBeans PropertyEditor 查找机制，**只要将 PropertyEditor 类命名为它所支持的类的名字加上 Editor 后缀（例如：`CreditCard` 和 `CreditCardEditor`），并将自定义 PropertyEditor 类与它所支持的类放在同一个包中即可被自动找到。**

:::details 下面是 Spring MVC 项目的最小依赖，按需添加

```xml
<!-- Java EE 8 servlet 规范 -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
</dependency>
<!-- Spring web MVC 框架（包含了 Spring IoC、AOP 等功能） -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.3.20</version>
</dependency>
<!-- 在 @RestController 中将返回的对象转换成 JSON -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.3</version>
</dependency>
```

:::

在测试场景中，我们将在请求 URL 中将信用卡号 `cardNo` 作为路径变量传递，并将该值绑定为 `CreditCard` 对象。字段 `rawCardNumber` 存放原始字符串、 `bankIdNo` 存放银行标识号（前 6 位）、 `accountNo` 存放帐号（从 7 到 15 的数字）、 `checkCode` 存放校验码（最后一位）：

```java
package com.jojojotarou.springframeworkpropertyeditorautomatic;

public class CreditCard implements Serializable {
    private String rawCardNumber;
    private Integer bankIdNo;
    private Integer accountNo;
    private Integer checkCode;
    // 省略 getter、 setter
}
```

继承 `PropertyEditorSupport` 自定义  `CreditCardEditor` ：

```java
package com.jojojotarou.springframeworkpropertyeditorautomatic;

public class CreditCardEditor extends PropertyEditorSupport {

    /**
     * 将对象序列化为字符串时会调用 getAsText() 方法，变成人类可读字符串
     * 🚨🚨🚨 不知道什么时候被调用 🚨🚨🚨
     */
    @Override
    public String getAsText() {
        CreditCard creditCard = (CreditCard) getValue();
        return creditCard.getRawCardNumber();
    }

    /**
     * 用于将字符串转换为一个对象
     */
    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        if (!StringUtils.hasText(text)) {
            // 设置对象的实际值
            setValue(null);
        } else {
            CreditCard creditCard = new CreditCard();
            creditCard.setRawCardNumber(text);

            String cardNo = text.replaceAll("-", "");
            if (cardNo.length() != 16)
                throw new IllegalArgumentException(
                        "Credit card format should be xxxx-xxxx-xxxx-xxxx");
            // 前6为是银行标识
            creditCard.setBankIdNo(Integer.valueOf(cardNo.substring(0, 6)));
            // 7-15位是账户
            creditCard.setAccountNo(Integer.valueOf(cardNo.substring(6, 15)));
            // 最后一位是校验码
            creditCard.setCheckCode(Integer.valueOf(cardNo.substring(15)));
            // 设置对象的实际值
            setValue(creditCard);
        }
    }
}
```

:::details 其他相关代码（这里为了缩短篇幅折叠）

配置类：

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.jojojotarou.springframeworkpropertyeditorautomatic")
public class WebAppConfig {
}
```

初始化 Web 项目：

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        // Load Spring web application configuration
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(WebAppConfig.class);

        // Create and register the DispatcherServlet
        DispatcherServlet servlet = new DispatcherServlet(context);
        ServletRegistration.Dynamic registration = servletContext.addServlet("app", servlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/app/*");
    }
}
```

CreditCard 控制器：

```java
@RestController
@RequestMapping("creditCard")
public class CreditCardController {
    /**
     * produces = MediaType.APPLICATION_JSON_VALUE 的作用是告诉 spring 这里接收的是 JSON，会触发 CreditCardEditor 处理收到的字符串
     *
     * @param cardNo
     * @return
     */
    @GetMapping(value = "{cardNo}")
    public CreditCard parseCreditCard(@PathVariable("cardNo") CreditCard cardNo) {
        return cardNo;
    }
}
```

💡 需要注意的是若 `CreditCard` 没有 `implements Serializable` ， `@GetMapping` 需要添加 `produces` 属性：

```java
@GetMapping(value = "{cardNo}", produces = MediaType.APPLICATION_JSON_VALUE)
```

:::

当访问 `GET http://localhost:8080/spring_framework_property_editor_war_exploded/app/creditCard/1234-1234-1111-0011` 将看到如下信息:

```json
{
  "rawCardNumber": "1234-1234-1111-0011",
  "bankIdNo": 123412,
  "accountNo": 341111001,
  "checkCode": 1
}
```

::: info 源码
spring-framework-property-editor-automatic
:::

## Custom Property Editor Binding

### @InitBinder

在 spring mvc 项目中使用 `@InitBinder` 在控制器中注册 `PropertyEditor` （**注意：`PropertyEditor` 仅在注册 `PropertyEditor` 的控制器中生效**） ，也有相同效果

```java
package com.jojojotarou.springframeworkpropertyeditorinitbinder.domain;
public class User implements Serializable {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

自定义 `PropertyEditoy`，实现效果就是字符串转 User 对象时，name字段加上 `@` 前缀：

```java
package com.jojojotarou.springframeworkpropertyeditorinitbinder.editor;
public class CustomUserPropertyEditor extends PropertyEditorSupport {

    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        User user = new User();
        user.setName("@" + text);
        setValue(user);
    }
}
```

::: tip
此测试案例时是不满住自动绑定的条件的
:::
`User` 控制器，这里通过 `@InitBinder` 注册 `CustomUserPropertyEditor`：

```java {5-9}
@RestController
@RequestMapping("user")
public class UserController {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(User.class,
                new CustomUserPropertyEditor());
    }

    @GetMapping(value = "{userName}")
    public User parseCreditCard(@PathVariable("userName") User user) {
        System.out.println(user.getName());
        return user;
    }
}
```

`MyWebApplicationInitializer` 和 `WebAppConfig` 的代码与自动绑定相同这里省略。

访问 `http://localhost:8080/spring_framework_property_editor_initbinder_war_exploded/app/user/xiaoming` 将会得到如下结果：

```java
{
  "name": "@xiaoming"
}
```

::: info 源码
spring-framework-property-editor-initbinder
:::

### CustomEditorConfigurer

`CustomEditorConfigurer` 实现了 `BeanFactoryPostProcessor` 也就是说会在合适的时机被执行注册 `PropertyEditor` 逻辑：

```java
public class CustomEditorConfigurer implements BeanFactoryPostProcessor, Ordered {
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        if (this.propertyEditorRegistrars != null) {
            for (PropertyEditorRegistrar propertyEditorRegistrar : this.propertyEditorRegistrars) {
                beanFactory.addPropertyEditorRegistrar(propertyEditorRegistrar);
            }
        }
        if (this.customEditors != null) {
            this.customEditors.forEach(beanFactory::registerCustomEditor);
        }
    }
}
```

通过上面代码不难看出， `propertyEditorRegistrars` 和 `customEditors` 属性的值会被注册，我们利用这点才来实现自定义 Property Editor 的绑定。

:::details 测试案例1： Person 含有 CreditCard 属性（通过 person.properties 注入）

```java
public class Person {

    @Value("${person.creditCard}")
    private CreditCard creditCard;
}

public class CreditCard {
    private String rawCardNumber;
    private Integer bankIdNo;
    private Integer accountNo;
    private Integer checkCode;
}

public class CreditCardEditor extends PropertyEditorSupport {
    /**
     * 用于将字符串转换为一个对象
     */
    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        if (!StringUtils.hasText(text)) {
            // 设置对象的实际值
            setValue(null);
        } else {
            CreditCard creditCard = new CreditCard();
            creditCard.setRawCardNumber(text);

            String cardNo = text.replaceAll("-", "");
            if (cardNo.length() != 16)
                throw new IllegalArgumentException(
                        "Credit card format should be xxxx-xxxx-xxxx-xxxx");

            // 前6为是银行标识
            creditCard.setBankIdNo(Integer.valueOf(cardNo.substring(0, 6)));
            // 7-15位是账户
            creditCard.setAccountNo(Integer.valueOf(cardNo.substring(6, 15)));
            // 最后一位是校验码
            creditCard.setCheckCode(Integer.valueOf(cardNo.substring(15)));
            // 设置对象的实际值
            setValue(creditCard);
        }
    }
}
```

person.properties 提供 `person.creditCard` 的值（注意：这里也是字符串）

```ini

person.creditCard=1234-1234-1111-0011
```

:::

:::details 测试案例2： User 含有 Phone 属性（通过 user.xml 注入）

```java
public class User {
    private Phone phone;
}

public class Phone {
    private String phone;
}

// 自定义 Phone 的 PropertyEditor
public class CustomPhonePropertyEditor extends PropertyEditorSupport {

    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        Phone phone = new Phone();
        phone.setPhone("+86-" + text);
        setValue(phone);
    }
}

// 登记 PropertyEditor
public class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar {
    @Override
    public void registerCustomEditors(PropertyEditorRegistry registry) {
        // register CustomUserPropertyEditor
        registry.registerCustomEditor(Phone.class, new CustomPhonePropertyEditor());

        // register other Property Editor, if you have ...
    }
}
```

user.xml 创建名为 user 的 bean（注意：这里 `<property>` 使用 `value` 是字符串）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="user" class="com.jojojotarou.springframeworkpropertyeditorcustom.domain.User">
        <property name="phone" value="123456"/>
    </bean>
</beans>
```

:::

基于 Java Configuration 配置：

```java
@Configuration
@PropertySource("classpath:person.properties")
@ImportResource("classpath:user.xml")
public class AppConfig {

    @Bean
    public CustomEditorConfigurer configurer() {

        CustomEditorConfigurer configurer = new CustomEditorConfigurer();

        // 通过 customEditors 属性注册绑定
        configurer.setCustomEditors(new HashMap<Class<?>, Class<? extends PropertyEditor>>() {{
            put(CreditCard.class, CreditCardEditor.class);
        }});

        // 通过 propertyEditorRegistrars 属性注册绑定
        configurer.setPropertyEditorRegistrars(new PropertyEditorRegistrar[]{new CustomPropertyEditorRegistrar()});

        return configurer;
    }

    @Bean
    public Person person() {
        return new Person();
    }

}
```

测试：

```java
public class Test {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        Person person = (Person) context.getBean("person");

        System.out.println(person);

        User user = (User) context.getBean("user");
        System.out.println(user);

    }
}
```

输出结果：

```text
Person{creditCard=CreditCard{rawCardNumber='1234-1234-1111-0011', bankIdNo=123412, accountNo=341111001, checkCode=1}}
User{phone=Phone{phone='+86-123456'}}
```

从输出结果不难看出 `CreditCardEditor` 与 `CreditCard` ， `CustomPhonePropertyEditor` 与 `Phone` 都成功的绑定，达到预期。

::: info 源码
spring-framework-property-editor-custom
:::

## 相关链接

- <https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-beans-conversion>
- <https://www.baeldung.com/spring-mvc-custom-property-editor>
