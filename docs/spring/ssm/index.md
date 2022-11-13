
## 整合 Mybatis

### 映射 Mapper SQL

方式一：自动映射，MyBatis 会在 `resource` 目录下找与射器类相同路径的映射器 XML 文件

第一种是设置 `sqlSessionFactory` bean 的 `configLocation` 属性，并手动在 MyBatis 的 XML 配置文件中的 <mappers> 部分中指定 XML 文件的类路径；

第二种是设置 `sqlSessionFactory` bean 的 `mapperLocations` 属性。

```xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <property name="mapperLocations" value="classpath:mapper/*.xml"/>
</bean>
```

方式4：@Mapper 注解 Mapper 接口
