从 [Github](https://github.com/oracle/visualvm) 下载并解压。

`visualvm_214\bin\visualvm.exe` 启动程序

在 `visualvm_214\etc\visualvm.conf` 配置 JAVA_HOME

```text
visualvm_jdkhome="C:\Users\chang\scoop\apps\openjdk17\current"
```

安装 GC 可视化插件， Tools\Plugins 安装 `Visual GC` ，安装成功重启即可。
