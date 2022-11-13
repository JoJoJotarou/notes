# Collection

![Collection 继承结构](https://ts1.cn.mm.bing.net/th/id/R-C.d947d0e82b6dc2c772864144c4e79a36?rik=iwRbvVJbnu3Bfg&riu=http%3a%2f%2fupload-images.jianshu.io%2fupload_images%2f3985563-e7febf364d8d8235.png%3fimageMogr2%2fauto-orient%2fstrip%7cimageView2%2f2%2fw%2f1240&ehk=JHAvBWBg%2b5rSv8KBhHYk3ehm3WTjaxwuH8tzKZB2sXI%3d&risl=&pid=ImgRaw&r=0)

## List

### ArrayList

> - Resizable-array implementation of the `List` interface.
> - This class is roughly equivalent to
 `Vector` , except that it is unsynchronized.
> - An application can increase the capacity of an `ArrayList` instance before adding a large number of elements using the `ensureCapacity` operation. This may reduce the amount of incremental reallocation.

- List接口的可变大小的数组实现。
- `ArrayList` 是线程不安全。
- 当需要项 `ArrayList` 中添加大量元素时，可以使用 `ensureCapacity` 手动扩容，将减少自动扩容的次数。
- 适合随机访问，插入、删除效率低于 `LinkedList`

#### 创建 ArrayList

```java
// 通常方式
ArrayList<Integer> list1 = new ArrayList<>();

// Arrays.asList方法，返回定长可变数组列表
List<Integer> list2 = Arrays.asList(1, 2, 3, 4);

// 数组 转 数组列表方式
Integer[] intArray = new Integer[]{1, 2, 3};
List<Integer> list3 = Arrays.asList(intArray);

// 匿名内部类方式, 解释： https://blog.csdn.net/q1009020096/article/details/91517936
ArrayList<Integer> list4 = new ArrayList<>() {
    {
        add(1);
        add(2);
    }
};
```

::: tip

- `Arrays.asList(T... a)` 创建的是**定长不可变**数组列表，若尝试改变其大小则抛出 `UnsupportedOperationException` 异常。这是因为 `Arrays.asList(T... a)` 实际返回的是 `java.util.Arrays.ArrayList` 且并未重写父类 `AbstractList` 的 `add(int index, E element)` 方法,

    ```java
    public class Arrays {
        private static class ArrayList<E> extends AbstractList<E>
            implements RandomAccess, java.io.Serializable
        {}
    }

    public abstract class AbstractList<E> extends AbstractCollection<E> implements List<E> {
        public void add(int index, E element) {

                throw new UnsupportedOperationException();
        }
    }
    ```

- 创建不可变列表

    ```java
    Collections.unmodifiableList(new ArrayList<>() {{
                add(1);
            }});

    // jdk >= 9
    List.of(1, 2);
    ```

- 创建线程安全的 ArrayList

    ```java
    List list = Collections.synchronizedList(new ArrayList(...));
    ```

:::

#### 扩容原理

::: tip 变量解释

- `elementData`：Object 数组用于数据存储
- `modCount`：记录改变列表大小操作数
- `size`： `ArrayList` 实际存储元素数量大小
- 旧容量（`oldCapacity`）: `elementData.length`
- 最小容量（`minCapacity`）：`size + 1`
- 最小增长容量（`minGrowth`）：  `minCapacity - oldCapacity`
- 首选增长容量（`prefGrowth`）：`oldCapacity >> 1`
- 最大安全长度（`SOFT_MAX_ARRAY_LENGTH`）：`Integer.MAX_VALUE - 8`
:::

1. **ArrayList 创建**，`new ArrayList<>();` 会创建长度为 0 的数组列表；`new ArrayList<>(initialCapacity);` 会创建一个指定长度的数据列表；

2. **新增数据**，以 `add(e)` 为例：

   - **操作数加1**：首先 `modCount` 加 1
   - **是否需要扩容**：比较 `size` 和 `elementData` 的长度，相等时调用 `grow()` 方法扩容（初始为空的数组列表一定会触发扩容）。
   - **计算扩容大小**：比较最小增长容量（`minGrowth`）和首选增长容量（`prefGrowth`），从中取较大值与 `oldCapacity` 相加，若新容量大于 `SOFT_MAX_ARRAY_LENGTH` 则触发 `hugeLength()` 判断。

   - **判断超长**：计算 `minLength = oldLength + minGrowth`，
     - 若 `minLength < 0` 则触发 OOM 异常；
     - 若`minLength <= SOFT_MAX_ARRAY_LENGTH` 则新容量便是 `SOFT_MAX_ARRAY_LENGTH`；
     - 其他则新容量为 `minLength`（也就是小于 `Integer.MAX_VALUE` 大于 `Integer.MAX_VALUE - 8`）
   - **存储元素**：最后存储元素并且 `size + 1`

::: details 相关源码

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{
    public boolean add(E e) {
        // 改变列表大小操作数加1
        modCount++;
        // 添加元素
        add(e, elementData, size);
        return true;
    }

    private void add(E e, Object[] elementData, int s) {
        if (s == elementData.length) // 当数组存满了
            // 扩容
            elementData = grow();
        // 添加元素
        elementData[s] = e;
        // ArrayList 实际存储元素数量加1
        size = s + 1;
    }

    private Object[] grow() {
        // 最小容量
        return grow(size + 1);
    }

    private Object[] grow(int minCapacity) {
        int oldCapacity = elementData.length;
        // 一般都是走这里
        if (oldCapacity > 0 || elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            // 计算新容量
            int newCapacity = ArraysSupport.newLength(oldCapacity,
                    minCapacity - oldCapacity, /* minimum growth */
                    oldCapacity >> 1           /* preferred growth */);
            // 新的数据
            return elementData = Arrays.copyOf(elementData, newCapacity);
        } else {
            return elementData = new Object[Math.max(DEFAULT_CAPACITY, minCapacity)];
        }
    }

    public static int newLength(int oldLength, int minGrowth, int prefGrowth) {
        int prefLength = oldLength + Math.max(minGrowth, prefGrowth); // might overflow
        // 判断新容量是否超过安全长度
        if (0 < prefLength && prefLength <= SOFT_MAX_ARRAY_LENGTH) {
            return prefLength;
        } else {
            // put code cold in a separate method
            return hugeLength(oldLength, minGrowth);
        }
    }

    // 超长判定
    private static int hugeLength(int oldLength, int minGrowth) {
        int minLength = oldLength + minGrowth;
        if (minLength < 0) { // overflow
            throw new OutOfMemoryError(
                "Required array length " + oldLength + " + " + minGrowth + " is too large");
        } else if (minLength <= SOFT_MAX_ARRAY_LENGTH) {
            return SOFT_MAX_ARRAY_LENGTH;
        } else {
            return minLength;
        }
    }
}
```

:::

#### fast-fail 机制

- `ArrayList` 会将改变列表大小操作（`add`、`remove`）次数记录到 `modCount` 变量。
- 创建 `ArrayList` 的迭代器 `Itr` 时会将当前 `modCount` 赋值给 `expectedModCount` 。
- 在迭代 `ArrayList` 时，`next()` 方法会调用 `checkForComodification()` 检查当前 `modCount` 和 `expectedModCount` 是否相等，若不相等（迭代过程中发生改变列表大小操作）则抛出 `ConcurrentModificationException()` 异常，这就是 ArrayList 的fast-fail 机制。

下面是触发 fast-fail 机制的案例：

```java
public static void main(String[] args) {
    ArrayList<String> list1 = new ArrayList<>();
    list1.add("1");
    list1.add("2");
    list1.add("3");
    list1.add("4");
    Iterator<String> iterator = list1.iterator(); // 创建迭代器

    while (iterator.hasNext()) {
        String next = iterator.next();
        System.out.println(next);
        if (next.equals("2")) {
            list1.remove("2"); // 改变列表大小操作，触发 modCount增加
        }
    }
}
```

::: details 相关源码解读

```java
public boolean add(E e) {
    modCount++; // 🚨改变列表大小操作，操作数改变
    add(e, elementData, size);
    return true;
}

public boolean remove(Object o) {
    // 省略 。。。
    fastRemove(es, i);
    return true;
}

private void fastRemove(Object[] es, int i) {
    modCount++; // 🚨改变列表大小操作，操作数改变
    final int newSize;
    if ((newSize = size - 1) > i) // size（列表实际元素个数）减小
        System.arraycopy(es, i + 1, es, i, newSize - i);
    es[size = newSize] = null;
}

// 创建迭代器
public Iterator<E> iterator() {
        return new Itr();
}

// ArrayList 实际创建的迭代器
private class Itr implements Iterator<E> {
    int cursor; // 游标默认0
    int expectedModCount = modCount; // 创建迭代器时的 modCount

    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification(); // 检查
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1; // 每遍历一个游标数加1
        return (E) elementData[lastRet = i];
    }

    final void checkForComodification() {
        if (modCount != expectedModCount) // 判断实际 modCount 与存储的是否相等
            throw new ConcurrentModificationException();
    }
}
```

:::
::: details 特殊案例

特殊案例1：不会触发 fast-fail 机制：

```java
public static void main(String[] args) {
    ArrayList<String> list1 = new ArrayList<>();
    list1.add("1");
    list1.add("2");
    list1.add("3");
    list1.add("4");
    Iterator<String> iterator = list1.iterator(); // 创建迭代器

    while (iterator.hasNext()) {
        String next = iterator.next();
        System.out.println(next);
        if (next.equals("3")) {
            list1.remove("3"); // 改变列表大小操作，触发 modCount增加
        }
    }
}
```

特殊案例2：会触发 fast-fail 机制：

```java
public static void main(String[] args) {
    ArrayList<String> list1 = new ArrayList<>();
    list1.add("1");
    list1.add("2");
    list1.add("3");
    list1.add("4");
    Iterator<String> iterator = list1.iterator(); // 创建迭代器

    while (iterator.hasNext()) {
        String next = iterator.next();
        System.out.println(next);
        if (next.equals("4")) {
            list1.remove("4"); // 改变列表大小操作，触发 modCount增加
        }
    }
}
```

**为什么？**

- **特殊案例 1** 中，遍历到 `"3"` 时，此时 `cursor=3`，由于 `remove` 一个元素，列表 `size` （列表实际元素个数）会减 1 ，由 4 变成 3，`hasNext()` 逻辑是 `cursor != size` 时表示还有值，然后此时恰好相等，会直接结束遍历。
- **特殊案例 2** 也是同样的道理，遍历到 `"4"` 时，此时 `cursor=4`，`size = 3`，`cursor != size` 时表示还有值会继续遍历，调用 `iterator.next();` 就会调用 `checkForComodification` 触发 fast-fail 机制。
:::

### Vector

Vector 与 ArrayList 类似，区别在于 Vector 是线程安全的。

```java {1}
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}
```

#### Stack

Stack 类表示对象的后进先出 (LIFO) 堆栈。继承 Vector。Deque 接口及其实现提供了一组更完整和一致的 LIFO 堆栈操作，应优先使用此类。所以这类基本不怎么使用，了解即可。

### LinkedList

- List 和 Deque 接口的双向链表实现
- 线程不安全，`List list = Collections.synchronizedList(new LinkedList(...));` 可创建线程安全的 `LinkedList`
- 和 ArrayList支持 fast-fail 机制
- 适合插入、删除，相较于 ArrayList 随机访问的效率较低

#### 实现原理

基于 Node 的链式结构，每个 Node 包含自身属性和，上一个节点以及下一个节点。

```java
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

