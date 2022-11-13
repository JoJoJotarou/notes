## 启动类加载器

加载 c语言开的底层包

## 扩展类加载器

加载 ext 目录的 jar
ExtClassLoader

## 系统（应用）类加载器

搜索路径由 java.class.path(classpath)指定

## URLClassLoader

自定义classloader，动态加载jar包，实现不启动应用修改实现

会出问题 ⬆️：
当出现 主程序和动态 jar 依赖相同的 jar 包，但是版本不同，根据双亲委派机制，只会加载主程序依赖的 jar ，动态 jar 可能会找不到自己使用的依赖 jar 的方法。

如何解决？
根据双亲委派机制，若 classloader 有父 classloader ，父 classloader 加载，直接交了子 classloader 处理

## 自定义类加载

新的问题，AppClassloder 和 URLClassLoder （父类是extClassLoder，和AppClassloder是同级关系）都加载了同一个类，是完全隔离的。

如何解决？ 自定义一个先查询本身的类加载器，打破双亲委派原则。
