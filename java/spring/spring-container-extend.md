
实现 BeanPostProcessor 接口方法来提供您自己的（或覆盖容器的默认）实例化逻辑、依赖解析逻辑等。(在 Spring 容器完成对 bean 的实例化、配置和初始化之后执行)

配置多个 BeanPostProcessor 实例，并且可以通过设置 order 属性来控制这些 BeanPostProcessor 实例的运行顺序。(仅当 BeanPostProcessor 实现了 Ordered 接口时，您才能设置此属性。)

BeanPostProcessor 实例的范围是定义它的那个容器中

## BeanPostProcessor

## BeanFactoryPostProcessor

## FactoryBean

[使用 FactoryBean 自定义实例化逻辑](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-extension-factorybean)
