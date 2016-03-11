/*
* spa.chat.js
* chat moudle for spa
*/
/*global $ spa */
spa.chat = (function(){
	//---------------BEGIN MODULE SCOPE VARIABLES-------------
	var configMap = {
		main_html: String()
		+'<div class="mean"> What\'s the meaning of life???</div>'
	} ,
	jqueryMap = {},
	stateMap = { $container : null},
	initModule,setJqueryMap,configModule;
	//---------------END MODULE SCOPE VARIABLES----------------
	//---------------BEGIN DOM METHODS------------------------
	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {
			$container:$container
		};
	};
	//---------------END DOM METHODS--------------------------
	//--------------BEGIN PUBLIC METHODS----------------------
	//name: configModule
	//purpose: adjust configuration of allowed keys
	//arguments: an input_map object
	//return true
	configModule = function(input_map){
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			configMap: configMap
		});
		return true;
	};
	initModule = function($container){
		$container.html(configMap.main_html);
		stateMap.$container = $container;
		setJqueryMap();
		return true;
	};
	//---------------END PUBLIC METHODS-------------------------
	return {
		configModule: configModule,
		initModule: initModule
	};
})();