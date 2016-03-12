/*
* spa.chat.js
* chat moudle for spa
*/
/*global $ spa getComputedStyle*/
spa.chat = (function(){
	//---------------BEGIN MODULE SCOPE VARIABLES-------------
	var configMap = {
		main_html: String()                                                   
		+'	<div class="spa-chat">                                       '                                    
		+'		<div class="spa-chat-head">'
		+'			<div class="spa-chat-head-title">my chat box</div>'
		+'			<div class="spa-chat-head-toggle">=</div>'
		+'		</div>'
		+'		<div class="spa-chat-closer">#</div>'
		+'		<div class="spa-chat-sizer">'
		+'			<div class="spa-chat-message"></div>'
		+'			<div class="spa-chat-box">'
		+'				<input type="text"></input>'
		+'				<input type="button" value="send"></input>'
		+'			</div>'
		+'		</div>'
		+'	</div>',
		settable_map: {
			chat_open_height_em: true,
			chat_closed_height_em: true,
			chat_open_time: true,
			chat_closed_time: true,
			chat_closed_title: true,
			chat_open_title: true,

			chat_modle: null,
			chat_peoele_model: null,
			set_chat_anchor: null
		},
		chat_open_height_em: 16,
		chat_closed_height_em: 2,

		chat_open_height_min_em: 10,
		window_chat_height_min_em: 20,
		chat_open_time: 250,
		chat_closed_time: 250,
		chat_closed_title: 'click to open',
		chat_open_title: 'click to close',
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
	initModule,setJqueryMap,configModule,setSliderPosition,getEmSize,
	setPxSizes,onClickToggle,removeSlider,handleResize;
	//---------------END MODULE SCOPE VARIABLES----------------
	//----------------BEGIN UTILITY MODULE-----------------------
	//name: getEmSize
	// purpose: make em to px
	getEmSize = function(elem){
		return Number(
			getComputedStyle(elem,'').fontSize.match(/\d*\.?\d*/)[0]
			);
	};
	//----------------END UTILITY MODULE-------------------------
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
			$message: $slider.find('.spa-chat-message'),
			$input: $slider.find('.sap-chat-box input[type="text"]')
		};
	};
	//name: setPxSizes
	//purpose: change the stateMap's properties acordding to configMap's em-properties 
	//         and config the spa-chat-sizer's height
	setPxSizes = function(){
		var px_per_em,open_height,window_height_em;
		px_per_em = getEmSize(jqueryMap.$slider.get(0));
		window_height_em = Math.floor(
			( $(window).height() / px_per_em)+0.5
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
		if(position_type===stateMap.slide_position){

			return true;
		}
		switch(position_type){
			case 'open':
				height = stateMap.chat_open_height_px;
				title = configMap.chat_open_title;
				time = configMap.chat_open_time;
				text = '=';
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
	//---------------END DOM METHODS--------------------------
	//---------------BEGIN EVNET HANDLERS--------------------
	//name : onClickToggle
	//purpose: change the uriAnchor when click the button,it trigger the set_chat_anchor function
	onClickToggle = function(event){
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

		configMap.chat_peoele_model = null;
		configMap.chat_modle = null;
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
		$append_target.append(configMap.main_html);
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();

		jqueryMap.$head.prop('title',configMap.chat_closed_title);
		stateMap.slide_position = 'closed';
		jqueryMap.$head.click(onClickToggle);
		return true;
	};
	//---------------END PUBLIC METHODS-------------------------
	return {
		configModule: configModule,
		initModule: initModule,
		setSliderPosition: setSliderPosition,
		removeSlider: removeSlider,
		handleResize: handleResize
	};
})();