新增一个节点：

```java
public boolean add(E e) {
    linkLast(e);
    return true;
}
void linkLast(E e) {
    final Node<E> l = last;
    final Node<E> newNode = new Node<>(l, e, null); // 新增节点，上一个节点为旧的末端节点，下一个节点默认 null
    last = newNode;
    if (l == null)
        first = newNode;
    else
        l.next = newNode; // 旧的末端设置为新的末端节点
    size++; // 实际存储元素数量加1
    modCount++; // 操作数加1
}
```

插入指定位置：

```java
public void add(int index, E element) {
    checkPositionIndex(index);

    if (index == size) // 相当于末端新增
        linkLast(element);
    else
        linkBefore(element, node(index));
}
// 🚨🚨🚨从头/从尾遍历查找指定 index 的节点，这也是其查询满的原因🚨🚨🚨
Node<E> node(int index) {
    // assert isElementIndex(index);

    if (index < (size >> 1)) { // 判断index是小于还是大于 二分之一size
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next; // 从头开始获取下一个节点，直到 index
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev; // 从尾开始获取上一个节点，直到 index
        return x;
    }
}
// 修改链接信息
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;
    final Node<E> pred = succ.prev;
    final Node<E> newNode = new Node<>(pred, e, succ);
    succ.prev = newNode;
    if (pred == null)
        first = newNode;
    else
        pred.next = newNode;
    size++;
    modCount++;
}
```

