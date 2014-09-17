'use strict';

var fs = require('fs');
var os = require('os');

var path = require('./path');

var watchList = {};
var timer = {};

var walk = function ( dir, callback, filter ) {
    fs.readdirSync( dir ).forEach( function ( item ) {
        var fullname = path.join( dir, item );

        if ( fs.statSync( fullname ).isDirectory() ){
            if ( !filter( fullname ) ) {
                return;
            }

            watch( fullname, callback, filter );
            walk( fullname, callback, filter );
        }
    } );
};

var watch = function( parent, callback, filter ) {
    if ( watchList[ parent ] ) {
        watchList[ parent ].close();
    }

    watchList[ parent ] = fs.watch( parent, function ( event, filename ) {
        
        //windows下无法自动监听到文件到文件夹删除时filename，直接返回
        if ( filename === null ) {
            return;
        }

        var fullname = path.join( parent, filename );
        var type;
        var fstype;

        if ( !filter( fullname ) ) {
            return;
        }

        // 检查文件、目录是否存在
        if ( !fs.existsSync( fullname ) ) {

            // 如果目录被删除则关闭监视器
            if ( watchList[ fullname ] ) {
                fstype = 'directory';
                watchList[ fullname ].close();
                delete watchList[ fullname ];
            } else {
                fstype = 'file';
            }

            type = 'delete';
        } else {
            // 文件
            if ( fs.statSync( fullname ).isFile() ) {
                fstype = 'file';
                type = event == 'rename' ? 'create' : 'updated';

            // 文件夹
            } else if ( event === 'rename' ) {

                fstype = 'directory';
                type = 'create';

                watch( fullname, callback, filter );
                walk( fullname, callback, filter );
            }
        }

        var eventData = {
            type: type,
            target: filename,
            parent: parent,
            fstype: fstype
        };

        if ( /windows/i.test( os.type() ) ) {
            // window 下 nodejs fs.watch 方法尚未稳定
            clearTimeout( timer[ fullname ] );

            timer[ fullname ] = setTimeout( function() {
                type && callback( eventData );
            }, 16 );

        } else {
            
        }
    } );
};

/**
 * @param   {String}    要监听的目录
 * @param   {Function}  文件、目录改变后的回调函数
 * @param   {Function}  过滤器（可选）
 */
module.exports = function( dir, callback, filter ) {

    // 排除“.”、“_”开头或者非英文命名的目录
    var FILTER_RE = /[^\w\.\-$]/;
    filter = filter || function( name ) {
        return !FILTER_RE.test( name );
    };

    watch( dir, callback, filter );
    walk( dir, callback, filter );
};
