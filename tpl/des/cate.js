define( "cateTpl", [], function( require, exports, module ) {
    return (
        "<div class=\"reply-wrap\">"+
            "<div class=\"bg-comment ic-arrow\"></div>"+
            "<div class=\"post-reply clearfix\">"+
                "<a class=\"add-new-btn post-reply-btn\" href=\"javascript:void(0);\">回复</a>"+
                "<input type=\"text\" class=\"post-reply-ipt\" />"+
            "</div>"+

            "<div class=\"info-tip clearfix\">"+
                "<p class=\"error-tip\"></p>"+
                "<p class=\"reply-num\">共<%= reply_count %>条回复</p>"+
            "</div>"+

            "<ul class=\"reply-list\">"+
                "<% for ( var i = 0; i < data.length; i++ ) { %>"+
                    "<% var item = data[ i ] %>"+
                    "<li>item</li>"+
                "<% } %>"+
            "</ul>"+
        "</div>"
    );
} );