![LinkedList 插入](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208142211830.png)

### LinkedList 插入/删除速度一定比 ArrayList 快？

::: details 插入速度测试（基于 JDK 17 测试）

```java
public class ListDemo3 {
    public static void main(String[] args) {
        testArrayListAddLast();
        testArrayListAddFirst();
        testArrayListAddLastByIndex();
        testLinkedListAddLast();
        testLinkedListAddFirst();
    }

    /**
     * ArrayList 尾插
     */
    public static void testArrayListAddLast() {
        long start = System.currentTimeMillis();

        ArrayList<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10000000; i++) {
            list.add(i);
        }

        long end = System.currentTimeMillis();
        System.out.println("ArrayList 尾插1000w数据耗时：" + (end - start));

    }


    /**
     * ArrayList 尾插
     */
    public static void testArrayListAddLastByIndex() {
        long start = System.currentTimeMillis();

        ArrayList<Integer> list = new ArrayList<>();
        list.add(0);
        for (int i = 1; i < 10000000; i++) {
            list.add(i, i);
        }

        long end = System.currentTimeMillis();
        System.out.println("ArrayList 尾插1000w数据耗时：" + (end - start));

    }

    /**
     * ArrayList 头插 - 巨慢！！
     */
    public static void testArrayListAddFirst() {
        long start = System.currentTimeMillis();

        ArrayList<Integer> list = new ArrayList<>();
        list.add(0);
        for (int i = 1; i < 100000; i++) {
            list.add(0, i);
        }

        long end = System.currentTimeMillis();
        System.out.println("ArrayList 头插10w数据耗时：" + (end - start));
    }

    /**
     * LinkedList 尾插
     */
    public static void testLinkedListAddLast() {
        long start = System.currentTimeMillis();

        LinkedList<Integer> list = new LinkedList<>();
        for (int i = 0; i < 10000000; i++) {
            list.add(i);
        }
        long end = System.currentTimeMillis();
        System.out.println("LinkedList 尾插1000w数据耗时：" + (end - start));
    }

    /**
     * LinkedList 头插
     */
    public static void testLinkedListAddFirst() {
        long start = System.currentTimeMillis();

        LinkedList<Integer> list = new LinkedList<>();
        for (int i = 0; i < 10000000; i++) {
            list.addFirst(i);
        }
        long end = System.currentTimeMillis();
        System.out.println("LinkedList 头插1000w数据耗时：" + (end - start));

    }
}

```

