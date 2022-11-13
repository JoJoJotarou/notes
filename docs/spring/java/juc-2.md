
#### ReentrantLock#lock 原理

这是 `ReentrantLock#lock` 获取锁基本方法：

```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
```

让我们以此来探究下 `ReentrantLock#lock` 实现原理（**主要讲独占非公平锁**）：

来认识下 `ReentrantLock` 类：

```java
public class ReentrantLock implements Lock, java.io.Serializable {

    private final Sync sync; // AQS 的子类

    private transient volatile Node head; // 等待队列的头节点
    private transient volatile Node tail; // 等待队列的尾节点
    private volatile int state; // 🚨 当前锁的状态，独占锁中0表示空闲，1表示获取。共享锁中表示占有锁的线程锁

    // 构造函数，默认创建非公平锁
    public ReentrantLock() {
        sync = new NonfairSync();
    }

    // 通过 fail=true 创建公平锁
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }

    abstract static class Sync extends AbstractQueuedSynchronizer {
        // 省略
    }

    static final class NonfairSync extends Sync {
        // 省略
    }

    // 获取锁的方法
    public void lock() {
        sync.lock();
    }
}
```

- Node 实现的是一个 FIFO 的队列
- `sync` 实际类型是 `Sync`，`Sync` 继承 AQS 。
- `NonfairSync` 是 `Sync` 的子类，那么 `NonfairSync` 也是 AQS 类型。

要知道 `sync` 变量是什么，那个就要看下 ReentrantLock 的源代码，显而易见：

```java

```

下面就开始进入主题：

- 阶段1：`sync.lock();` -> `Sync#lock()` -> `NonfairSync#initialTryLock`

```java
// Sync 类
abstract void lock(); // 这里预留的模板方法，子类（NonfairSync和FairSync）根据不业务实现

// NonfairSync 类的具体实现
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```

- 阶段2：`AbstractQueuedSynchronizer#compareAndSetState`

未获取到锁后，第一次 `tryAcquire` 即 `!tryAcquire(arg)`

```java
// AQ
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}

// NonfairSync 重写 tryAcquire
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState(); // 获取当前锁的状态
    if (c == 0) { // 没有其他线程占用，尝试获取锁
        if (compareAndSetState(0, acquires)) { // 🚨 如果返回true，表示获取到锁，那么 if 里的操作，就是直接线程安全了（其他需要改锁的线程都不执行）
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) { // ❓目前我感觉给共享锁的
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

进度等待队列：

```java

acquireQueued(addWaiter(Node.EXCLUSIVE), arg)


private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    // Try the fast path of enq; backup to full enq on failure
    Node pred = tail; // 表示插入到队列的末端
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) { // 若返回true，if 中的操作是线程安全的
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}

    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor(); // 返回当前节点 (addWaiter 添加的) 的前一个节点
                if (p == head && tryAcquire(arg)) { // 🚨是头节点的话表示节点存的线程有资格获取锁，不是的根据 && 就直接结束 if 了去下一个if 判断是否需要挂起
                    setHead(node); //
                    // 🚨 注意这里链表并没有断，node称为新的head
                    // p作为旧的 head 就不需要了，所以这里作者注释了 help GC
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                // 判断是否挂起没有资格获取锁的线程（避免一直自旋，导致CPU一直占用）
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```
