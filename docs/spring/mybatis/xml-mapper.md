
[[TOC]]

# Mybatis Mapper XML

```xml
<!-- UserMapper.java -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.jojojo.mybatis.sq.mapper.UserMapper">
    <!-- select insert 等信息 ... -->
</mapper>
```

- 上诉语句表示一个 Mybatis 的一个 Mapper XML 文件基本信息
- `namespace` 表示关联的 UserMapper 接口的完全限定名

## [`<select>`](https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#select-1)

`<select>` 表示查询操作的定义，本节包括如下知识点：

1. 接收查询结果/结果集
   - 使用 Map 接收结果/结果集
   - 使用 Object 接收结果/结果集
2. 给 mapper.xml 中定义的 SQL 传递参数
   - 传递单个参数
   - 传递多个参数
     - 使用 Map 传递参数
     - 使用 Object 传递参数
     - 使用 @Param 注解标记参数

### 结果映射（Result Maps）

既然是查询那么必然会有响应的结果集产生， Mybatis 帮助我们将 ResultSet (JDBC) 映射到 Map 或者实体类，省去了 `getter` `setter` 步骤。

#### 结果映射到 Map

```xml
<!-- UserMapper.java -->
Map<String, Object> getOneToMap(int id);

<!-- UserMapper.xml -->
<select id="getOneToMap" resultType="java.util.Map">
<!-- 下面这样写也是可行的，使用了 Mybatis 的内置别名 -->
<!-- <select id="getUserToMap" resultType="map"> -->
    select id, name, age
    from t_user
    where id = 1
</select>
```

上述语句通过 `resultType="java.util.Map"` 将查询结果映射到 `Map` 上，表字段名作为 `HashMap` 的 key，表字段值作为 `HashMap` 的值。返回值输出：

```text
{name=noah, id=1, age=18}
```

下面是使用 `Map` 接收**结果集**的用法一：

```xml
<!-- UserMapper.java -->
List<Map<String, Object>> getAllToListMap();

<!-- UserMapper.xml -->
<select id="getAllToListMap" resultType="java.util.Map">
    select id, name, age
    from t_user
</select>
```

返回值输出：

```text
[{name=noah, id=1, age=18}, {name=tom, id=3, age=18}, {name=tom, id=4, age=20}]
```

下面是使用 `Map` 接收**结果集**的用法二：

```xml
<!-- UserMapper.java -->
<!-- @MapKey 的参数值指定用于区分唯一记录的属性的属性名（字段名），通常数据库中使用 id -->
@MapKey("id")
Map<String, Object> getUserToMapWithMapKey();

<!-- UserMapper.xml -->
<select id="getAllToListMap" resultType="java.util.Map">
    select id, name, age
    from t_user
</select>
```

返回值输出：

```text
{1={name=noah, id=1, age=18}, 3={name=tom, id=3, age=18}, 4={name=tom, id=4, age=20}}
```

::: tip
请注意 `Map` 接收结果集方法一和方法二返回值的差异，方法二中 `User.id` 将作为 `Map` 的 key，记录作为 `Map` 的值。
:::

#### 结果映射到实体类

同样使用 `resultType="com.jojojo.mybatis.sq.domain.User"` 将查询结果映射到 `User`

```xml
<select id="getOneToUser" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where id = 1
</select>
```

类型别名是你的好帮手。使用它们，你就可以不用输入类的全限定名了。比如：

```xml
<!-- mybatis-config.xml 中 -->
<typeAlias type="com.jojojo.mybatis.sq.domain.User" alias="User"/>

<!-- SQL 映射 XML 中 -->
<select id="getOneToUser" resultType="User">
  select id, name, age
  from t_user
  where id = 1
</select>
```

在上诉情况下，MyBatis 会在幕后自动创建一个 ResultMap，根据 SQL 中的列名映射到实体类的属性上。如果列名和属性名不能匹配上，可以在 SELECT 语句中设置列别名（这是一个基本的 SQL 特性）来完成匹配。比如：