:::
测试结构：

```text
ArrayList 尾插1000w数据耗时：353
ArrayList 头插10w数据耗时：852
ArrayList 尾插1000w数据耗时：383
LinkedList 尾插1000w数据耗时：3030
LinkedList 头插1000w数据耗时：2836
```

**结论**：仅当尾插，不涉及 `System.arrayCopy` 来移动数组元素， `ArrayList` 插入速度要大于 `LinkedList` 其他情况，还是 `LinkedList` 速度较快

```java{9-11}
// ArrayList 的 add 方法
public void add(int index, E element) {
    rangeCheckForAdd(index);
    modCount++;
    final int s;
    Object[] elementData;
    if ((s = size) == (elementData = this.elementData).length)
        elementData = grow();
    System.arraycopy(elementData, index,
                        elementData, index + 1,
                        s - index);
    elementData[index] = element;
    size = s + 1;
}
```

## Set

Set 集合数据不可重复

### TreeSet

有序集合（默认升序）

```java
public static void test() {
    TreeSet<Integer> set = new TreeSet<>() {{
        add(3);
        add(1);
        add(5);
        add(4);
        add(4);

    }};
    set.forEach(i -> System.out.println(i));
}
// 输出结果：
// 1
// 3
// 4
// 5
```

自定义排序（User 有 name 和 age 2 个属性）：

```java
public static void test2() {
    Comparator<User> comparator = Comparator.comparingInt(u -> u.age);
    // 降序
    TreeSet<User> treeSet = new TreeSet<>(comparator.reversed()) {{
        add(new User("aaa", 18));
        add(new User("aaa", 28));
        add(new User("aaa", 16));
        add(new User("aaa", 38));
        add(new User("aaa", 8));
    }};

    treeSet.forEach(u -> System.out.println(u));
}
// 输出结果：
// User{name='aaa', age=38}
// User{name='aaa', age=28}
// User{name='aaa', age=18}
// User{name='aaa', age=16}
// User{name='aaa', age=8}
```

