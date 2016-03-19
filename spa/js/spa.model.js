/*
 * spa.module.js
 * Model module
 */
 /*global $ spa*/
 spa.model = (function(){
 	'use strict';
 	var isFakeDate = true;
 	var configMap = { anon_id: 'a0'},
 		stateMap = {
 			anon_user : null,
 			cid_serial: 0,
 			people_db: TAFFY(),
 			people_cid_map: {},
 			user: null,
			is_connect: false
 		},
 		peopleProto,people,makePerson,initModule,chat,
 		makeCid,clearPeopleDb,updateUser,removePerson;
 		//make people prototype
 		peopleProto = {
 			get_is_user :function(){
 				return this.cid === stateMap.user.cid;
 			},
 			get_is_anon : function(){
 				return this.cid ===stateMap.anon_user.cid;
 			}
 		};
 		//name: makeCid
 		//purpose: create a client id
 		makeCid = function(){
 			return "c"+String(stateMap.cid_serial++);
 		};
 		//name: clearPeopleDb
 		//purpose: clear the people db to be null except current user
 		clearPeopleDb = function(){
 			var user = stateMap.user;
 			stateMap.people_db = TAFFY();
 			stateMap.people_cid_map = {};
 			if (user) {
 				stateMap.people_cid_map[user.cid] = user;
 				stateMap.people_db.insert(user);
 			}
 		};
 		//name: updateUser
 		// purpose: to insert a user object when someone login and publish an event
 		updateUser = function(user_list){
 			
 			var user_map = user_list[0];
 			delete stateMap.people_cid_map[user_map.cid];
 			stateMap.user.id = user_map._id;
 			stateMap.user.cid = user_map._id;
 			stateMap.user.css_map = user_map.css_map;
 			// stateMap.user.name = user_map.name;
 			stateMap.people_cid_map[user_map.cid] = stateMap.user;
 			chat.join();

 			$.gevent.publish('spa-login',[stateMap.user]);
 		};
 		//create a constructor
 		makePerson = function(person_map){
 			var person,
 				name = person_map.name,
 				cid = person_map.cid,
 				css_map = person_map.css_map,
 				id = person_map.id;
 			if(cid === undefined || !name){
 				throw 'client id and name is required';
 			}
 			person = Object.create(peopleProto);
 			person.name = name;
 			person.cid = cid;
 			person.css_map =css_map;
 			if(id){ person.id = id; }
 			stateMap.people_cid_map[cid] = person;
 			stateMap.people_db.insert(person);
 			return person;
 		};
 		//name: removePerson
 		//purpose : remove a person object when needed
 		removePerson = function(person){
 			if (!person) {
 				return false;
 			}
 			if(person.id === configMap.anon_id){
 				return false;
 			}
 			stateMap.people_db({cid:person.cid}).remove();
 			if (person.cid) {
 				delete stateMap.people_cid_map[person.cid] ;
 			}
 			return true;
 		};
 		//name: people
 		//purpose: packaging a people with some function and propertes
 		people =(function(){
 			var get_db,get_cid_map,get_user,login,logout;
 			get_db = function(){ 
 				return stateMap.people_db;
 			};
 			get_cid_map=function(){ 
 				return stateMap.people_cid_map;
 			};
 			get_user = function(){
 				return stateMap.user;
 			};
 			login = function(name){
 				var sio = isFakeDate? spa.fake.mockSio:spa.data.getSio;	
 				stateMap.user = makePerson({
 					name: name,
 					cid: makeCid(),
 					css_map: {top: 25,left: 25,'background-color': '#8f8'}
 				});

 				sio.on('userupdate',updateUser);
 				sio.emit('adduser',{
 					cid: stateMap.user.cid,
 					name: stateMap.user.name,
 					css_map: stateMap.user.css_map
 				});
 			};
 			logout = function(){
 				var user = stateMap.user;
 				chat._leave();
 				stateMap.people_db({cid:user.cid}).remove();
 				stateMap.user = stateMap.anon_user;
 				clearPeopleDb();
 				$.gevent.publish('spa-logout',[user]);
 			};
 			return{
 				get_db: get_db,
 				get_cid_map:get_cid_map,
 				get_user: get_user,
 				login: login,
 				logout: logout
 			};
 		})();
 		//name: chat
 		//purpose: provide the basic ability to chat
 		chat = (function(){
 			var _public_listchange,_publish_updatechat,
 			_update_list,_leave_chat,join_chat,
 			get_chatee,set_chatee,send_mes,update_avatar,
 			chatee = null;
 			_update_list = function(arg_list){
 				var i,person_map,make_person_map,person,
 				people_list = arg_list[0],
 				is_chatee_online = false;
 			clearPeopleDb();
 			PERSON:
 			for (i = 0; i < people_list.length; i++) {
 				person_map = people_list[i];
 				if (!person_map.name) {
 					continue PERSON;
 				}
 				if (stateMap.user && stateMap.user.id===person_map._id) {
 					stateMap.user.css_map = person_map.css_map;
 					continue PERSON;
 				}
 				make_person_map = {
 					cid: person_map._id,
 					id: person_map._id,
 					name: person_map.name,
 					css_map: person_map.css_map
 				} ;
 				person = makePerson(make_person_map);
 				if (chatee && chatee.id === make_person_map.id) {
 					is_chatee_online = true;
 					chatee = person;
 				}
 			}
 			stateMap.people_db.sort('name');
 			if (chatee && !is_chatee_online) {
 				set_chatee('');
 			}
 			};
 			_public_listchange = function(arg_list){
 				_update_list(arg_list);
 				$.gevent.publish('spa-listchange',[arg_list]);
 			};
 			_publish_updatechat =function(arg_list){
 				var msg_map = arg_list[0];
 				if (!chatee) {
 					set_chatee(msg_map.sender_id);
 				}else if(msg_map.sender_id !== stateMap.user.id&&msg_map.sender_id !== chatee.id ){
 					set_chatee(msg_map.sender_id);
 				}
 				$.gevent.publish('spa-updatechat',msg_map);
 			};
 			_leave_chat = function(){
 				var sio = isFakeDate? spa.fake.mockSio: spa.data.getSio();
 				stateMap.is_connect = false;
 				chatee = null;

 				if (sio) {sio.emit('leavechat',stateMap.user.id);}
 			};
 			get_chatee = function(){
 				return chatee;
 			};
 			join_chat = function(){
 				var sio;
 				if (stateMap.is_connect) {
 					return false;
 				}
 				if (stateMap.user.get_is_anon()) {
 					console.warn('user must be defined before join');
 					return false;
 				}
 				sio = isFakeDate? spa.fake.mockSio: spa.data.getSio();
 				sio.on('listchange',_public_listchange);
 				sio.on('updatechat',_publish_updatechat);
 				sio.emit('listchange');
 				stateMap.is_connect = true;
 				return true;
 			};
 			send_mes = function(meg_text){
 				var msg_map,
 				sio = isFakeDate? spa.fake.mockSio:spa.data.getSio();
 				console.log(stateMap.user ,chatee);
 				if (!sio) {
 					return false;
 				}
 				if (!(stateMap.user && chatee)) {
 					return false;
 				}
 				msg_map = {
 					dest_id: chatee.id,
 					sender_id: stateMap.user.id,
 					meg_text: meg_text,
 					dest_name: chatee.name
 				};
 				console.log(msg_map);
 				_publish_updatechat([msg_map]);
 				sio.emit('send_mes',msg_map);
 				return true;
 			};
 			set_chatee = function(person_id){
 				var new_chatee;
 				new_chatee = stateMap.people_cid_map[person_id];
 				if (chatee) {
	 				if (new_chatee) {
	 					if (!chatee && new_chatee.id === chatee.id) {
	 						return false;
	 					}
	 				}else{
	 					new_chatee = null;
	 				}
 				}
 				$.gevent.publish('spa-setchatee',{new_chatee: new_chatee,old_chatee: chatee});
 				chatee = new_chatee;
 				return true;
 			};
 			update_avatar = function(avatar_update_map){
 				var sio = isFakeDate? spa.fake.mockSio: spa.data.getSio();
 				if (sio) {
 					sio.emit('updateavatar',avatar_update_map);
 				}
 			};
 			return{
 				_leave: _leave_chat,
 				join: join_chat,
 				send_mes: send_mes,
 				set_chatee: set_chatee,
 				get_chatee: get_chatee,
 				update_avatar: update_avatar
 			};
 		})();
 		initModule = function(){
 			var i,people_list,person_map;
 			stateMap.anon_user = makePerson({
 				id : configMap.anon_id,
 				name: 'anonymous',
 				cid: configMap.anon_id
 			});
 			stateMap.user = stateMap.anon_user;
 		};
 		return {
 			initModule: initModule,
 			people: people,
 			chat: chat
 		};
 })();