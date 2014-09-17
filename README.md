h2j (html2js)
=======

将html模板文件自动转化成模块化后的js文件，支持多种模块化规范，自由组合字符串拼接方式，更加直观的模板文件管理方式。

- 修改文件实时编译更新
- 提供AMD、CMD两种模块化规范选择
- 字符串拼接提供数组及`+`和单双引号自由组合选择
- 前端模板引擎不做任何约束，按需求灵活选择
- 提供良好的模板文件目录管理方式


##使用场景

前端开发处理单页面应用时，所有页面模板都是由前端异步渲染生成，目前常用的方式有以下几种：

**1. 直接将模板放在js文件中拼接，如：**

```javascript
var tpl = 
'<div class="reply-wrap">'+
    '<div class="bg-comment ic-arrow"></div>'+
    '<div class="post-reply clearfix">'+
        '<a class="add-new-btn post-reply-btn" href="javascript:void(0);">回复</a>'+
        '<input type="text" class="post-reply-ipt" />'+
    '</div>'+

    '<div class="info-tip clearfix">'+
        '<p class="error-tip"></p>'+
        '<p class="reply-num">共<%= reply_count %>条回复</p>'+
    '</div>'+

    '<ul class="reply-list">'+
        '<% for ( var i = 0; i < data.length; i++ ) { %>'+
            '<% var item = data[ i ] %>'+
            '<li>item</li>'+
        '<% } %>'+
    '</ul>'+
'</div>';
```

这种方式，不管是采用数组拼接还是`+`，书写起来困难，不易阅读，而且还极易引起错误。

**2. 将模板片段直接放在模板文件中，如：**
```html
<script type="text/template" id="comment-tpl">
    <div class="reply-wrap">
        <div class="bg-comment ic-arrow"></div>
        <div class="post-reply clearfix">
            <a class="add-new-btn post-reply-btn" href="javascript:void(0);">回复</a>
            <input type="text" class="post-reply-ipt" />
        </div>

        <div class="info-tip clearfix">
            <p class="error-tip"></p>
            <p class="reply-num">共<%= reply_count %>条回复</p>
        </div>

        <ul class="reply-list">
            <% for ( var i = 0; i < data.length; i++ ) { %>
                <% var item = data[ i ] %>
                <li>item</li>
            <% } %>
        </ul>
    </div>
</script>
```
这种方式书写和阅读都还不错，不过对于单页面应用开发，涉及到的模板特别多，直接全部放在一个模板文件中，不易于管理，太分散。

**3. 通过已有的插件解决**

如果项目是引入了requirejs和seajs作为模块加载器，可以直接使用text插件解决以上所有问题，已经算是一种非常好的解决方案，但是模板加载方式是通过ajax异步请求的方式获取，上线时每加载一个模板文件都会新增加一个请求，而且如果模板路径与js不在同一个域下还存在跨域的问题。

##h2j的解决方案
所有的模板以文件/文件夹的方式管理，书写时像html文件一样即可，通过h2j实时编译后产出与原模板文件对应的目录结构。

```
tpl
  |--src //源模板目录
      |--subpage
           |--comment.html
           |--product.html
      |--index.html
      |--list.html
      |--detail.html

  |--des //产出的js目录
      |--subpage
           |--comment.js
           |--product.js
      |--index.js
      |--list.js
      |--detail.js
```

```html
<!-- tpl/src/index.html -->
<div class="reply-wrap">
    <div class="bg-comment ic-arrow"></div>
    <div class="post-reply clearfix">
        <a class="add-new-btn post-reply-btn" href="javascript:void(0);">回复</a>
        <input type="text" class="post-reply-ipt" />
    </div>

    <div class="info-tip clearfix">
        <p class="error-tip"></p>
        <p class="reply-num">共<%= reply_count %>条回复</p>
    </div>

    <ul class="reply-list">
        <% for ( var i = 0; i < data.length; i++ ) { %>
            <% var item = data[ i ] %>
            <li>item</li>
        <% } %>
    </ul>
</div>
```

编译产出后得到如下js文件
```javascript
//tpl/des/index.js
define( "indexTpl", [], function() {
    return (
        '<div class="reply-wrap">'+
            '<div class="bg-comment ic-arrow"></div>'+
            '<div class="post-reply clearfix">'+
                '<a class="add-new-btn post-reply-btn" href="javascript:void(0);">回复</a>'+
                '<input type="text" class="post-reply-ipt" />'+
            '</div>'+

            '<div class="info-tip clearfix">'+
                '<p class="error-tip"></p>'+
                '<p class="reply-num">共<%= reply_count %>条回复</p>'+
            '</div>'+

            '<ul class="reply-list">'+
                '<% for ( var i = 0; i < data.length; i++ ) { %>'+
                    '<% var item = data[ i ] %>'+
                    '<li>item</li>'+
                '<% } %>'+
            '</ul>'+
        '</div>'
    );
} );
```

##使用说明

###安装h2j
```
npm install h2j -g
```

查看是否安装成功
```
h2j -v  //0.0.2
```

####编译模板

如模板所在路径为`tpl/src`，编译后产出的路径为`tpl/des`

命令行切换至tpl目录下，运行

```
h2j ./src ./des
```

自动将`src`下的所有模板文件编译产出至`des`目录下，并实时监听`src`下的文件更新

####配置参数说明

```
h2j [模板目录] [产出目录]
```
模板目录及产出目录都相对于命令行当前所在目录

模板目录默认为命令行当前所在目录，产出目录默认为命令行当前所在目录下的`./des`

**说明** 模板目录会自动忽略除`.html`, `.htm`, `.tpl`后缀名以外的所有文件

**说明** 产出目录的js模块名以文件名加`Tpl`后续作为模块名

**其它参数配置说明**

```
-mt value 生成js模块化规范类型 amd及cmd可选，默认为amd

-st value 字符串拼接方式
          [数组(array)|加(plus)]与[单(single)|双(double)引号]排列组件
          取as, ad, ps, pd, 默认为as

-c value 生成js文件编码格式，默认为utf-8

-v 显示版本号

-h 显示帮助信息
```

####更多使用示例

将tpl/src下的模板文件编译产出至tpl/des下，字符串拼接采用加及单引号方式，模块采用cmd模块

将命令行切换于tpl目录下，运行

```
h2j ./src ./des -mt cmd -st ps
```