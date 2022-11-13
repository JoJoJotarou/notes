# SpringBoot 完整启动流程

下面时spring boot 项目的主程序：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

`SpringApplication.run(Application.class);` 是告诉 Spring 我们得的程序所在的包。这样Spring 就知道从哪里扫描、加载配置类/配置文件，从而完成 bean 的创建和注入。

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
  @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
}
```

## 解析 `SpringApplication.run()`

下面是 `SpringApplication.run()` 方法的源代码（ `primarySource` 即 `Application.class`）：

```java
public static ConfigurableApplicationContext run(Class<?> primarySource, String... args) {
    // 将启动配置类转成 Class 数组，调用 run 的重写方法 ⬇️⬇️⬇️
    return run(new Class<?>[] { primarySource }, args);
}
```

下面是 `run` 重写方法的源代码：

```java
public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
    // 创建 SpringApplication 实例
    return new SpringApplication(primarySources).run(args);
}
```

`new SpringApplication(primarySources)` 会创建 `SpringApplication` 的实例对象：

```java
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
    this.resourceLoader = resourceLoader;
    Assert.notNull(primarySources, "PrimarySources must not be null");
    // 将启动配置类存入 this.primarySources
    this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
    // 1. 推断项目类型：普通项目、Web MVC 项目还是 web Flux 项目
    this.webApplicationType = WebApplicationType.deduceFromClasspath();
    // 2. 从 `/META-INF/spring.factories` 文件获得 BootstrapRegistryInitializer 的实现类的完全限定名，并创建实例对象
    // 后面用于向 BootstrapRegistry（引导注册器）中添加对象
    this.bootstrapRegistryInitializers = new ArrayList<>(
            getSpringFactoriesInstances(BootstrapRegistryInitializer.class));
    // 3. 从 `/META-INF/spring.factories` 文件获得 ApplicationContextInitializer 的实现类的完全限定名，并创建实例对象
    // 后面用于在刷新（加载自定义bean等一系列操作）之前执行
    setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
    // 3. 加载应用监听器 ApplicationListener.class 实现类（spring factory 机制）
    setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
    // 4. 从堆栈中获取执行 main 方法的类的类型
    this.mainApplicationClass = deduceMainApplicationClass();
}
```

::: tip Spring Factory 机制
Spring 会从读取 `/META-INF/spring.factories` 文件，并自动创建需要的 bean，实现自动配置。

```text
# Initializers
org.springframework.context.ApplicationContextInitializer=\
org.springframework.boot.autoconfigure.SharedMetadataReaderFactoryContextInitializer,\
org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener

# Application Listeners
org.springframework.context.ApplicationListener=\
org.springframework.boot.autoconfigure.BackgroundPreinitializer
```

:::

:::details 1. 推断项目类型：`WebApplicationType.deduceFromClasspath()`

```java
public enum WebApplicationType {
    NONE,
    SERVLET,
    REACTIVE;

    private static final String[] SERVLET_INDICATOR_CLASSES = { "javax.servlet.Servlet",
            "org.springframework.web.context.ConfigurableWebApplicationContext" };
    private static final String WEBMVC_INDICATOR_CLASS = "org.springframework.web.servlet.DispatcherServlet";
    private static final String WEBFLUX_INDICATOR_CLASS = "org.springframework.web.reactive.DispatcherHandler";
    private static final String JERSEY_INDICATOR_CLASS = "org.glassfish.jersey.servlet.ServletContainer";

