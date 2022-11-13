# Map

存储键值对（key-value）数据，key 不可以重复，value 可以

![Map 继承结构](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208151512153.png)

- TreeMap ：线程不安全，有序的，按照 Key 自然排序和自定义排序，底层是红黑树
- Hashtable ：线程安全，不能存储 null 键和值
  - properties ：常用于配置文件，key value 都是 String
- HashMap ：线程不安全，能存储 null 键和值，无序的
  - LinkedHashMap ：维护插入元素的顺序
- CurrentHashMap ：线程安全

## HashMap 原理

jdk 7：数组+链表

jdk8：数组+链表+红黑树（查询快）

`new HashMap<>()`  构造一个具有默认初始容量 (16) 和默认加载因子 (0.75) 的空 `HashMap` 。（此时并实际创建存储数据的数组，在第一次 put 时才会创建。）

```java
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}
```

第一次 put(K,V) 数据

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

计算 hash 值

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

`putVal` 方法是 HashMap 存放数据的实现：

- 首先判断是否创建存放数据的 `Node` 数组容器 `table`，若未创建会通过 `resize()` 方法创建一个长度为 16 的，阈值 12（容量*加载因子，即 `16*0.75=12`）的 `Node` 数组:

    ```java
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    ```

    `resize()` 源码解读：

    ```java
    //
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table; // 值为 null
        int oldCap = (oldTab == null) ? 0 : oldTab.length; // 值为 0
        int oldThr = threshold; // 值为 0
        int newCap, newThr = 0;
        if (oldCap > 0) { // 不走这里
            // 省略 ...
        }
        else if (oldThr > 0) // 不走这里
            newCap = oldThr;
        else { // 走这里
            newCap = DEFAULT_INITIAL_CAPACITY; // 值为 16
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY); // 值为 16*0.75=12
        }
        // 省略 ...
        threshold = newThr; // 触发扩容的阈值
        Node<K,V>[] newTab = (Node<K,V>[]) new Node[newCap]; // 创建一个长度为 16 的 Node 数组
        table = newTab; // 复制给 table，table 即为实际存储数据的 Node 数组
        // 省略 ...
    }
    ```

- 通过 hash 值计算存放的索引 `i`

    ```java
    // n = tab.length
    // i 初始为 0
    i = (n - 1) & hash
    ```

- 当索引 `i` 的对应的值为 null 时（即没有值），直接创建新的 Node 存放到索引 `i` 位置

    ```java
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null); // null 表示当前索引上的链表没有下一个 Node
    ```

- 当索引 `i` 有值时，进一步判断：
  - 若索引 `i` 值的 hash 和新值 hash 相等且 key 相等则更新 `e` (e 是临时变量，表示是否有旧的重复key)

    ```java
    if (p.hash == hash &&
        ((k = p.key) == key || (key != null && key.equals(k))))
        e = p;
    ```

  - 若已索引 `i` 值的类型是红黑树，则调用红黑树逻辑

    ```java
    else if (p instanceof TreeNode)
        e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
    ```

  - 其他情况（即链表还未转换从红黑树），遍历当前索引处链表：

    ```java
    else {
        for (int binCount = 0; ; ++binCount) {
            if ((e = p.next) == null) { // 表示链表末端或者链接只存了一个元素
                p.next = newNode(hash, key, value, null); // 存新的键值对
                // 若链表长度大于8时，判断数组长度是否大于 64，若大于则将链表转换成红黑树，否则扩容
                if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                    treeifyBin(tab, hash);
                break;
            }
            // 表示重复的key将更新
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
                break;
            p = e;
        }
    }
    ```

- 当 e 不为 null时（即 key 重复），则更新 value

    ```java
    if (e != null) { // existing mapping for key
        V oldValue = e.value;
        if (!onlyIfAbsent || oldValue == null)
            e.value = value;
        afterNodeAccess(e);
        return oldValue;
    }
    ```

- 当容量达到阈值则触发扩容

    ```java
    if (++size > threshold)
        resize(); // 一般情况就是容量和阈值 * 2
    ```

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

## TreeMap 原理

首先，`Entry` 类是 `TreeMap` 红黑树数据结构的实现方式：

```java
public class TreeMap<K,V>
    extends AbstractMap<K,V>
    implements NavigableMap<K,V>, Cloneable, java.io.Serializable
{
    // Entry 是存储的节点
    static final class Entry<K,V> implements Map.Entry<K,V> {
        K key;
        V value;
        Entry<K,V> left; // 当前节点的左子节点
        Entry<K,V> right; // 当前节点的右子节点
        Entry<K,V> parent; // 当前节点的父节点
        boolean color = BLACK; // 当前节点的颜色

        Entry(K key, V value, Entry<K,V> parent) {
            this.key = key;
            this.value = value;
            this.parent = parent;
        }
    }
}
```

然后，是 `TreeMap#put(K key, V value)` 方法（该方法返回值是被替换掉元素的值，没有实际值则返回 `null`）：

```java
public V put(K key, V value) {
    Entry<K,V> t = root;
    if (t == null) { // 当前 TreeMap 没有任何数据时的情况
        compare(key, key); // 类型检查和非 null 检查

        root = new Entry<>(key, value, null); // 创建根节点
        size = 1; // 实际存储元素数 +1
        modCount++; // 操作数 +1
        return null; // 返回替换掉元素的值
    }
    int cmp;
    Entry<K,V> parent;
    // split comparator and comparable paths
    Comparator<? super K> cpr = comparator; // 自定义的比较器，没有则是 null
    if (cpr != null) {
        do {
            parent = t;
            cmp = cpr.compare(key, t.key); // 自定比较器使用的 comparator.compare 方法
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value);
        } while (t != null);
    }
    else {
        if (key == null)
            throw new NullPointerException();
        @SuppressWarnings("unchecked")
            Comparable<? super K> k = (Comparable<? super K>) key;
        do {
            parent = t;
            cmp = k.compareTo(t.key); // 默认比较器使用的 comparable.compareTo 方法（包装类型都实现了Comparable接口）
            if (cmp < 0)
                t = t.left; //
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value);
        } while (t != null);
    }
    Entry<K,V> e = new Entry<>(key, value, parent);
    if (cmp < 0)
        parent.left = e;
    else
        parent.right = e;
    fixAfterInsertion(e);
    size++;
    modCount++;
    return null;
}
```
