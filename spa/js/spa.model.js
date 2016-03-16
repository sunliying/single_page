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
 			user: null
 		},
 		peopleProto,people,makePeople,initModule,
 		makeCid,clearPeopleDb,completeLogin,removePerson;
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
 		//name: completeLogin
 		// purpose: to insert a user object when someone login and publish an event
 		completeLogin = function(user_list){
 			var user_map = user_list[0];
 			delete stateMap.people_cid_map[user_map.cid];
 			stateMap.user.id = user_map.id;
 			stateMap.user.cid = user_map.id;
 			stateMap.user.css_map = user_map.css_map;
 			// stateMap.user.name = user_map.name;
 			stateMap.people_cid_map[user_map.cid] = stateMap.user;

 			$.gevent.publish('spa-login',[stateMap.user]);
 		};
 		//create a constructor
 		makePeople = function(person_map){
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
 		removePerson = function(){
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
 				stateMap.user = makePeople({
 					name: name,
 					cid: makeCid(),
 					css_map: {top: 25,left: 25,'background-color': '#8f8'}
 				});
 				
 				sio.on('userupdate',completeLogin);
 				sio.emit('adduser',{
 					cid: stateMap.user.cid,
 					name: stateMap.user.name,
 					css_map: stateMap.user.css_map
 				});
 			};
 			logout = function(){
 				var is_removed,
 					user = stateMap.user;
 				is_removed = removePerson(user);
 				stateMap.user = stateMap.anon_user;
 				$.gevent.publish('spa-logout',[user]);
 				return is_removed;
 			};
 			return{
 				get_db: get_db,
 				get_cid_map:get_cid_map,
 				get_user: get_user,
 				login: login,
 				logout: logout
 			};
 		})();
 		initModule = function(){
 			var i,people_list,person_map;
 			stateMap.anon_user = makePeople({
 				id : configMap.anon_id,
 				name: 'anonymous',
 				cid: configMap.anon_id
 			});
 			stateMap.user = stateMap.anon_user;
 			if( isFakeDate ){
 				people_list = spa.fake.getPeopleList(); 
 				//take an relevant object to avoid the sort question
 				for (i = 0; i < people_list.length; i++) {
 					person_map = people_list[i];
 					makePeople({
 						id: person_map._id,
 						cid: person_map._id,
 						name:person_map.name,
 						css_map: person_map.css_map
 					});
 				}
 			}
 		};
 		return {
 			initModule: initModule,
 			people: people
 		};
 })();