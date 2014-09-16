define( "fgt_pwd_s2Tpl", [], function() {
    return [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
            '<title>忘记密码页</title>',
            '<meta charset="utf-8">',
            '<meta name="author" content="zhangchen2397@126.com">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, minimal-ui">',
            '<meta name="apple-mobile-web-app-capable" content="yes">',
            '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
            '<script src="/static/base/mod.js"></script>',
        '</head>',
        '<body>',
            '<header class="back-hd">',
                '<div class="hd-wrap">',
                    '<div class="back">',
                        '<a href="" class="bg-ic i-back"></a>',
                    '</div>',
                    '<div class="title">忘记密码</div>',
                '</div>',
            '</header>',
            '<div class="container">',
                '<form class="fgt-pwd-form">',
                    '<p class="n-tip">通过验证，请重新设置密码</p>',
                    '<p><input type="text" class="ipt-txt-normal" placeholder="新密码" /></p>',
                    '<p><input type="text" class="ipt-txt-normal" placeholder="确认密码" /></p>',
                    '<p><a type="submit" class="submit-btn">提交</a>',
                '</form>',
            '</div>',
            '<nav class="main-nav">',
                '<ul>',
                    '<li class="cur"><a href="">',
                        '<p class="bg-ic nav-icon i-index"></p>',
                        '<p>首页</p>',
                    '</a></li>',
                    '<li><a href="">',
                        '<p class="bg-ic nav-icon i-pro"></p>',
                        '<p>商品</p>',
                    '</a></li>',
                    '<li><a href="">',
                        '<p class="bg-ic nav-icon i-test"></p>',
                        '<p>评测</p>',
                    '</a></li>',
                    '<li><a href="">',
                        '<p class="bg-ic nav-icon i-news"></p>',
                        '<p>资讯</p>',
                    '</a></li>',
                '</ul>',
            '</nav>',
            '<script>',
                'require( \'page/fgt_pwd\' );',
            '</script>',
        '</body>',
        '</html>'
    ].join( '' );
} );