```xml
<select id="getOneToUser" resultType="User">
  select
    id             as "id",
    user_name      as "name",
    age            as "age"
  from t_user
  where id = 1
</select>
```

### 传参

在上面的文章中，SQL 语句的条件都是写死的，那么如何给 SQL 传参呢？

::: tip
本届内容同样适用 `<insert>` 、`<delete>` 、`<update>`
:::

#### 单个参数

Mybatis 中传递参数需要使用占位符，有 `#{}` 和 `${}` 两种：

- 使用 `#{}` 作为占位符时，Mybatis 会自动为字符串类型参数的值添加单引号。

    ```xml
    <!-- UserMapper.java -->
    User getByName(String name);

    <!-- UserMapper.xml -->
    <select id="getByName" resultType="com.jojojo.mybatis.sq.domain.User">
        select id, name, age
        from t_user
        where name = #{name}
    </select>
    ```

    实际的执行的 SQL：

    ```sql
    select id, name, age from t_user where name = 'xxx'
    ```

    近似的 JDBC 代码：

    ```java
    String sql = "select id, name, age from t_user where name = ?";
    PreparedStatement ps = conn.prepareStatement(sql);
    ps.setString(1,'xxx');
    ```

- 使用 `${}` 作为占位符时，Mybatis 不做任何处理，仅是字符串替换， SQL 中要表示字符串需要手动添加单引号。类似于 JDBC 中的字符串拼接 SQL 是不安全的，不推荐使用，除非自行转义并检验这些参数。

    ```xml
    <!-- UserMapper.java -->
    User getByName$(String name);

    <!-- UserMapper.xml -->
    <select id="getByName$" resultType="com.jojojo.mybatis.sq.domain.User">
        select id, name, age
        from t_user
        where name = '${name}'
    </select>
    ```

#### 多个参数

`UserMapper.java`：

```java
User getByNameAndAge(String name, int age);
User getByNameAndAge2(String name, int age);
User getByNameAndAgeWithMap(Map<String, Object> user);
User getByNameAndAgeWithUser(User user);
User getByNameAndAgeWithParam(@Param("nameParam") String name, @Param("ageParam") int age);
```

`UserMapper.xml`：

```xml
<!-- 多参数1：
    - 默认情况，多参数时，mybatis 会把参数存入 map 中，
    - 可以使用 arg0、arg1 ... 或者 param1、param2 ... 作为占位符
    - 占位符顺序与接口方法参数顺序保持一致
-->
<select id="getByNameAndAge" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where name = #{arg0}
        and age = #{arg1}
</select>
<select id="getByNameAndAge2" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where name = #{param1}
        and age = #{param2}
</select>
<!-- 多参数2，使用map作为参数是，通过map的key作为占位符名称 -->
<select id="getByNameAndAgeWithMap" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where name = #{nameMap}
        and age = #{ageMap}
</select>
<!-- 多参数3，使用实体类作为参数，通过实体类属性名作为占位符名称 -->
<select id="getByNameAndAgeWithUser" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where name = #{name}
        and age = #{age}
</select>
<!-- 多参数4，使用 @param 注释参数，将 @param 的值作为占位符名称 -->
<select id="getByNameAndAgeWithParam" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age
    from t_user
    where name = #{nameParam}
        and age = #{ageParam}
</select>
```

### 模糊查询

`UserMapper.java`：

```java
User getByLike(@Param("name") String name);
```

`UserMapper.xml`：

```xml
<!-- 三种方法皆可 -->
<select id="getByLike" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age from t_user where name like '%${name}%'
</select>

<select id="getByLike" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age from t_user where name like concat('%', #{name}, '%')
</select>

<select id="getByLike" resultType="com.jojojo.mybatis.sq.domain.User">
    select id, name, age from t_user where name like "%"#{name}"%"
</select>
```

### 列名和属性名不能匹配

