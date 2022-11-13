

## 无图形界面安装增强工具

第一步，通过界面安装增强工具

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206222209078.png)

第二步，通过如下方式挂载并执行（使用 root 或具有 sudo 权限的用户执行）

```bash
mount /dev/cdrom /media/cdrom/
cd /media/cdrom/
sh VBoxLinuxAdditions.run
```

若你执行 `sh VBoxLinuxAdditions.run` 输出 `Kernel headers not found for target kernel 5.10.0-15-amd64`

![](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202206222214961.png)

则需要下载当前内核版本的 `headers`（下面是Debian的，不同的发行可能按照方式不相同）：

```bash
apt install linux-headers-$(uname -r)
```

然后根据提示执行 `/sbin/rcvboxadd setup`，则输出没有 `Kernel headers not found for target kernel 5.10.0-15-amd64`

最后，重启虚拟机。



无语啊，拖放文件和共享剪切板已经不能用，但是已经可以共享文件夹了😥