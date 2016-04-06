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
 	'use strict';
	var initModule = function ( $container ){
		spa.data.initModule();
		spa.model.initModule();
		spa.shell.initModule( $container ) ;
	};
	return { initModule: initModule };
}());
