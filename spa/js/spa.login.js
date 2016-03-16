/*
* spa.login.js
* login module
*/
/*global $ spa*/
spa.login = (function(){
	'use strict';
	//-----------------BEGIN MODULE SCOPE VARIABLES--------------
	var configMap = {
		login_html: String()
		+'<div class="spa-login-page">'
		+'	<div class="spa-login-title">'
		+'		<h4>please sign in first</h4>'
		+'	</div>'
		+'	<form>'
		+'		<div class="spa-login-name">'
		+'			<label>your name:</label>'
		+'			<input type="text" placeholder="Sunly"></input>'
		+'		</div>'
		+'      <p class="spa-login-warning"></p>'
		+'		<div class="spa-login-button">'
		+'			<input class="spa-login-ok" type="submit" value="OK"></input>'
		+'			<input class="spa-login-cancel" type="button" value="CANCLE"></input>'
		+'		</div>'
		+'	</form>'
		+'</div>'
	},
	stateMap = {
		$append_target: null
	},
	jqueryMap = {},
	onTapLogin,onCancel,onShow,initModule,setJqueryMap;
	//-------------------END MODULE SCOPE VARIABLES-------------
	//-------------------BEGIN DOM METHODS-------------------
	setJqueryMap = function(){
		var $append_target = stateMap.$append_target,
			$acct = $append_target.find('.spa-shell-head-login'),
			$login = $append_target.find('.spa-login-page');
		jqueryMap = {
			$acct: $acct,
			$login: $login,
			$input: $login.find('.spa-login-name input[type="button"]'),
			$ok : $login.find('.spa-login-ok'),
			$cancel: $login.find('.spa-login-cancel'),
			$warn: $login.find('.spa-login-warning')
		};	
	};
	onTapLogin = function(event){
		var user = spa.model.people.get_user(),
			user_name,acct_text;
		user_name= 'sunliying' ||jqueryMap.$input.val();
		
		if(user_name === undefined || !user_name.trim()){
			jqueryMap.$ok.attr('disabled',true);
			jqueryMap.$warn.text('name is required');
			return false;
		}
		if (user.get_is_anon) {
			spa.model.people.login(user_name);
			console.log(user_name);
			acct_text = '...processing...';
			jqueryMap.$acct.text(acct_text);
		}else{
			spa.model.people.logout();
		}
		jqueryMap.$login.css({display: 'none'});
		return false;
	};
	onCancel = function(){
		console.log(jqueryMap.$login);
		jqueryMap.$login.css({display: 'none'});
	};
	onShow = function(){
		jqueryMap.$login.css({display: 'block'});	
		console.log(jqueryMap.$login);
	};
	//-------------------END DOM METHODS-------------
	//-------------------BEGIN PUBLIC METHODS-------------------
	initModule = function($append_target){
		$append_target.append(configMap.login_html);
		stateMap.$append_target = $append_target;
		setJqueryMap();
		jqueryMap.$login.css({display:'none'});
		jqueryMap.$acct.bind('click',onShow);
		console.log(jqueryMap.$acct);
		jqueryMap.$cancel.bind('click',onCancel);
		jqueryMap.$ok.bind('click',onTapLogin);
	};
	//--------------------END PUBLIC METHODS--------------------
	return {
		initModule: initModule
	};
})();