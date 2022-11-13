# Spring Cache

<https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache>

简化缓存开发

## @EnableCache

启用 Spring 的缓存管理功能

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(CachingConfigurationSelector.class)
public @interface EnableCaching {

    // 是否使用 CGLIB 代理，默认是 false（所有代理将使用 CGLIB 例如：@Transactional，相当于 @EnableAspectJAutoProxy(proxyTargetClass = true)）
    // 当使用 AdviceMode.ASPECTJ 时该参数无效
    boolean proxyTargetClass() default false;

    // 使用 ASPECTJ 还是 JDK 动态代理，默认使用 JDK 动态
    // 当使用 AdviceMode.ASPECTJ 时 spring-aspects 模块 JAR 必须存在于类路径中
    AdviceMode mode() default AdviceMode.PROXY;

    // 连接点有多个 advices 时，指定 缓存切面的执行顺序
    int order() default Ordered.LOWEST_PRECEDENCE;
}
```

[spring-aspects maven](https://mvnrepository.com/artifact/org.springframework/spring-aspects/5.3.1)

### CachingConfigurationSelector

`CachingConfigurationSelector` 是一个 `ImportSelector` ：

![CachingConfigurationSelector 继承图](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202209262015240.png)

**作用就是根据 `@EnableCaching` 的 `mode` 参数的值返回需要自动配置的类的完全限定名。**

::: tip

`ImportSelector` 相当于导入另一个配置类。

:::

::: details 源码分析

```java
public abstract class AdviceModeImportSelector<A extends Annotation> implements ImportSelector {
    public static final String DEFAULT_ADVICE_MODE_ATTRIBUTE_NAME = "mode";

    protected String getAdviceModeAttributeName() {
        return DEFAULT_ADVICE_MODE_ATTRIBUTE_NAME;
    }

    @Override
    public final String[] selectImports(AnnotationMetadata importingClassMetadata) {
        Class<?> annType = GenericTypeResolver.resolveTypeArgument(getClass(), AdviceModeImportSelector.class);
        Assert.state(annType != null, "Unresolvable type argument for AdviceModeImportSelector");

        // 获取 @EnableCaching 注解的定义参数以及想要的值信息
        AnnotationAttributes attributes = AnnotationConfigUtils.attributesFor(importingClassMetadata, annType);
        if (attributes == null) {
            throw new IllegalArgumentException(String.format(
                    "@%s is not present on importing class '%s' as expected",
                    annType.getSimpleName(), importingClassMetadata.getClassName()));
        }

        // 获取 @EnableCaching mode 属性的值
        AdviceMode adviceMode = attributes.getEnum(getAdviceModeAttributeName());
        String[] imports = selectImports(adviceMode); // 调用实现的 selectImports 方法
        if (imports == null) {
            throw new IllegalArgumentException("Unknown AdviceMode: " + adviceMode);
        }
        return imports;
    }
    // 由 CachingConfigurationSelector 实现
    @Nullable
    protected abstract String[] selectImports(AdviceMode adviceMode);
}

public class CachingConfigurationSelector extends AdviceModeImportSelector<EnableCaching> {
    // 实现 AdviceModeImportSelector#selectImports(AdviceMode adviceMode)方法
    @Override
    public String[] selectImports(AdviceMode adviceMode) {
        switch (adviceMode) {
            case PROXY:
                return getProxyImports();
            case ASPECTJ:
                return getAspectJImports();
            default:
                return null;
        }
    }

    // 使用 JDK 动态代理时需要注册的类
    private String[] getProxyImports() {
        List<String> result = new ArrayList<>(3);
        result.add(AutoProxyRegistrar.class.getName());
        result.add(ProxyCachingConfiguration.class.getName());
        if (jsr107Present && jcacheImplPresent) {
            result.add(PROXY_JCACHE_CONFIGURATION_CLASS);
        }
        return StringUtils.toStringArray(result);
    }

