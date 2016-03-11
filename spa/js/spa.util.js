/*
 * nameSpace: spa.util.js
 * general javaScript utilities
 */
 /*global $ spa*/
 spa.util = (function(){
 	var makeError,setConfigMap;
 	//name: makeError
 	//purpose: create an error object
 	//arguments: name, message, data
 	//return: an error object
 	makeError = function(name,mes,data){
 		var error = new Error();
 		error.name = name;
 		error.message = mes;
 		if (data){
 			error.data = data;
 		}
 		return error;
 	};
 	//name: setConfigMap
 	//purpose : commen code to set config for future modules
 	//argument: an config object contains : input_map, settable_map , config_map
 	//return: true
 	setConfigMap = function(arg_map){
 		var 
 		input_map = arg_map.input_map,
 		settable_map = arg_map.settable_map,
 		config_map = arg_map.config_map,
 		key_name,error;
 		for(key_name in input_map){
 			if (input_map.hasOwnProperty(key_name)){
 				if (settable_map.hasOwnProperty(key_name)) {
 					config_map[key_name] = input_map[key_name];
 				}else{
 					error = makeError('Bad input','setting config key:'+key_name+'|is not suported');
 					throw error;
 				}
 			}
 		}

 	};
 	return {
 		makeError: makeError,
 		setConfigMap: setConfigMap
 	};
 })();