    static WebApplicationType deduceFromClasspath() {
        // classpath 存在 org.springframework.web.reactive.DispatcherHandler 且不存在
        // org.springframework.web.servlet.DispatcherServlet 和 org.glassfish.jersey.servlet.ServletContainer
        // 则项目为 web flux 项目
        if (ClassUtils.isPresent(WEBFLUX_INDICATOR_CLASS, null) && !ClassUtils.isPresent(WEBMVC_INDICATOR_CLASS, null)
                && !ClassUtils.isPresent(JERSEY_INDICATOR_CLASS, null)) {
            return WebApplicationType.REACTIVE;
        }
        // 如 classpath 不存在 javax.servlet.Servlet （Servlet API） 或者
        // org.springframework.web.context.ConfigurableWebApplicationContext
        // 则时个普通项目
        for (String className : SERVLET_INDICATOR_CLASSES) {
            if (!ClassUtils.isPresent(className, null)) {
                return WebApplicationType.NONE;
            }
        }
        return WebApplicationType.SERVLET;
    }
}
```

`ConfigurableWebApplicationContext` 是所有 Web 容器父类，故判断 Web MVC 项目的 `SERVLET_INDICATOR_CLASSES` 指标使用该类：

![ConfigurableWebApplicationContext 子类](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207282200955.png)
:::

::: details 2 和 3. 加载 `BootstrapRegistryInitializer.class` 和 `ApplicationContextInitializer.class` 实现类并创建实例对象

```java
private <T> Collection<T> getSpringFactoriesInstances(Class<T> type, Class<?>[] parameterTypes, Object... args) {
    ClassLoader classLoader = getClassLoader();
    // 从 spring.factories 文件中获取键为 org.springframework.context.ApplicationContextInitializer 的值
    Set<String> names = new LinkedHashSet<>(SpringFactoriesLoader.loadFactoryNames(type, classLoader));
    // 通过反射实例化 spring.factories 中列出的类
    List<T> instances = createSpringFactoriesInstances(type, parameterTypes, classLoader, args, names);
    AnnotationAwareOrderComparator.sort(instances);
    return instances;
}
```

:::

::: details 4. 从堆栈中获取执行 main 方法的类的类型

```java
private Class<?> deduceMainApplicationClass() {
    try {
        StackTraceElement[] stackTrace = new RuntimeException().getStackTrace();
        for (StackTraceElement stackTraceElement : stackTrace) {
            if ("main".equals(stackTraceElement.getMethodName())) {
                return Class.forName(stackTraceElement.getClassName());
            }
        }
    }
    catch (ClassNotFoundException ex) {
        // Swallow and continue
    }
    return null;
}
```

:::

## 解析 `new SpringApplication(primarySources).run(args);` 的 `run(args)`

```java
public ConfigurableApplicationContext run(String... args) {
    long startTime = System.nanoTime();
    // 1. 创建 默认引导注册表
    DefaultBootstrapContext bootstrapContext = createBootstrapContext();
    ConfigurableApplicationContext context = null;
    // 2. 设置系统属性：无头模式
    configureHeadlessProperty();
    // 3. 创建监听 spring application run 的监听器
    SpringApplicationRunListeners listeners = getRunListeners(args);
    // 开始准备 spring application
    listeners.starting(bootstrapContext, this.mainApplicationClass);
    try {
        // 4. SpringApplication.run 传入的参数存入 ApplicationArguments，后面给 CommandLineRunner/ApplicationRunner 使用
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
        // 5. 准备环境属性
        ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
        // 6. 设置 spring.beaninfo.ignore 环境变量 默认为true
        configureIgnoreBeanInfo(environment);
        // 7. 查找并输出banner
        // 图片类型的banner 需要指定 spring.banner.image.location 属性
        // 文本类型的banner 默认是banner.txt 或者指定 spring.banner.location 属性
        // 以上类型都没有则使用 DEFAULT_BANNER：SpringBootBanner 也就是Spring Boot文本
        Banner printedBanner = printBanner(environment);
        // 8. 根据之前判断项目类型（this.webApplicationType）实例化容器
        context = createApplicationContext();
        context.setApplicationStartup(this.applicationStartup);
        // 9. 准备容器，设置环境
        prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
        // 10. 刷新 spring容器 注册 自定义 bean 和 自动配置 bean 已经启动tomcat
        refreshContext(context);
        afterRefresh(context, applicationArguments);
        Duration timeTakenToStartup = Duration.ofNanos(System.nanoTime() - startTime);
        if (this.logStartupInfo) {
            new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), timeTakenToStartup);
        }
        listeners.started(context, timeTakenToStartup);
        // 11. 调用 CommandLineRunner/ApplicationRunner
        callRunners(context, applicationArguments);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, listeners);
        throw new IllegalStateException(ex);
    }
    try {
        Duration timeTakenToReady = Duration.ofNanos(System.nanoTime() - startTime);
        listeners.ready(context, timeTakenToReady);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, null);
        throw new IllegalStateException(ex);
    }
    return context;
}
```

::: details 1. 创建默认引导注册表

```java
private DefaultBootstrapContext createBootstrapContext() {
    // 实例化默认引导注册表对象
    DefaultBootstrapContext bootstrapContext = new DefaultBootstrapContext();
    // 执行 BootstrapRegistryInitializer 实现类的 initialize 方法，完成默认引导注册表的注册
    this.bootstrapRegistryInitializers.forEach((initializer) -> initializer.initialize(bootstrapContext));
    return bootstrapContext;
}
```

:::

::: details 2. 设置 java.awt.headless

Headless模式是系统的一种配置模式。在该模式下，系统缺少了显示设备、键盘或鼠标。

```java
// private static final String SYSTEM_PROPERTY_JAVA_AWT_HEADLESS = "java.awt.headless";

