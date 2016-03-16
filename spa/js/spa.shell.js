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
	'use strict';
//--------begin module scope variables------
	var 
	configMap = {
		anchor_schema_map: {
			state: {open:true,closed:true}
		},
		main_html : String()
		+ '<div class="spa-shell-head">'
			+ '<div class="spa-shell-head-logo">'
				+'<h1>SPA</h1>'
				+'<p>What is the meaning of life?</p>'
			+'</div>'
			+ '<div class="spa-shell-head-login"></div>'
		+ '</div>'
		+ '<div class="spa-shell-main">'
			+ '<div class="spa-shell-main-nav"></div>'
			+ '<div class="spa-shell-main-content"></div>'
		+ '</div>'
		+ '<div class="spa-shell-foot"></div>',
		resize_interval: 200
	},
	stateMap = { 
		$container: null,
		resize_idto: undefined,	
		anchor_map: {},
		canChat: true
	},
	jqueryMap = {},
	setJqueryMap, initModule,copyAnchorMap,changeAnchor,
	onResize,onHashchange,setChatAnchor,
	onLogin,onLogout,onTapAcct;
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
		$acct: $container.find('.spa-shell-head-login'),
		$nav: $container.find('.spa-shell-main-nav')
		 };
};
//name: changeAnchor
//purpose : chang the anchor 
//arguments: an object that contains the anchor part you want to set
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
//name: onTapAcct
// onTapAcct = function(event){
// 	var user = spa.model.people.get_user(),
// 		user_name,acct_text;
// 		spa.login.pop_box.css({display: 'none'});
// 	if (user.get_is_anon) {
// 		if(!spa.login.login()){
// 			user_name = spa.login.login();
// 			spa.model.people.login(user_name);
// 			acct_text = '...processing...';
// 			jqueryMap.$acct.text(acct_text);
// 		}
// 	}else{
// 		spa.model.people.logout();
// 	}
// 	return false;
// };
// name: onLogin
onLogin = function(event,login_user){
	jqueryMap.$acct.text(login_user.name);
};
// name: onLogout
onLogout = function(event,logout_user){
	jqueryMap.$acct.text('Please Sign-in');
};
//---------end DOM methods---------

//---------begin event handlers-----------
// name: onHanshchange
//purpose: handle the hashchange event
onHashchange = function(event){
	var pre_anchor = copyAnchorMap(),
		now_anchor,
		is_ok = true,
		is_pre_chat;

	// try{
		now_anchor = $.uriAnchor.makeAnchorMap();
	// }catch(error){
	// 	$.uriAnchor.setAnchor(pre_anchor,null,true);
	// 	return false;
	// }
	stateMap.anchor_map = now_anchor;
	if (!now_anchor.state) {

		spa.chat.setSliderPosition('closed');	
	}
	switch(now_anchor.state){
		case 'open': 
			is_ok = spa.chat.setSliderPosition('open');
			break;
		case 'closed' : 
			is_ok = spa.chat.setSliderPosition('closed');
			break;
		defalt:  
			spa.chat.setSliderPosition('closed');
			delete now_anchor.state;
			$.uriAnchor.SetAnchor(now_anchor,null,true);
	}
	if (!is_ok){
		if(pre_anchor){
			$.uriAnchor.setAnchor(pre_anchor,null,true);
			stateMap.anchor_map = pre_anchor;
		}else{
			delete now_anchor.state;
			$.uriAnchor.SetAnchor(now_anchor,null,true);
		}
	}		
	return false;
};
//-----------end event handlers---------

//------------BEGIN CALLBANCKS-----------
// name: setChatAnchor
//purpose: return the changeAnchor function
setChatAnchor = function(slide_position){
		changeAnchor({state: slide_position});
};
//name: onResize
onResize = function(){
	if (stateMap.resize_idto) {
		return true;
	}
	spa.chat.handleResize();
	stateMap.resize_idto = setTimeout(function(){
		stateMap.resize_idto = undefined;
	}, configMap.resize_interval);
};
//------------END CALLBACKS-------------
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
	if(stateMap.canChat){
		//config and initialize chat module
		spa.chat.configModule({
			set_chat_anchor: setChatAnchor
			// chat_people_model: spa.model.people,
			// chat_model: spa.model.chat
		});
		spa.chat.initModule(jqueryMap.$container);
		//init login module
	}
	spa.login.initModule(jqueryMap.$container);
	
	$.gevent.subscribe($container,'spa-login',onLogin);
	$.gevent.subscribe($container,'spa-logout',onLogout);
	jqueryMap.$acct.text('Please Sign-in');
	// .bind('utab',onTapAcct);

	$(window)
	.bind('resize',onResize)
	.bind('hashchange',onHashchange)
	.trigger('hashChange');
	return true;
};
//-----------end public methods--------

//----------return-------------
return { initModule: initModule };
}());


