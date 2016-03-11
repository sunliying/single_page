/*
 * spa.shell.js
 * shell module for spa
 * author sunly
 */
/*
	"eqeqeq": true,   "curly": true,
	"devel": true,    "newcap": true,	
	"white": true,    "browser": true,
	"nomen": true
 */
/*global $ spa */
spa.shell = (function(){
//--------begin module scope variables------
	var 
	configMap = {
		anchor_schema_map: {
			state: {open:true,closed:true}
		},
		main_html : String()
		+ '<div class="spa-shell-head">'
			+ '<div class="spa-shell-head-logo"></div>'
			+ '<div class="spa-shell-head-login"></div>'
			+ '<div class="spa-shell-head-search"></div>'
		+ '</div>'
		+ '<div class="spa-shell-main">'
			+ '<div class="spa-shell-main-nav"></div>'
			+ '<div class="spa-shell-main-content"></div>'
		+ '</div>'
		+ '<div class="spa-shell-foot"></div>'
		+ '<div class="spa-shell-chat"></div>'
		+ '<div class="spa-shell-modal"></div>',
		// chatBox initConfigeration
		chat_extend_time     :1000,
		chat_retract_time    :300,
		chat_extend_height   :400,
		chat_retract_height  :20,
		chat_extend_title    :'click to retract',
		chat_retract_title   :'click to extend'
	},
	stateMap = { 	
		$container : null ,
		is_chat_retracted: true,
		anchor_map: {}
	},
	jqueryMap = {},
	setJqueryMap, initModule, toggleChat,copyAnchorMap,changeAnchor,onAnchorChange;
//--------end module scope variables------------

//--------begin utility methods---------
//     	name: copyAnchorMap
//		purpose: copy another anchor_map
copyAnchorMap = function(){
	return $.extend(true,{},stateMap.anchor_map);
};
//--------end utility methods--------

//---------begin DOM methods-------
//name: setJqueryMap
//purpose: record the jquery varibles
//argus: none
//return: none
setJqueryMap = function(){
	var $container = stateMap.$container;
	jqueryMap = { 
		$container : $container,
		$chat: $container.find('.spa-shell-chat')
		 };
};
//name: toggleChat
//purpose: toggle the chat state by the argument it rescived
//argu: a boolean value
//return a boolean value
toggleChat = function (do_extend){
	var 
	chat_height = jqueryMap.$chat.height();
	if (do_extend) {
		jqueryMap.$chat.animate(
			{height: configMap.chat_extend_height},
			configMap.chat_extend_time,
			function(){
				jqueryMap.$chat.attr(
					  'title',configMap.chat_extend_title
					);
				stateMap.is_chat_retracted = false;
			}
			);
		return true;
	}
	jqueryMap.$chat.animate(
	{height: configMap.chat_retract_height},
	configMap.chat_retract_time,
	function(){
		jqueryMap.$chat.attr(
			  'title',configMap.chat_retract_title
			);
		stateMap.is_chat_retracted = true;
	}
	);
	return true;	
	
};
//name: changeAnchor
changeAnchor = function(an_map){
	var 
	  anchor_map_copy = copyAnchorMap(),
	  bool_return = true,
	  key_name;

	for(key_name in an_map){
		if (an_map.hasOwnProperty(key_name)) {
			anchor_map_copy[key_name] = an_map[key_name];
		}
	}

	try{
		$.uriAnchor.setAnchor(anchor_map_copy);
	}catch( error ){
		$.uriAnchor.setAnchor(stateMap.anchor_map,null,true);
		bool_return = false;
	}
	return bool_return;
};
onHashchange = function(){
	var pre_anchor = copyAnchorMap(),
		now_anchor,
		is_pre_chat;
	try{
		now_anchor = $.uriAnchor.makeAnchorMap();
	}catch(error){
		$.uroAnchor.setAnchor(pre_anchor,null,true);
		return false;
	}
	stateMap.anchor_map = now_anchor;
	if (!now_anchor.state) {
		toggleChat(false);
	}
	console.log(now_anchor,pre_anchor);
		switch(now_anchor.state){
			case 'open': toggleChat(true); break;
			case 'closed' : toggleChat( false);break;
			defalt:  toggleChat(false);
			delete now_anchor.state;
			$.uriAnchor.SetAnchor(now_anchor);
		}
	
	return false;
};
//---------end DOM methods---------

//---------begin event handlers-----------
//name: onClickChat
//purpose: change the anchor and chat status when it is clicked
//argu: none
//return : false to prevent browser defalt event
onClickChat = function(){
	// avoid unusual refresh
	if (stateMap.is_chat_retracted&&($.uriAnchor.makeAnchorMap()).state==='open') {
		toggleChat(true);
		return ;
	}
	changeAnchor({
		state:(stateMap.is_chat_retracted?'open':'closed')
	});
	return false;
	
};
//-----------end event handlers---------

//---------begin public methods-------
//name: initModule
//purpose: initialize the page
//argu: a DOM node
initModule = function ($container){
	$.uriAnchor.configModule({
		schema_map: configMap.anchor_schema_map
	});
	stateMap.$container = $container;
	$container.html( configMap.main_html );
	setJqueryMap();
	//config and initialize chat module
	spa.chat.configModule({});
	spa.chat.initModule(jqueryMap.$chat);
	
	stateMap.is_chat_retracted = true;
	jqueryMap.$chat
		.attr('title',configMap.chat_retract_title)
		.click( onClickChat );
	$(window).bind('hashchange',onHashchange).trigger('hashChange');
	return true;
};
//-----------end public methods--------

//----------return-------------
return { initModule: initModule };
}());