底层是 `TreeMap`：

```java
public TreeSet() {
    this(new TreeMap<>());
}
```

添加元素相当于，将元素作为 Map 的 key（Map 的 key 天然的不重复，添加相同元素相当于 update ），并使用 `new Object()` 作为值占位。

```java
private static final Object PRESENT = new Object();

public boolean add(E e) {
    return m.put(e, PRESENT)==null;
}
```

`TreeSet` 线程不安全，可以使用如下语句创建线程安全的 `TreeSet` ：

```java
SortedSet s = Collections.synchronizedSortedSet(new TreeSet(...));
```

`TreeMap`支持 fast-fail 机制

### HashSet

底层是 `HashMap`

```java
public HashSet(int initialCapacity, float loadFactor) {
    map = new HashMap<>(initialCapacity, loadFactor);
}
```

`HashSet` 线程不安全，可以使用如下语句创建线程安全的 `HashSet` ：

```java
Set s = Collections.synchronizedSet(new HashSet(...));
```

`HashSet`支持 fast-fail 机制

此类为基本操作（ add 、 remove 、 contains和size ）提供恒定的时间性能，假设哈希函数将元素正确地分散在桶中。迭代这个集合需要的时间与HashSet实例的大小（元素的数量）加上支持HashMap实例的“容量”（桶的数量）的总和成正比。**因此，如果迭代性能很重要，则不要将初始容量设置得太高（或负载因子太低），这一点非常重。**

### LinkedHashSet

Set接口的哈希表和链表实现，具有**可预测的迭代顺序**。即迭代顺序即为插入顺序，注意的是重写插入，其迭代顺序不受影响

与HashSet一样，它为基本操作（添加、包含和删除）提供恒定时间性能，假设哈希函数在桶中正确地分散元素。由于维护链表的额外费用，性能可能略低于HashSet ，但有一个例外：对LinkedHashSet的迭代需要与集合大小成正比的时间，而不管其容量如何。 HashSet的迭代可能会更昂贵，需要与其容量成正比的时间。

链接哈希集有两个影响其性能的参数：初始容量和负载因子。它们的定义与HashSet完全相同。但是请注意，对于此类而言，为初始容量选择过高值的惩罚不如HashSet严重，因为此类的迭代时间不受容量的影响

线程不安全，可使用如下语句创建线程安全的 LinkedHashSet：

```java
Set s = Collections.synchronizedSet(new LinkedHashSet(...));
```

### EnumSet

## Queue

### LinkedList

详见 List 的 LinkedList 是一个东西，LinkedList 即实现了List 有实现了 Queue

### PriorityQueue

基于优先级堆的无界优先级队列。优先级队列的元素根据其自然顺序或在队列构建时提供的Comparator进行排序，具体取决于使用的构造函数。

线程不安全，若需要线程安全可以使用 `java.util.concurrent.PriorityBlockingQueue` 类。

```java
public class QueueDemo1 {
    public static class User {
        public String name;
        public Integer age;

        public User(String name, int age) {
            this.name = name;
            this.age = age;
        }

        @Override
        public String toString() {
            return "User{" +
                    "name='" + name + '\'' +
                    ", age=" + age +
                    '}';
        }
    }

    public static void main(String[] args) {
        PriorityQueue<Integer> queue = new PriorityQueue<>();

        queue.add(1);
        queue.add(7);
        queue.add(5);
        queue.add(2);

        while (queue.size() > 0) {
            System.out.println(queue.remove());
        }

        System.out.println("=========================");
        PriorityQueue<User> queue1 = new PriorityQueue<>(Comparator.comparingInt(u -> u.age)) {{
            add(new User("aaa", 18));
            add(new User("aaa", 28));
            add(new User("aaa", 16));
            add(new User("aaa", 38));
            add(new User("aaa", 8));
        }};
        while (queue1.size() > 0) {
            System.out.println(queue1.remove());
        }
    }
}
// 输出结果：
// 1
// 2
// 5
// 7
// =========================
// User{name='aaa', age=8}
// User{name='aaa', age=16}
// User{name='aaa', age=18}
// User{name='aaa', age=28}
// User{name='aaa', age=38}
```

PriorityQueue 特性：

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202209152157507.png)