private void configureHeadlessProperty() {
    System.setProperty(SYSTEM_PROPERTY_JAVA_AWT_HEADLESS,
            System.getProperty(SYSTEM_PROPERTY_JAVA_AWT_HEADLESS, Boolean.toString(this.headless)));
}
```

:::

::: details 3. 创建监听 spring application run 的监听器

```java
private SpringApplicationRunListeners getRunListeners(String[] args) {
    Class<?>[] types = new Class<?>[] { SpringApplication.class, String[].class };
    return new SpringApplicationRunListeners(logger,
            // 通过 spring factory 机制获取 SpringApplicationRunListener.class 实现类实例
            getSpringFactoriesInstances(SpringApplicationRunListener.class, types, this, args),
            this.applicationStartup);
}
```

`SpringApplicationRunListener` ： Spring Application 生命周期

```java
public interface SpringApplicationRunListener {

    // 在开始准备 Spring Application 之前执行
    default void starting(ConfigurableBootstrapContext bootstrapContext) {
    }
    //  当 environment 准备好执行（例如 application.properties/yml 的加载），在容器创建之前
    default void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
            ConfigurableEnvironment environment) {
    }

    /**
     * Called once the {@link ApplicationContext} has been created and prepared, but
     * before sources have been loaded.
     * @param context the application context
     */
    //  在容器创建和准备好之后执行，但是实例化bean之前
    default void contextPrepared(ConfigurableApplicationContext context) {
    }

    /**
     * Called once the application context has been loaded but before it has been
     * refreshed.
     * @param context the application context
     */
    //  当应用中基本的bean和beanFactory后处理器加载到容器中之后执行
    default void contextLoaded(ConfigurableApplicationContext context) {
    }

    /**
     * The context has been refreshed and the application has started but
     * {@link CommandLineRunner CommandLineRunners} and {@link ApplicationRunner
     * ApplicationRunners} have not been called.
     * @param context the application context.
     * @param timeTaken the time taken to start the application or {@code null} if unknown
     * @since 2.6.0
     */
    // 容器加载完成后， 调用 CommandLineRunner/ApplicationRunner 执行方法之前执行
    default void started(ConfigurableApplicationContext context, Duration timeTaken) {
        started(context);
    }
    /**
     * Called immediately before the run method finishes, when the application context has
     * been refreshed and all {@link CommandLineRunner CommandLineRunners} and
     * {@link ApplicationRunner ApplicationRunners} have been called.
     * @param context the application context.
     * @param timeTaken the time taken for the application to be ready or {@code null} if
     * unknown
     * @since 2.6.0
     */
    //  当spring application 运行完成时执行
    default void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        running(context);
    }
    // 当 spring application 运行失败时执行
    default void failed(ConfigurableApplicationContext context, Throwable exception) {
    }
}
```

通过 IDEA 全局查找，在 `.m2\repository\org\springframework\boot\spring-boot\2.7.2\spring-boot-2.7.2-sources.jar!\META-INF\spring.factories` 发现，默认实现类为 `EventPublishingRunListener`

```text
# Run Listeners
org.springframework.boot.SpringApplicationRunListener=\
org.springframework.boot.context.event.EventPublishingRunListener
```

:::

::: details 4. 通过 DefaultApplicationArguments 的存储主类（`@SpringBootApplication` 注释的类）传递的参数

```java
public DefaultApplicationArguments(String... args) {
    Assert.notNull(args, "Args must not be null");
    this.source = new Source(args);
    this.args = args;
}
```

:::
::: details 6.  设置 `spring.beaninfo.ignore` 环境变量，默认为 `true`，即跳过对 `BeanInfo` 类的搜索

```java
private void configureIgnoreBeanInfo(ConfigurableEnvironment environment) {
    if (System.getProperty(CachedIntrospectionResults.IGNORE_BEANINFO_PROPERTY_NAME) == null) {
        Boolean ignore = environment.getProperty(CachedIntrospectionResults.IGNORE_BEANINFO_PROPERTY_NAME,
                Boolean.class, Boolean.TRUE);
        System.setProperty(CachedIntrospectionResults.IGNORE_BEANINFO_PROPERTY_NAME, ignore.toString());
    }
}
```

:::

::: details 8. 根据项目类型（this.webApplicationType）实例化容器

```java
protected ConfigurableApplicationContext createApplicationContext() {
    return this.applicationContextFactory.create(this.webApplicationType);
}
```

:::

::: details 9. 准备容器

```java
private void prepareContext(DefaultBootstrapContext bootstrapContext, ConfigurableApplicationContext context,
        ConfigurableEnvironment environment, SpringApplicationRunListeners listeners,
        ApplicationArguments applicationArguments, Banner printedBanner) {
    context.setEnvironment(environment);
    postProcessApplicationContext(context);
    // 执行 ApplicationContextInitializer 实现类的 initialize 方法
    applyInitializers(context);
    // 容器准备工作完成
    listeners.contextPrepared(context);
    bootstrapContext.close(context);
    // 默认 true
    if (this.logStartupInfo) {
        logStartupInfo(context.getParent() == null);
        // 打印 spring.profiles.active 信息
        logStartupProfileInfo(context);
    }
    // Add boot specific singleton beans
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    // applicationArguments（就是 SpringApplication.run 传入的参数对象）注册为bean
    beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
    if (printedBanner != null) {
        // 将 banner 对象注册为bean
        beanFactory.registerSingleton("springBootBanner", printedBanner);
    }
    if (beanFactory instanceof AbstractAutowireCapableBeanFactory) {
        // 设置是否允许bean的循环依赖，默认 false 不允许
        ((AbstractAutowireCapableBeanFactory) beanFactory).setAllowCircularReferences(this.allowCircularReferences);
        if (beanFactory instanceof DefaultListableBeanFactory) {
            // 设置是否允许通过注册具有相同名称的不同定义来覆盖 bean 定义，自动替换前者。默认 false 不允许
            ((DefaultListableBeanFactory) beanFactory)
                    .setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
        }
    }
    // 开启全局bean延迟初始化 spring.main.lazy-initialization=true
    if (this.lazyInitialization) {
        context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor());
    }
    // todo...
    context.addBeanFactoryPostProcessor(new PropertySourceOrderingBeanFactoryPostProcessor(context));
    // Load the sources
    Set<Object> sources = getAllSources();
    Assert.notEmpty(sources, "Sources must not be empty");
    load(context, sources.toArray(new Object[0]));
    listeners.contextLoaded(context);
}
```

:::

::: details 10. 刷新容器

```java
private void refreshContext(ConfigurableApplicationContext context) {
    if (this.registerShutdownHook) {
        shutdownHook.registerApplicationContext(context);
    }
    // spring framework 初始化bean
    refresh(context);
}
```

```java
public abstract class AbstractApplicationContext extends DefaultResourceLoader
        implements ConfigurableApplicationContext {
    @Override
    public void refresh() throws BeansException, IllegalStateException {
        synchronized (this.startupShutdownMonitor) {
            onRefresh(); // <-- 创建 Tomcat 容器
        }
    }
}
```

```java
public class ServletWebServerApplicationContext extends GenericWebApplicationContext implements ConfigurableWebServerApplicationContext {
    public final void refresh() throws BeansException, IllegalStateException {
        try {
            super.refresh();
        } catch (RuntimeException var3) {
            WebServer webServer = this.webServer;
            if (webServer != null) {
                webServer.stop();
            }

            throw var3;
        }
    }
    protected void onRefresh() {
        super.onRefresh();

        try {
            // 这里创建的 tomcat 容器实例，并未开始监听请求，等到spring容器完全准备好，则通过
            // AbstractApplicationContext#finishRefresh -> getLifecycleProcessor().onRefresh(); (默认是 DefaultLifecycleProcessor) -> DefaultLifecycleProcessor#onRefresh -> DefaultLifecycleProcessor#startBeans -> DefaultLifecycleProcessor#LifecycleGroup#start -> DefaultLifecycleProcessor#doStart -> Lifecycle#start -> WebServerStartStopLifecycle#start -> WebServer#start 这一过程启动监听
            this.createWebServer(); // <-- 创建 Tomcat 容器
        } catch (Throwable var2) {
            throw new ApplicationContextException("Unable to start web server", var2);
        }
    }

