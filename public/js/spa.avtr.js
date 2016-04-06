/*
* spa.avtr.js
* avtr module
*/
/*global $ spa */
spa.avtr = (function(){
	'use strict';
	var configMap = {
		settable_map :{
			chat_model: true,
			people_model: true
		},
		chat_model: null,
		people_model: null
	},
	stateMap = {
		startX :0, 
		startY : 0, 
		x : 0, 
		y : 0,
		$element: null
	},
	jqueryMap ={},
	getRandomColor,setJqueryMap,onTapNav,changeAvatr,
	onDrag,onListchange,onLogout,
	onSetchat,mouseup,mousemove,
	configModule,initModule;
	//-------------utility module----------
	getRandomColor = function(){
		var i,list_color;
		list_color = [];
		for (i = 0; i < 3; i++) {
			list_color.push(Math.floor(Math.random()*256));
		}
		return 'rgb('+list_color.join(',')+')';
	};
	//--------------end utility module------------
	//--------------begin dom module------------
	setJqueryMap = function($container){
		jqueryMap = {
			$container: $container,
			$document : $(document)
		};
	};
	changeAvatr = function($target){
		var id,css_map,avatar_map;
		id = $target.attr('data_id');
		css_map = {
			top: parseInt($target.css('top'),10),
			left: parseInt($target.css('left'),10),
			'background-color': $target.css('backgroundColor')
		};
		avatar_map = {
			person_id: id,
			css_map: css_map
		};
		configMap.chat_model.update_avatar(avatar_map);
	};

    mousemove=function (event) {
    	var $element = stateMap.$element;
    	console.log($element.css('top'),$element.css('left'));
        stateMap.x = event.pageX - stateMap.startX;
        stateMap.y = event.pageY - stateMap.startY;
        $element.css({
            top: stateMap.y + 'px',
            left: stateMap.x + 'px'
        });
    };

    mouseup=function (event) {
    	var $document=jqueryMap.$document;
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        changeAvatr(stateMap.$element);
    };
	//--------------end dom module--------------
	//----------------begin event handeler------------
	onDrag = function(event){
		//值传递出现问题
		var $document=jqueryMap.$document,
			$element = $(event.target).closest('.spa-avtr-box');
		if ($element.length === 0) {
			return false;
		}
		stateMap.$element = $element;
		stateMap.x = parseInt($element.css('left'));
		stateMap.y = parseInt($element.css('top'));
		event.preventDefault();
        stateMap.startX = event.pageX - stateMap.x;
        stateMap.startY = event.pageY - stateMap.y;
        console.log(event.pageX,event.pageY);
        $document.bind('mousemove', mousemove);
        $document.bind('mouseup', mouseup);
	};
	onTapNav = function(event){
		var $target = $(event.target).closest('.spa-avtr-box');

		if ($target.length===0) {return false;}
		$target.css('backgroundColor',getRandomColor());
		changeAvatr($target);
	};
	onSetchat = function(event,arg_map){
		var new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee,
			$nav = jqueryMap.$container;
			if (old_chatee) {
				$nav.find('.spa-avtr-box[data_id='+old_chatee.id+']')
				.removeClass('spa-avtr-chatee');
			}
			if (new_chatee) {
				$nav.find('.spa-avtr-box[data_id='+new_chatee.id+']')
				.addClass('spa-avtr-chatee');
			}
	};
	onListchange = function(event){
		var people_db = configMap.people_model.get_db(),
			chatee = configMap.chat_model.get_chatee(),
			user = configMap.people_model.get_user(),
			$box,
			$nav = jqueryMap.$container;

		$nav.empty();
		people_db().each(function(person,index){
			var class_list = [];
			if(person.get_is_anon()){
				return true;
			}
			if (person.get_is_user()) {
				class_list.push('spa-avtr-user');
			}
			if (chatee&&chatee.id === person.id) {
				class_list.push('spa-avtr-chatee');
			}
			class_list.push('spa-avtr-box');
			$box = $('<div></div>');
			$box.addClass(class_list.join(' '))
			.attr('data_id',person.id)
			.prop('title',spa.util_b.encodeHtml(person.name))
			.css(person.css_map)
			.text(person.name);
			$nav.append($box);
		});
	};
	onLogout = function(event){
		jqueryMap.$container.empty();
	};
	//-----------------end event handeler--------------
	configModule = function(input_map){
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};	
	initModule = function($container){
		setJqueryMap($container);
		$.gevent.subscribe($container,'spa-listchange',onListchange);
		$.gevent.subscribe($container,'spa-logout',onLogout);
		$.gevent.subscribe($container,'spa-setchateeAvtr',onSetchat);

		$container
		.bind('click',onTapNav)
		.bind('mousedown',onDrag);
	};
	return{
		configModule: configModule,
		initModule: initModule
	};
})();