export default {
    title: 'JoJoJotarou\'s Notes',
    lang: 'zh-CN',
    description: 'Love and Share',
    lastUpdated: true,
    markdown: {
        // https://github.com/shikijs/shiki/blob/main/docs/themes.md
        // theme: 'material-palenight',
        lineNumbers: true,
        toc: { level: [2, 3, 4] },
        config: (md) => {
            // use more markdown-it plugins!
            md.use(require('markdown-it-task-lists'))
            md.use(require('markdown-it-mark'))
            md.use(require('markdown-it-footnote'))
            md.use(require('vitepress-plugin-mermaid'))
        }
    },
    themeConfig: {
        siteTitle: 'JoJoJotarou\'s Notes',
        logo: '/logo.svg',
        // outlineTitle: '本页面',
        editLink: {
            pattern: 'https://github.com/jojojotarou/edit/main/docs/:path',
            text: 'Edit this page on GitHub'
        },
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2019-present Evan You'
        },
        nav: [
            {
                text: '☕ Java', items: [
                    { text: '基础', link: '/db/redis/' },
                    { text: 'JVM', link: '/java/jvm/' },
                ]
            },
            { text: '🍃 Spring', link: '/spring/', activeMatch: '/spring/' },
            { text: '面试题', link: '/面试/', activeMatch: '/面试/' },
            { text: '✏️ Blog', link: '/blog/', activeMatch: '/blog/' },
            {
                text: '🧩 收藏',
                items: [
                    { text: 'ULM', link: '/favorites/#ulm' },
                    { text: 'JS 库', link: '/favorites/#js-库' },
                ]
            },
            {
                text: '📦 数据库',
                items: [
                    { text: 'Redis', link: '/db/redis/' },
                    { text: 'Elasticsearch', link: '/db/es/' },
                    { text: 'MySQL', link: '/db/mysql/installation' },
                ]
            },
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/jojojotarou' },
        ],
        sidebar: {
            "/spring/": [
                {
                    text: 'Java',
                    collapsible: true,
                    items: [
                        { text: 'Java 版本及历史', link: '/spring/java/java-history' },
                        { text: 'Java 基础知识', link: '/spring/java/java-basics' },
                        { text: 'Java JDBC', link: '/spring/java/java-jdbc' },
                        { text: 'Java Tips', link: '/spring/java/java-tips' },
                        { text: 'Java 高级: JUC 并发编程', link: '/spring/java/juc' },
                        { text: 'Java Throwable', link: '/spring/java/throwable' },
                        { text: 'Java SPI 机制', link: '/spring/java/SPI' },
                        { text: 'Java 集合：Collection', link: '/spring/java/collection' },
                        { text: 'Java 集合：Map', link: '/spring/java/map' },
                        // { text: 'JVM', link: '/spring/java/jvm2' },
                    ]
                },
                {
                    text: 'Servlet 规范',
                    collapsible: true,
                    items: [
                        { text: 'Servlet', link: '/spring/servlet/servlet' },
                        { text: 'Filter', link: '/spring/servlet/servlet-filter' },
                        { text: 'Listener', link: '/spring/servlet/servlet-listener' },
                    ]
                },
                {
                    text: 'Spring Framework',
                    collapsible: true,
                    items: [
                        { text: 'Spring IoC', link: '/spring/sf/ioc/' },
                        { text: 'Spring IoC：依赖注入（DI）', link: '/spring/sf/ioc/di' },
                        { text: 'Spring IoC：Beans', link: '/spring/sf/ioc/beans' },
                        { text: 'Spring AOP', link: '/spring/sf/aop/' },
                        { text: 'Spring 类型转换', link: '/spring/sf/type-conversion/' },
                        // { text: 'Spring AOP：JDK & CGLIB 动态代理', link: '/spring/sf/aop-jdk-and-cglib-proxy' },
                    ]
                },
                {
                    text: 'Spring Web MVC',
                    collapsible: true,
                    items: [
                        { text: 'todo...', link: '/spring/todo' },
                    ]
                },
                {
                    text: 'Mybatis',
                    collapsible: true,
                    items: [
                        { text: '快速上手', link: '/spring/mybatis/' },
                        { text: 'Mybatis XML 配置', link: '/spring/mybatis/xml-config' },
                        { text: 'Mybatis Mapper 映射文件', link: '/spring/mybatis/xml-mapper' },
                        { text: 'Mybatis Generator（MBG）', link: '/spring/mybatis/mbg' },
                        { text: 'MyBatis 与 Spring 集成', link: '/spring/mybatis/mybatis-spring' },
                    ]
                },
                {
                    text: 'Spring Boot',
                    collapsible: true,
                    items: [
                        { text: 'Spring Boot 启动过程', link: '/spring/spring-boot/startup' },
                        { text: 'Logging: SLF4J', link: '/spring/spring-boot/logging' },
                    ]
                },
                {
                    text: 'Spring Cloud',
                    collapsible: true,
                    items: [
                        { text: 'todo...', link: '/spring/todo' },
                    ]
                },
                {
                    text: 'Other',
                    collapsible: true,
                    items: [
                        { text: 'todo...', link: '/spring/todo' },
                        { text: 'JSON Binding', link: '/spring/other/jsonb' },
                    ]
                }
            ],
            "/db/redis/": [
                {
                    text: 'Redis',
                    // collapsible: true,
                    items: [
                        { text: 'Redis 数据类型', link: '/db/redis/data-type' },
                    ]
                }
            ],
            "/db/mysql/": [
                {
                    text: 'MySQL',
                    // collapsible: true,
                    items: [
                        { text: '安装', link: '/db/mysql/installation' },
                        { text: '事物', link: '/db/mysql/transaction' },
                        { text: '索引', link: '/db/mysql/indexes' },
                    ]
                }
            ],
            "/java/jvm/": [
                {
                    text: 'JVM',
                    // collapsible: true,
                    items: [
                        { text: '类的加载', link: '/java/jvm/load-class' },
                        { text: '类加载器（ClassLoder）', link: '/java/jvm/classloader' },
                        { text: 'JVM 内存模型', link: '/java/jvm/jvm-memory-model' },
                        {
                            text: 'JVM 内存模型',
                            items: [
                                { text: '类加载器（Class Loder）', link: '/java/jvm/class-loader' },
                                { text: 'JVM 内存模型', link: '/java/jvm/jvm-memory-model' },
                            ]
                        },
                    ]
                }
            ],
        }
    }
}