    private void createWebServer() {
        WebServer webServer = this.webServer;
        ServletContext servletContext = this.getServletContext();
        if (webServer == null && servletContext == null) {
            StartupStep createWebServer = this.getApplicationStartup().start("spring.boot.webserver.create");
            // 获取当前获取使用那种web容器（tomcat/jetty/undertow）
            ServletWebServerFactory factory = this.getWebServerFactory();
            createWebServer.tag("factory", factory.getClass().toString());
            this.webServer = factory.getWebServer(new ServletContextInitializer[]{this.getSelfInitializer()});
            createWebServer.end();
            this.getBeanFactory().registerSingleton("webServerGracefulShutdown", new WebServerGracefulShutdownLifecycle(this.webServer));
            this.getBeanFactory().registerSingleton("webServerStartStop", new WebServerStartStopLifecycle(this, this.webServer));
        } else if (servletContext != null) {
            try {
                this.getSelfInitializer().onStartup(servletContext);
            } catch (ServletException var5) {
                throw new ApplicationContextException("Cannot initialize servlet context", var5);
            }
        }

        this.initPropertySources();
    }

    // 仅能出现一种web容器，多个抛出异常
    protected ServletWebServerFactory getWebServerFactory() {
        String[] beanNames = this.getBeanFactory().getBeanNamesForType(ServletWebServerFactory.class);
        if (beanNames.length == 0) {
            throw new MissingWebServerFactoryBeanException(this.getClass(), ServletWebServerFactory.class, WebApplicationType.SERVLET);
        } else if (beanNames.length > 1) {
            throw new ApplicationContextException("Unable to start ServletWebServerApplicationContext due to multiple ServletWebServerFactory beans : " + StringUtils.arrayToCommaDelimitedString(beanNames));
        } else {
            return (ServletWebServerFactory)this.getBeanFactory().getBean(beanNames[0], ServletWebServerFactory.class);
        }
    }
}
```

:::
