/*
* spa.chat.js
* chat moudle for spa
*/
/*global $ spa*/
spa.chat = (function(){
	'use strict';
	//---------------BEGIN MODULE SCOPE VARIABLES-------------
	var configMap = {
		main_html: String()                                                   
		+'	<div class="spa-chat">                                       '                                    
		+'		<div class="spa-chat-head">'
		+'			<div class="spa-chat-head-title">my chat box</div>'
		+'			<div class="spa-chat-head-toggle">+</div>'
		+'		</div>'
		+'		<div class="spa-chat-closer">X</div>'
		+'		<div class="spa-chat-sizer">'
		+'          <div class = "spa-chat-list">'
		+'              <div class="spa-chat-list-box"></div>'
		+'          </div>'
		+'			<div class="spa-chat-msg">'
		+'              <div class="spa-chat-msg-log">'
		+				'</div>'
		+'              <div class="spa-chat-msg-in">'
		+'					<form class="spa-chat-msg-form">'
		+'						<input type="text"></input>'
		// +'                      <input type="submit" style = "display: none">'
		+'						<div class="spa-chat-msg-send" value="send">send</div>'
		+'					</form>'
		+'				</div>'
		+'          </div>'
		+'		</div>'
		+'	</div>',
		settable_map: {
			chat_open_height_em: true,
			chat_closed_height_em: true,
			chat_open_time: true,
			chat_closed_time: true,
			chat_closed_title: true,
			chat_open_title: true,

			chat_model: null,
			people_model: null,
			set_chat_anchor: null
		},
		chat_open_height_em: 16,
		chat_closed_height_em: 2,

		chat_open_height_min_em: 10,
		window_chat_height_min_em: 20,
		chat_open_time: 250,
		chat_closed_time: 250,
		chat_closed_title: 'tap to open',
		chat_open_title: 'tap to close',
		chat_model: null,
		people_model: null,
		set_chat_anchor: null
	} ,
	jqueryMap = {},
	stateMap = { 
		$append_target_: null,
		slide_position: 'closed',
		px_per_em: 0,
		chat_open_height_px: 0,
		chat_closed_height_px: 0,
		chat_hidden_height_px: 0
	},
	initModule,setJqueryMap,configModule,setSliderPosition,
	scollChat,writeChat,writeAlert,clearChat,
	setPxSizes,removeSlider,handleResize,
	onTapToggle,onSubmitMsg,onTapList,onSetchatee,onUpdatechat,
	onListchange,onLogin,onLogout;
	//---------------END MODULE SCOPE VARIABLES----------------
	//---------------BEGIN DOM METHODS------------------------
	setJqueryMap = function(){
		var $append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');
		jqueryMap = {
			$slider: $slider,
			$head: $slider.find('.spa-chat-head'),
			$toggle: $slider.find('.spa-chat-head-toggle'),
			$title: $slider.find('.spa-chat-head-title'),
			$closer: $slider.find('.spa-chat-closer'),
			$sizer: $slider.find('.spa-chat-sizer'),
			$listbox: $slider.find('.spa-chat-list-box'),
			$msglog: $slider.find('.spa-chat-msg-log'),
			$msgin: $slider.find('.spa-chat-msg-in'),
			$input: $slider.find('.spa-chat-msg-in input[type="text"]'),
			$form: $slider.find('.spa-chat-msg-form'),
			$send: $slider.find('.spa-chat-msg-send'),
			$window: $(window)
		};
	};
	//name: setPxSizes
	//purpose: change the stateMap's properties acordding to configMap's em-properties 
	//         and config the spa-chat-sizer's height
	setPxSizes = function(){
		var px_per_em,open_height,window_height_em;
		px_per_em = spa.util_b.getEmSize(jqueryMap.$slider.get(0));
		window_height_em = Math.floor(
			( jqueryMap.$window.height() / px_per_em)+0.5
			);
		open_height = (window_height_em> configMap.window_chat_height_min_em)?
					configMap.chat_open_height_em:configMap.chat_open_height_min_em;
		stateMap.px_per_em = px_per_em;
		stateMap.chat_closed_height_px = configMap.chat_closed_height_em*px_per_em;
		stateMap.chat_open_height_px = open_height*px_per_em;
		jqueryMap.$sizer.css({
			height: (open_height - 2)*px_per_em
		});
	};

	//name: setSliderPosition
	//purpose: change the chat box's state according to the argument position_type
	//argument: position_type
	//return : true
	setSliderPosition = function(position_type){
		var title,height,text,time;
		if (position_type === 'open' && configMap.people_model.get_user().get_is_anon()) {
				return false;
			}
		if(position_type===stateMap.slide_position){
			if (position_type === 'open') {
				jqueryMap.$input.focus();
			}
			return true;
		}
		switch(position_type){
			case 'open':
				height = stateMap.chat_open_height_px;
				title = configMap.chat_open_title;
				time = configMap.chat_open_time;
				text = '=';
				jqueryMap.$input.focus();
				break;
			case 'closed':
				height = stateMap.chat_closed_height_px;
				title = configMap.chat_closed_title;
				time = configMap.chat_closed_time;
				text = '+';
				break;
			case 'hidden':
				height = stateMap.chat_hidden_height_px;
				time = configMap.chat_closed_time;
				title = '';
				text = '+';
				break;
			defalt: 
				return false;
		}
		jqueryMap.$slider.animate(
			{height:height},time,function(){
				jqueryMap.$toggle.text(text);
				jqueryMap.$toggle.prop('title',title);
				stateMap.slide_position = position_type;
				// if (callback) {
				// 	callback(jqueryMap.$slider);
				// }
			});
		return true;
	} ;
	scollChat = function(){
		var $msg_log = jqueryMap.$msglog;
		$msg_log.animate({
			scrollTop: $msg_log.prop('scrollHeight')-$msg_log.height()
		},150);
	};
	writeChat = function(person_name,text,is_user){
		var msg_class = is_user? 'spa-chat-msg-log-me':'spa-chat-msg-log-msg';
		jqueryMap.$msglog.append(
			'<div class="'+msg_class+'">'
			+spa.util_b.encodeHtml(person_name)+':'
			+spa.util_b.encodeHtml(text)+'</div>'
			);
			
		scollChat();
	};
	writeAlert = function(alert_text){
		jqueryMap.$msglog.append(
			'<div class="spa-chat-msg-log-alert">'
			+spa.util_b.encodeHtml(alert_text)+'</div>'
			);
		scollChat();
	};
	clearChat = function(){
		jqueryMap.$msglog.empty();
	};
	//---------------END DOM METHODS--------------------------
	//---------------BEGIN EVNET HANDLERS--------------------
	//name : onTapToggle
	//purpose: change the uriAnchor when click the button,it trigger the set_chat_anchor function
	onTapToggle = function(event){
		// avoid brower refresh,it's a hack
		if (stateMap.slide_position==='closed'&&$.uriAnchor.makeAnchorMap().state ==='open') {
			$.uriAnchor.setAnchor({state:'closed'});
			configMap.set_chat_anchor('open');
		}
		if (stateMap.slide_position === 'open') {
			configMap.set_chat_anchor('closed');
		}else if(stateMap.slide_position==='closed'){
			configMap.set_chat_anchor('open');
		}
		return false;
	};
	onSubmitMsg = function(event){
		var msg_text = jqueryMap.$input.val();
		if (msg_text.trim() === '') {
			return false;
		}
		configMap.chat_model.send_mes(msg_text);
		jqueryMap.$input.focus();
		jqueryMap.$send.addClass('spa-x-select');
		setTimeout(function(){
			jqueryMap.$send.removeClass('spa-x-select');
		},250);
		return false;
	};
	onTapList = function(event){
		var $tapped = $(this),chatee_id;
		console.log($tapped);
		if (! $tapped.hasClass('spa-chat-list-name')) {
			return false;
		}
		chatee_id = $tapped.attr('data-id');
		if (!chatee_id) {return false;}
		configMap.chat_model.set_chatee(chatee_id);
		return false;
	};
	onSetchatee = function(event,arg_map){
		var new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;
			jqueryMap.$input.focus();
			if (!new_chatee) {
				if (old_chatee) {
					writeAlert(old_chatee+'has left the chat');
				}else{
					writeAlert('Your friend is left the chat');
				}
				jqueryMap.$title.text('Chat');
				return false;
			}
			jqueryMap.$people_name
			.removeClass('spa-x-select')
			.end()
			.find('[data-id='+ arg_map.new_chatee.id+']')
			.addClass('spa-x-select');
			writeAlert('now chatting with '+arg_map.new_chatee.name);
			jqueryMap.$title.text('chatting with '+arg_map.new_chatee.name);
			return true;
	};
	onListchange = function(event){
		var list_html = String(),
			people_db = configMap.people_model.get_db(),
			chatee = configMap.chat_model.get_chatee();
		people_db().each(function(person,index){
			var select_class = '';
			if(person.get_is_anon()||person.get_is_user()){
				return true;
			}
			if (chatee&&chatee.id === person.id) {
				select_class = 'spa-x-select';
			}
			list_html+=
			'<div class="spa-chat-list-name '
			+select_class+'" data-id="'+person.id 
			+'">'+spa.util_b.encodeHtml(person.name)+'</div>';
		});
		if (!list_html) {
			list_html = String()
			+'<div class="spa-chat-list-note">'
			+'To chat alone is the fate of all great souls ... <br><br>'
			+'no one is online'
			+'</div>';
			clearChat();
		}
		jqueryMap.$listbox.html(list_html);
	};
	onUpdatechat = function(event,msg_map){
		//on... 事件的第一个参数都是event
		var is_user,
			sender_id = msg_map.sender_id,
			msg_text = msg_map.meg_text,
			chatee = configMap.chat_model.get_chatee() || {},
			sender = configMap.people_model.get_cid_map()[sender_id];
			//注意这里若是从客户端写入的ID是id_05,下面生成的就是id_5
			if (!sender) {
				writeAlert(msg_text);
				return false;
			}
			is_user = sender.get_is_user();
			if (!(is_user || sender.id ===chatee.id)) {
				configMap.chat_model.set_chatee(sender_id);
			}

			writeChat(sender.name,msg_text,is_user);
			if (is_user) {
				jqueryMap.$input.val('');
				jqueryMap.$input.focus();
			}
	};
	onLogin = function(event,login_user){
		//只需要在每次login的时候才会进行listChange事件，在setChatee的时候在需要改变chatee
		//和变换样式即可
		configMap.set_chat_anchor('open');
		//在完全登录之后，要将list上的人员缓存在jQueryMap里面，否则再次点击的时候
		//使用jqueryMap.$listbox.find('spa-chat-list-name')时会找不到
		jqueryMap.$people_name = jqueryMap.$slider.find('.spa-chat-list-name');
		jqueryMap.$people_name.bind('click',onTapList);
	};
	onLogout = function(event,logout_user){
		configMap.set_chat_anchor('closed');
		jqueryMap.$title.text('Chat');
		clearChat();
	};
	//----------------END EVENT HANDLERS----------------------
	//--------------BEGIN PUBLIC METHODS----------------------
	//name: removeSlider
	//purpose: remove chatSlider DOM elements and reverse to intatial state
	removeSlider = function(){
		if(jqueryMap.$slider){
			jqueryMap.$slider.fadeOut(3000,function(){
				this.remove();
			});
			jqueryMap = {};
		}
		stateMap.slide_position = 'closed';
		stateMap.$append_target = null;

		configMap.people_model = null;
		configMap.chat_model = null;
		configMap.set_chat_anchor = null;
	};
	//name: handleResize
	//purpose: give a window resize event to make it adjust the presentation provided by this module
	handleResize = function(){
		if (!jqueryMap.$slider) {
			return true;
		}
		setPxSizes();
		if(stateMap.slide_position === 'open'){
			jqueryMap.$slider.css({height: stateMap.chat_open_height_px});
		}
		return true;
	};
	//name: configModule
	//purpose: configure the Module prior to initialize //arguments: an input_map object
	//***set_chat_anchor - a callback to modify the uri anchor to indicate open or closed state
	//                     and it will return false if the require is not meet
	//***chat_model - the chat model provides methods to interact with our instant messaging
	//***people_module 
	//***slider_*_settings
	//return true
	configModule = function(input_map){
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};
	initModule = function($append_target){
		stateMap.$append_target = $append_target;
		$append_target.append(configMap.main_html);
		setJqueryMap();
		setPxSizes();

		$.gevent.subscribe($append_target,'spa-login',onLogin);
		$.gevent.subscribe($append_target,'spa-logout',onLogout);
		$.gevent.subscribe($append_target,'spa-setchatee',onSetchatee);
		$.gevent.subscribe($append_target,'spa-updatechat',onUpdatechat);
		$.gevent.subscribe($append_target,'spa-listchange',onListchange);

		jqueryMap.$head.bind('click',onTapToggle);
		jqueryMap.$send.bind('click',onSubmitMsg);
		jqueryMap.$form.bind('submit',onSubmitMsg);

		return true;
	};
	//---------------END PUBLIC METHODS-------------------------
	return {
		configModule: configModule,
		initModule: initModule,
		setSliderPosition: setSliderPosition,
		removeSlider: removeSlider,
		handleResize: handleResize,
		onSubmitMsg:onSubmitMsg
	};
})();