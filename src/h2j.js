/*!
 * h2j
 * author: zhangchen2397@126.com
 * https://github.com/zhangchen2397/h2j
 * 将html模块自动转化为模块化的js代码
 */

'use strict';

var stdout = require( './stdout.js' );
var watch = require( './watch.js' );
var path = require( './path.js' );

var fs = require( 'fs' );
var events = require( 'events' );

var h2j = function( config ) {

    this.defaultConf = {
        //需要转化的模板路径，默认为当前执行目录
        basePath: './',

        //转化为js代码的产出目录，默认为当前执行目录的output目录下
        output: './des',

        /* 转化为模块化代码的类型，默认为amd
         *   - amd: amd模范
         *   - cmd: cmd模范
         */
        modType: 'amd',

        /* 字符串拼接类型 
         * [数组(array)|加(plus)]与[单(single)|双(double)引号]排列组件
         *   - as: 数组与单引号
         *   - ad: 数组与双引号
         *   - ps: 字符串与单引号
         *   - pd: 字符串与单引号
         */   
        strType: 'as',

        //转化js后的模块名后缀
        suffix: 'Tpl',

        //转化后js编码方式，默认为utf-8
        charset: 'utf-8'
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

h2j.prototype = {
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
        var me = this,
            config = this.config,
            htmlArr = [],
            modType = config.modType,
            strType = config.strType.split( '' ),
            qType = '',
            outArr = [],
            returnStart = '',
            returnEnd = '';

        var oneTab = this.getTab( 1 ),
            twoTab = this.getTab( 2 );

        if ( strType[ 1 ] == 'd' ) {
            htmlArr = source.code
                .replace( /\\/g, "\\\\" )
                .replace( /\\/g, "\\/" )
                .replace( /\'/g, "\\\'" )
                .replace( /\"/g, "\\\"" )
                .split( '\r\n' );

            qType = '\"';

        } else {
            htmlArr = source.code
                .replace( /\\/g, "\\\\" )
                .replace( /\\/g, "\\/" )
                .replace( /\'/g, "\\\'" )
                .split( '\r\n' );

            qType = '\'';
        }

        var len = htmlArr.length;

        if ( strType[ 0 ] == 'p' ) {
            returnStart = oneTab + "return (\n";
            returnEnd = oneTab + ");\n";
        } else {
            returnStart = oneTab + "return [\n";
            returnEnd = oneTab + "].join( '' );\n";
        }

        if ( modType == 'amd' ) {
            outArr = [
                "define( \"" + source.id + "Tpl\", [], function() {\n",
                returnStart
            ];
        } else {
            outArr = [
                "define( \"" + source.id + "Tpl\", [], function( require, exports, module ) {\n",
                returnStart
            ];
        }

        if ( strType[ 0 ] == 'p' ) {
            htmlArr.forEach( function ( value, index ) {
                if ( value ) {
                    value = value.replace( /(^\s*)/g, "$1" + qType );
                }
                
                if ( value ) {
                    if ( index === len - 1 ) {
                        outArr.push( twoTab + value + qType );
                    } else {
                        outArr.push( twoTab + value + qType + "+\n" );
                    }
                } else {
                    outArr.push( '\n' );
                }
            } );
        } else {
            htmlArr.forEach( function ( value, index ) {
                if ( value ) {
                    value = value.replace( /(^\s*)/g, "$1" + qType );
                }
                
                if ( value ) {
                    if ( index === len - 1 ) {
                        outArr.push( twoTab + value + qType );
                    } else {
                        outArr.push( twoTab + value + qType + ",\n" );
                    }
                } else {
                    outArr.push( '\n' );
                }
            } );
        }

        outArr.push(
            "\n",
            returnEnd,
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
        var extname = path.extname( file );
        var id = file.replace( this.basePath + '/', '' ).replace( extname, '' );
        return id;
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

module.exports = h2j;