    // 使用 AspectJ 动态代理时需要注册的类
    private String[] getAspectJImports() {
        List<String> result = new ArrayList<>(2);
        result.add(CACHE_ASPECT_CONFIGURATION_CLASS_NAME);
        if (jsr107Present && jcacheImplPresent) {
            result.add(JCACHE_ASPECT_CONFIGURATION_CLASS_NAME);
        }
        return StringUtils.toStringArray(result);
    }
}
```

:::
默认 mode 是 AdviceMode.PROXY，那么会导入 `AutoProxyRegistrar` 和 `ProxyCachingConfiguration`：

![ProxyCachingConfiguration 继承图](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202209262057873.png)

## @Cacheable

**`@Cacheable` 将数据存储到 Redis 中**，Key 的样式是：`cacheName/value::key`。

- `cacheName/value` ：相当于前缀或者说某个域，某个产品。必须手动指定， `@Cacheable(cacheNames = "testInfo")` 和 `@Cacheable("testInfo")` 是一个意思。
- `key` ：相当于唯一值。可以不指定默认使用 `SimpleKeyGenerator` 生成 key，也可以通过 `@Cacheable` 的 `key` 参数指定，甚至你也可以自定义 `KeyGenerator` 。

### SimpleKeyGenerator

默认使用 `org.springframework.cache.interceptor.SimpleKeyGenerator` 生成 Key：

```java
public class SimpleKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        return generateKey(params);
    }

    /**
     * Generate a key based on the specified parameters.
     */
    public static Object generateKey(Object... params) {
        if (params.length == 0) {
            return SimpleKey.EMPTY;
        }
        if (params.length == 1) {
            Object param = params[0];
            if (param != null && !param.getClass().isArray()) {
                return param;
            }
        }
        return new SimpleKey(params);
    }

}
```

- 当被 @Cacheable 注释的方法没有参数只有一个时，返回 `SimpleKey.EMPTY`.

    ```java
    // 存入 redis 的 key 是：`testInfo::SimpleKey []`
    @Cacheable(cacheNames = "testInfo")
    public List<Test> getAll() {
    }
    ```

- 当被 @Cacheable 注释的方法注释的参数只有一个时，返回参数的值

    ```java
    // 存入 redis 的 key 是：`tOne::1`
    @Cacheable("tOne")
    public Test getOne(@PathVariable("id") Long id) {
    }
    ```

- 当被 @Cacheable 注释的方法注释的参数只有多个时，返回 `new SimpleKey(params)` 对象

    ```java
    // 存入 redis 的 key 是：`tOne::SimpleKey [1,小绿]`
    @Cacheable("tOne")
    public Test getOneByIdAndName(@PathVariable("id") Long id, @PathVariable("name") String name) {
    }
    ```

### 指定 Key

[官方文档中列出 @Cacheable#key 支持的表达式](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache-spel-context)

- `key = "#root.methodName"` 等效于 `key = "#root.method.name"` → `tOne1::getOne1`

    ```java
    @Cacheable(cacheNames = "tOne1", key = "#root.methodName")
    public Test getOne1(@PathVariable("id") Long id) {
    }
    ```

- `key = "#root.targetClass"` → `tOne1::class com.jojojo.springcachedemo.controller.TestController`

    ```java
    @Cacheable(cacheNames = "tOne1", key = "#root.targetClass")
    public Test getOne1(@PathVariable("id") Long id) {
    }
    ```

- `key = "#root.target"` → `tOne1::$TestController`

    ```java
    @Cacheable(cacheNames = "tOne1", key = "#root.target")
    public Test getOne1(@PathVariable("id") Long id) {
    }

    @Override
    public String toString() {
        return "$TestController";
    }
    ```

- `key = "#root.args[0]"` 、 `key = "#id"`、 `key = "#a0"`、 `key = "#p0"` → `tOne1::1`

    ```java
    @Cacheable(cacheNames = "tOne1", key = "#p0")
    public Test getOne1(@PathVariable("id") Long id) {
    }
    ```

## 自定义缓存配置

### 保存Json 到 redis

@Cacheable: 标记触发缓存

@CacheEvict: 标记触发删除缓存，即失效模式

@CachePut:标记触发更新缓存，即双写模式

@Caching: 组合操作

@CacheConfig：类级别共享一些常见的缓存相关设置

## Redis 缓存穿透、缓存击穿、缓存雪崩是否解决？

缓存穿透: 大量请求不存在的Key。

```yml
spring.cache.redis.cache-null-values=true
```

缓存击穿: 一个Key失效，大量请求。

```java
// 默认不加锁，通过 sync=true 设置加锁（锁会加在查询 redis 的 get 方法上 ）
@Cacheable(value={"product"}, key="'getProduct'",sync=true)
```

缓存雪崩：大面积Key同时失效，大量请求

```yml
spring.cache.redis.cache-null-values=true
```
