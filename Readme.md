# fis-command-aspnet #

ASP.NET server for previewing [fis projects](https://github.com/fex-team/fis).

Fis, or Front-end Integrated Solution is a web front end framework from the Baidu front-end team, it helps developers and deploy engineers easier to test and publish assets.

This asp.net server provider is an extension for fis to enable support for asp.net projects. It automatically starts iisexpress、DevServer or XSP with mono to serve the project in different environments. 



**Usage**

  Usage: fis aspnet <command> [options]

  Commands:

    start                  start server
    stop                   shutdown server
    restart                restart server
    info                   output server info
    open                   open document root directory
    clean                  clean files in document root

  Options for **start**:

    -p, --port <int>               port for the server to listen
    --root <path>                  root path of the preview project
    --clr <version>                specify .net clr version, 2 or 4
    --document <default_document>  default document to navigate
    --include <glob>               clean include filter
    --exclude <glob>               clean exclude filter




**License**

This project use the [WTFPL](http://en.wikipedia.org/wiki/WTFPL) license, which means you can do what ever you want with it.

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