/*!
 * html2js
 * author: zhangchen2397@126.com
 * https://github.com/zhangchen2397/html2js
 * 将html模块自动转化为模块化的js代码
 */

'use strict';

var stdout = require( './stdout.js' );
var watch = require( './watch.js' );
var path = require( './path.js' );

var fs = require( 'fs' );
var events = require( 'events' );

var Html2js = function( config ) {

    //默认配置参数
    this.defaultConf = {
        basePath: './test',
        output: './output',
        charset: 'utf-8',
        type: 'as'
    };

    //合并配置文件
    this.config = this.extend( this.defaultConf, config || {} );

    //当前需要转化的目录
    this.basePath = path.resolve( this.config.basePath );

    //输出路径，相对于basePath目录
    this.output = path.resolve( this.config.output );

    //初始化事件系统
    events.EventEmitter.call( this );

    //清理导出目录
    //this.delDir( this.output );

    //初始化转化组件
    this.init.call( this );
};

Html2js.prototype = {
    __proto__: events.EventEmitter.prototype,

    init: function() {
        this._initEvent();
        this._readFiles();
        this.log('\n[green]watching...[/green]\n\n');
    },

    _initEvent: function() {
        this.on( 'newListener', function( event, listener ) {
            if ( event === 'watch') {

                this.log('\n[green]watching...[/green]\n\n');

                //派发watch事件
                watch( this.basePath, function( data ) {
                    this.emit( 'watch', data );
                }.bind( this ), function ( folderPath ) {
                    return this.filter( folderPath ) && folderPath !== this.output;
                }.bind( this ), fs );
            }
        } );

        // 监控模板目录
        this.on( 'watch', function( data ) {
            var type = data.type;
            var fstype = data.fstype;
            var target = data.target;
            var parent = data.parent;
            var fullname = path.join( parent, target );

            if ( target && fstype === 'file' && this.filter( fullname ) ) {

                if ( type === 'delete' ) {

                    this.emit( 'delete', {
                        id: this._toId( target ),
                        sourceFile: target
                    } );

                    var jsFile = fullname.replace( path.extname( fullname ), '' );
                    jsFile = jsFile.replace( this.basePath, this.output ) + '.js';

                    this._fsUnlink( jsFile );

                } else if ( /updated|create/.test( type ) ) {

                    this.emit( 'change', {
                        id: this._toId(target),
                        sourceFile: target
                    } );

                    this._writeFile( fullname );

                    this.log('\n[green]watching...[/green]\n\n');
                }
            }
        } );
    },

    _delOutputDir: function() {
        this.delDir( this.output );
    },

    //删除文件夹，包括子文件夹
    delDir: function( dir ) {
        var walk = function ( dir ) {
            if ( !fs.existsSync( dir ) || !fs.statSync( dir ).isDirectory() ) {
                return;
            }

            var files = fs.readdirSync( dir );

            //如果是空文件夹
            if ( !files.length ) {
                fs.rmdirSync( dir );
                return;
            } else {
                files.forEach(function ( file ) {
                    var fullName = path.join( dir, file );
                    if ( fs.statSync(fullName).isDirectory() ) {
                        walk( fullName );
                    } else {
                        fs.unlinkSync( fullName );
                    }
                } );
            }

            fs.rmdirSync( dir );
        };

        walk( dir );
    },

    _readFiles: function() {
        var me = this;

        var walk = function( dir ) {
            //如果当前路径就是输出路径，直接返回
            if ( dir === me.output ) {
                return;
            }

            var dirList = fs.readdirSync( dir );

            dirList.forEach( function( item ) {
                if ( fs.statSync( path.join( dir, item ) ).isDirectory()) {
                    walk( path.join( dir, item ) );
                } else if ( me.filterBasename( item ) && me.filterExtname( item ) ) {
                    me._writeFile( path.join( dir, item ) );
                }
            } );
        };

        walk( this.basePath );
    },

    _fsUnlink: function (file) {
        return fs.existsSync( file ) && fs.unlinkSync( file );
    },

    filterBasename: function( name ) {
        // 英文、数字、点、中划线、下划线的组合，且不能以点开头
        var FILTER_RE = /^\.|[^\w\.\-$]/;

        return !FILTER_RE.test( name );
    },

    filterExtname: function( name ) {
        // 支持的后缀名
        var EXTNAME_RE = /\.(html|htm|tpl)$/i;
        return EXTNAME_RE.test( name );
    },

    _writeFile: function ( file ) {
        // 模板字符串
        var source = {};

        // 目标路径
        var target = file
            .replace( path.extname( file ), '.js' )
            .replace( this.basePath, this.output );

        //读取源模板文件
        try {
            source.code = fs.readFileSync( file, this.config.charset );
            source.id = this._toId( file );
        } catch ( e ) {
            console.log( e );
        }

        //将模板文件写入为js文件
        try {
            this.addDir( path.dirname( target ) );
            fs.writeFileSync( target, this._compile( source ), this.config.charset );

            var time = (new Date).toLocaleTimeString();
            this.log('[yellow]' + time + '[/yellow]\n');
            this.log( target.replace( this.output, this.config.output ) + ' [green]success[/green]\n' );
            console.log( '------------------------------------' );
        } catch ( e ) {
            console.log( e );
        }
    },

    //创建目录，包含子文件夹
    addDir: function( dir ) {
        var currPath = dir;
        var toMakeUpPath = [];

        while( !fs.existsSync( currPath ) ) {
            toMakeUpPath.unshift( currPath );
            currPath = path.dirname( currPath );
        }

        toMakeUpPath.forEach( function ( pathItem ) {
            fs.mkdirSync( pathItem );
        } );
    },

    _compile: function( source ) {
        var htmlArr = source.code
            .replace(/\\/g, "\\\\")
            .replace(/\\/g, "\\/")
            .replace(/\'/g, "\\\'")
            .split('\r\n');

        var len = htmlArr.length,
            oneTab = this.getTab( 1 ),
            twoTab = this.getTab( 2 );

        var outArr = [ 
                "define( \""+ source.id +"Tpl\", [], function() {\n",
                oneTab + "return [\n"
            ];

        htmlArr.forEach( function ( value, index ) {
            if ( value ) {
                value = value.replace( /(^\s*)/g, "$1\'" );
            }
            
            if ( value ) {
                if ( index === len - 1 ) {
                    outArr.push( twoTab + value + "\'" );
                } else {
                    outArr.push( twoTab + value + "\',\n" );
                }
            } else {
                outArr.push( '\n' );
            }
        } );

        outArr.push(
            "\n",
            oneTab + "].join( '' );\n",
            "} );"
        );

        return outArr.join( '' );
    },

    /**
     * 文件与路径筛选器
     * @param   {String}    绝对路径
     * @return  {Boolean}
     */
    filter: function( file ) {
        if ( fs.existsSync( file ) ) {

            var stat = fs.statSync( file );
            if ( stat.isDirectory() ) {
                
                var dirs = file.split( '/' );
                var basedir = dirs[ dirs.length - 1 ];
                
                return this.filterBasename( basedir ) ? true : false;
            } else {

                return this.filterBasename( path.basename( file ) )
                && this.filterExtname( path.extname( file ) );
            }

        } else {
            return false;
        }
    },

    _toId: function ( file ) {
        var extname = path.extname( file ),
            basename = path.basename( file );

        return basename.replace( extname, '' );
    },

    getTab: function( num ) {
        var space = num * 4,
            output = '';

        for ( var i = 0; i < space; i++ ) {
            output += '%20'
        }

        return decodeURIComponent( output );
    },

    /**
     * 对象合并，返回合并后的对象
     * 支持深度合并
     */
    extend: function( targetObj, configObj ) {
        for ( var key in configObj ) {
            if ( targetObj[ key ] != configObj[ key ] ) {
                if ( typeof configObj[ key ] == 'object' ) {
                    targetObj[ key ] = extend( targetObj[ key ], configObj[ key ] );
                } else {
                    targetObj[ key ] = configObj[  key ]
                }
            }
        }

        return targetObj;
    },

    log: function ( message ) {
        stdout( message );
    },
};

module.exports = Html2js;

