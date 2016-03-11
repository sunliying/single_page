/*
 * spa.js
 * root namespace module
 * author sunly
 */
 /*
	"eqeqeq": true,   "curly": true,
	"devel": true,    "newcap": true,	
	"white": true,    "browser": true,
	"nomen": true
 */
/*global $ spa */
 var spa = (function(){
	var initModule = function ( $container ){
		spa.shell.initModule( $container ) ;
	};
	return { initModule: initModule };
}());
