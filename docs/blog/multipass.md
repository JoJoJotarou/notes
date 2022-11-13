# multipass

[multipass](https://multipass.run/) 是由 Ubuntu 母公司发现一款类似 [vagrant](https://www.vagrantup.com/) 的 VM 命令行工具，可以帮助我们通过命令行快速创建、管理 VM。

- multipass 支持 Hyper-V 和 VirtualBox，本文将使用 Hyper-V。
- multipass 和 vagrant 一样有自己的 VM 镜像，且都是基于 Ubuntu 的。
- multipass 和 vagrant 一样适用于全平台。

## 安装

首先，通过 `控制面板\程序\程序与功能\启用或关闭 Windows 功能` 启用 Hyper-V：

![启用 Hyper-V](https://raw.githubusercontent.com/JoJoJotarou/notes/master/img/202207261055942.png)

然后，根据自己的平台选择合适的[安装方法](https://multipass.run/install)

## 启动新 VM 实例

通过 `multipass find` 获取所有可用镜像：

```text
C:\Users\chang>multipass find
Image                       Aliases           Version          Description
core                        core16            20200818         Ubuntu Core 16
core18                                        20211124         Ubuntu Core 18
snapcraft:core18            18.04             20201111         Snapcraft builder for Core 18
snapcraft:core20            20.04             20210921         Snapcraft builder for Core 20
snapcraft:core22            22.04             20220426         Snapcraft builder for Core 22
18.04                       bionic            20220712         Ubuntu 18.04 LTS
20.04                       focal,lts         20220711         Ubuntu 20.04 LTS
22.04                       jammy             20220712         Ubuntu 22.04 LTS
appliance:adguard-home                        20200812         Ubuntu AdGuard Home Appliance
appliance:mosquitto                           20200812         Ubuntu Mosquitto Appliance
appliance:nextcloud                           20200812         Ubuntu Nextcloud Appliance
appliance:openhab                             20200812         Ubuntu openHAB Home Appliance
appliance:plexmediaserver                     20200812         Ubuntu Plex Media Server Appliance
anbox-cloud-appliance                         latest           Anbox Cloud Appliance
charm-dev                                     latest           A development and testing environment for charmers
docker                                        latest           A Docker environment with Portainer and related tools
jellyfin                                      latest           Jellyfin is a Free Software Media System that puts you in control of managing and streaming your media.
minikube                                      latest           minikube is local Kubernetes
```

通过 `multipass launch` 启动包含 Docker 新 VM 实例：

```bash
multipass launch -n $your_instance_name $image_name

multipass launch -n dev01 docker
```

通过 `multipass info` 查看默认分配的资源信息：

```text
C:\Users\chang>multipass info dev01
Name:           dev01
State:          Running
IPv4:           172.28.42.219 <-- docker 容器 ip
                172.17.0.1 <-- docker ip
Release:        Ubuntu 22.04 LTS
Image hash:     86481acb9dbd (Ubuntu 22.04 LTS)
Load:           0.00 0.00 0.00
Disk usage:     3.6G out of 38.6G
Memory usage:   630.0M out of 3.8G
Mounts:         --
```

::: info
docker 镜像实例默认创建 Portainer 容器（基于 web 管理 docker 容器），端口 9000，不需要可以手动删除。
:::

通过 `multipass list` 查看本地实例

```bash
C:\Users\chang>multipass list
Name                    State             IPv4             Image
primary                 Stopped           --               Ubuntu 20.04 LTS
dev01                   Running           172.28.42.219    Ubuntu 22.04 LTS
                                          172.17.0.1
```

更多命令查看 `multipass -h` 和[官方文档](https://multipass.run/docs)

## 固定 hostname

每次重新开机 Windows 会自动生成IP映射，更新 `C:\Windows\System32\drivers\etc` 下的 `hosts.ics` 文件，我们可以通过其设定的域名访问 multipass 创建的虚拟机，可以通过 `ping dev01.mshome.net` 测试。[查看方案出处 ↗️](https://github.com/canonical/multipass/issues/567#issuecomment-713350708)

```text
# Copyright (c) 1993-2001 Microsoft Corp.
#
# This file has been automatically generated for use by Microsoft Internet
# Connection Sharing. It contains the mappings of IP addresses to host names
# for the home network. Please do not make changes to the HOSTS.ICS file.
# Any changes may result in a loss of connectivity between machines on the
# local network.
#

172.28.32.1 DESKTOP-J4J2BHB.mshome.net # 2027 7 0 25 2 8 23 232
172.28.42.219 dev01.mshome.net # 2022 8 2 2 2 8 23 232
172.23.138.107 primary.mshome.net # 2022 8 1 1 13 44 18 754
```
