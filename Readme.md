Note: [Use this link](https://github.com/ciznx/fis-command-aspnet/blob/master/Readme-en.md) to read the English version of Readme.md.

# fis-command-aspnet #

用于为  [FIS](https://github.com/fex-team/fis) 预览 ASP.NET 项目的服务器提供程序。

FIS, 即前端集成解决方案，是由百度前端团队开发的一个前端框架，它可以让开发者和部署工程师更方便地测试和发布前端资源。

此 asp.net 服务器提供程序是 FIS 的扩展，它根据运行环境的不同，自动启动 iisexpress、DevServer 或基于 Mono 的 XSP 来为 ASP.NET 项目提供预览服务。 


## 安装 ##
当正确地安装了 FIS 之后，您可以直接从此 Github 站点下载此扩展，将文件夹命名为 fis-command-aspnet，即可使用其功能。
如果您已经安装了百度的包管理器 [Lights](http://lightjs.duapp.com/)，您也可以通过下面的命令来安装：

    lights install fis-command-aspnet

在运行此命令之前，您可能需要使用 cd 命令将命令行上下文路径切换至 FIS 安装目录。

## 使用 ##

  用法： fis aspnet <command> [options]

  命令列表：

    start                  start server
    stop                   shutdown server
    restart                restart server
    info                   output server info
    open                   open document root directory
    clean                  clean files in document root

  **start** 命令支持的参数：

    -p, --port <int>               port for the server to listen
    --root <path>                  root path of the preview project
    --clr <version>                specify .net clr version, 2 or 4
    --document <default_document>  default document to navigate
    --include <glob>               clean include filter
    --exclude <glob>               clean exclude filter



## 协议 ##

此项目基于 [WTFPL](http://en.wikipedia.org/wiki/WTFPL) 开源：即您可以以任何方式使用它。

<pre>
           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                   Version 2, December 2004

Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

 0. You just DO WHAT THE FUCK YOU WANT TO.
</pre>