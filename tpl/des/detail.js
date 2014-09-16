define( "detailTpl", [], function() {
    return [
        '<% if ( data.costInclude ) { %>',
            '<section class="itra_bd">',
                '<div class="tit_desc detail-tit-desc">',
                    '<h2>费用信息</h2>',
                    '<span class="btn_arr"></span>',
                '</div>',
                '<div class="desc">',
                    '<%= data.costInclude %>',
                '</div>',
            '</section>',
        '<% } %>'
    ].join( '' );
} );