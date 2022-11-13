# Redisson：Redis 分布式锁

主要用作分布式锁，

看门狗

1. 锁的自动续期，如果业务超长，运行期间自动给锁续上新的30s ，不用担心约为时间长，锁自动过期被删除。
2. 加锁的业务只要运行完成，就不会给当前锁续期，即使不手动释放锁，锁默认30秒自动删除

## 读写锁

写锁没释放读锁必须等待

## 闭锁

等待其他完成，才能完成

## 信号链

总数3，当满的时候，只有减一个才能仅一个，例如限流

## 缓存数据不一致

- 双写模式：更新后直接改缓存

![双写模式](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208092210451.png)

- 加锁
- 设置失效时间（根据业务的时效性）

- 失效：修改会直接删除缓存中数据

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208092213379.png)

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202208092214677.png)

- Cannl
