
## 事物的传播

![事物的传播](https://pic2.zhimg.com/v2-5c1ee6b0b3223fdd51fc0215e15ded6b_r.jpg?source=1940ef5c)

- 场景1：2个方法都是 `Propagation.REQUIRED`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
```

结果：使用同一个事物，2次操作都被回滚，没有插入数据库。

:::tip
若尝试 `try/catch testService.test2();`，则会抛出 `org.springframework.transaction.UnexpectedRollbackException: Transaction rolled back because it has been marked as rollback-only` 只有一个方法抛出异常，事物将被标记回滚。
:::

- 场景2：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.REQUIRED_NEW`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test2
```

结果：使用不同事物，因`test2` 抛出异常， `test1` 会继续抛出异常，2次操作都被回滚，没有插入数据库。

如何解决？

```java
@Transactional(propagation = Propagation.REQUIRED)
public void test1() {
    jdbcTemplate.execute("insert into t values (4,'ddd')");
    System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
    try {
        testService.test2();
    } catch (Exception e) {
        System.out.println(e.getMessage());
    }
}
```

能不能在 test2 中捕获异常？
显然是不能的，由于捕获异常，代理方法中捕获不到异常，不会触发回滚，test2 也会插入成功。

- 场景3：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.NOT_SUPPORTED`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test2
```

结果：使用不同事物，因 `test2` 是非事物执行（感觉就是自动提交）会插入成功，然后抛出异常， `test1` 会继续抛出异常，test1 操作被回滚，没有插入数据库。

:::tip
若尝试 `try/catch testService.test2();`，那么 test1 和 test2 都会成功提交数据。
:::

- 场景4：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.SUPPORTED`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}

// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
```

结果：使用相同事物，同场景1，都会回滚。

:::tip
若尝试 `try/catch testService.test2();`，同场景1触发异常。
:::

- 场景5：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.NEVER`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.NEVER)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// Exception in thread "main" org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'
```

结果：test1 回滚，test2 不会执行，直接触发 `org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'` 异常。

- 场景6：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.MANDATORY`，由于 MANDATORY 的在没有事物是抛出异常，有事物使用当前事物的机制，故和场景1一致，都会回滚。

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();

    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
```

:::tip
若尝试 `try/catch testService.test2();`，同场景1触发异常。
:::

- 场景7：1个方法都是 `Propagation.REQUIRED` ，另一个方法  `Propagation.NESTED`

```java
@Service
public class TestService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TestService testService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void test1() {
        jdbcTemplate.execute("insert into t values (4,'ddd')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        testService.test2();
    }

    @Transactional(propagation = Propagation.NESTED)
    public void test2() {
        jdbcTemplate.execute("insert into t values (5,'eee')");
        System.out.println("当前事物名称：" + TransactionSynchronizationManager.getCurrentTransactionName());
        int a = 2 / 0;
    }
}

// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
// 当前事物名称：com.jojojo.sb.sbt.service.TestService.test1
```

结果：使用相同事物，test1 和 test2 都会被回滚，因为 test2 抛出的异常影响 test1 会继续抛出。

:::tip
若尝试 `try/catch testService.test2();`，test2 会回滚，因为捕获了异常，save point 生效 test1 成功插入树。
:::
