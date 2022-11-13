## 属性（properties）

## 映射器（mappers）

### resource

将资源路径下指定文件中映射器接口实现注册为映射器

```xml
<mappers>
    <!-- 找 main/resource 目录下的 mapper/UserMapper.xml -->
    <mapper resource="mapper/UserMapper.xml"/>
</mappers>
```

### package

将指定包内的映射器接口实现全部注册为映射器

```xml
<mappers>
    <package name="com.jojojo.mybatis.scmp.mapper"/>
</mappers>
```

注意：

1. 资源路径（`main/resource`）存放 Mapper xml 文件目录要与源码路径（`main/java`）存放 Mapper 接口所在目录完全一致。
2. Mapper xml 文件名要与 Mapper 接口文件名一致。

```text
├─src
│  ├─main
│  │  ├─java
│  │  │  └─com
│  │  │      └─jojojo
│  │  │          └─mybatis
│  │  │              └─scmp
│  │  │                  ├─domain
│  │  │                  │      User.java
│  │  │                  │
│  │  │                  └─mapper
│  │  │                          UserMapper.java <-- 注意路径&文件名
│  │  │
│  │  └─resources
│  │      │  jdbc.properties
│  │      │  mybatis-config.xml
│  │      │
│  │      ├─com
│  │      │  └─jojojo
│  │      │      └─mybatis
│  │      │          └─scmp
│  │      │              └─mapper
│  │      │                      UserMapper.xml <-- 注意路径&文件名
```

::: tip IDEA 中 resource 目录中新建目录不是用 `.` 而是 `\` (Windows)
![IDEA resource 目录中新建目录(Windows)](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207231539581.png)
:::

## plugin

### 分页插件 PageHelper

项目地址：<https://github.com/pagehelper/Mybatis-PageHelper>
快速开始：<https://github.com/pagehelper/Mybatis-PageHelper/blob/master/wikis/zh/HowToUse.md>