如果列名和属性名不能匹配上，可以在 SELECT 语句中设置列别名（这是一个基本的 SQL 特性）来完成匹配。比如：

```xml
<select id="selectUsers" resultType="User">
  select
    user_id             as "id",
    user_name           as "userName",
    hashed_password     as "hashedPassword"
  from some_table
  where id = #{id}
</select>
```

在学习了上面的知识后，你会发现上面的例子没有一个需要显式配置 ResultMap，这就是 ResultMap 的优秀之处——你完全可以不用显式地配置它们。 虽然上面的例子不用显式配置 ResultMap。 但为了讲解，我们来看看如果在刚刚的示例中，显式使用外部的 resultMap 会怎样，这也是解决列名不匹配的另外一种方式。

```xml
<resultMap id="userResultMap" type="User">
  <id property="id" column="user_id" />
  <result property="username" column="user_name"/>
  <result property="password" column="hashed_password"/>
</resultMap>
```

然后在引用它的语句中设置 resultMap 属性就行了（注意我们去掉了 resultType 属性）。比如:

```xml
<select id="selectUsers" resultMap="userResultMap">
  select user_id, user_name, hashed_password
  from some_table
  where id = #{id}
</select>
```

#### mapUnderscoreToCamelCase

`mapUnderscoreToCamelCase` 全局设置是否开启驼峰命名自动映射，即从经典数据库列名 A_COLUMN 映射到经典 Java 属性名 aColumn。

```xml
<!-- Mybatis XML configuration 文件 -->
<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
</configuration>
```

## 高级结果映射(联级)

### 多对一

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.jojojo.mybatis.sqa.mapper.EmployeeMapper">

    <select id="getById1" resultMap="_getById1">
        select e.id as eid, e.name as ename, c.id as cid, c.name as cname
        from t_employee e
                 left join t_company c on e.id = c.id
        where e.id = #{id}
    </select>

    <!-- 连接查询方式一： 级联属性赋值 -->
    <resultMap id="_getById1" type="com.jojojo.mybatis.sqa.domain.Employee">
        <id property="id" column="eid"/>
        <result property="name" column="ename"/>
        <result property="company.id" column="cid"/>
        <result property="company.name" column="cname"/>
    </resultMap>

    <select id="getById2" resultMap="_getById2">
        select e.id as eid, e.name as ename, c.id as cid, c.name as cname
        from t_employee e
                 left join t_company c on e.id = c.id
        where e.id = #{id}
    </select>

    <!-- 连接查询方式二：association 关联查询 -->
    <resultMap id="_getById2" type="com.jojojo.mybatis.sqa.domain.Employee">
        <id property="id" column="eid"/>
        <result property="name" column="ename"/>
        <association property="company" javaType="Company">
            <result property="id" column="cid"/>
            <result property="name" column="cname"/>
        </association>
    </resultMap>

    <select id="getById3" resultMap="_getById3">
        select e.id as eid, e.name as ename
        from t_employee e
        where e.id = #{id}
    </select>

    <!-- 连接查询方式三：association 分布查询 -->
    <resultMap id="_getById3" type="com.jojojo.mybatis.sqa.domain.Employee">
        <id property="id" column="eid"/>
        <result property="name" column="ename"/>
        <!-- select：表示第二部执行的方法，需要写完全限定名 -->
        <!-- column: 表示第一步中实体类的哪个属性作为第二部查询的条件  -->
        <association property="company"
                     select="com.jojojo.mybatis.sqa.mapper.CompanyMapper.getByIdForEmployee"
                     column="id"></association>
    </resultMap>
</mapper>
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.jojojo.mybatis.sqa.mapper.CompanyMapper">

    <select id="getByIdForEmployee" resultType="com.jojojo.mybatis.sqa.domain.Company">
        select c.id as cid, c.name as cname
        from t_company c
        where id = #{id}
    </select>
</mapper>
```

#### 级联属性赋值

### association 关联查询

### association 分步查询

### 一对多
