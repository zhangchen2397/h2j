h2j (html2js)
=======

将html模板文件自动转化成模块化后的js文件。
- 修改文件实时编译更新
- 提供AMD、CMD两种模块化规范选择
- 字符串拼接提供数组及`+`和单双引号自由组合选择
- 前端模板引擎不做任何约束，按需求灵活选择
- 自动过滤指定目录下模板文件后缀名


###使用场景

前端开发处理单页面应用时，所有页面模板都是由前端异步渲染生成，目前常用的方式有以下几种：

1. 直接将模板放在js文件中拼接，如：

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

2. 将模板片段直接放在模板文件中，如：
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

3. 通过已有的插件解决
如果项目是引入了requirejs和seajs作为模块加载器，可以直接使用text插件解决以上所有问题，已经算是一种非常好的解决方案，但是模板加载方式是通过ajax异步请求的方式获取，上线时每加载一个模板文件都会新增加一个请求，而且如果模板路径与js不在同一个域下还存在跨域的问题。

###h2j的解决方案
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
如tpl/src/index.html：

```html
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

整体目录结构如下


###使用

