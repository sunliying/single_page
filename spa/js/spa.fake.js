/*
* spa.fake.js 
* fake module
*/
/*global $ spa */
spa.fake = (function(){
	'use strict';
	var peopleList, makeFakeId,fakeIdSerial,mockSio;
	fakeIdSerial = 5;
	makeFakeId = function(){
		return 'id_'+String(fakeIdSerial++);
	};
	// 生成的ID不会加id_05，只会使
	peopleList = [
		{
			name: 'Sunly',_id: 'id_1',
			css_map: {
				top: 20, left: 20, 'background-color': 'rgb(128,128,128)'
			}
		},
		{
			name: 'Wendy',_id: 'id_2',
			css_map: {
				top: 60, left: 20, 'background-color': 'rgb(128,255,128)'
			}
		},
		{
			name: 'Amanda',_id: 'id_3',
			css_map: {
				top: 100, left: 20, 'background-color': 'rgb(128,192,192)'
			}
		},
		{
			name: 'Steven',_id: 'id_4',
			css_map: {
				top: 140, left: 20, 'background-color': 'rgb(192,128,128)'
			}
		}
		];
	mockSio = (function(){
		var on_sio,emit_sio,
			callback_map = {},i;
		on_sio = function(message_type,callback){
			callback_map[message_type] = callback;
		};
		emit_sio = function(message_type,data){
			var person_map;
			if (message_type === 'adduser' && callback_map.userupdate) {
				setTimeout(function(){
					person_map = {
						_id: makeFakeId(),
						name: data.name,
						css_map: data.css_map
					};
					peopleList.push(person_map);
					callback_map.userupdate([person_map]);
				},3000);
			}
			// if (message_type === 'updatechat'&& callback_map.updatechat) {
			// 	setTimeout(function(){
			// 		var user = spa.model.people.get_user();
			// 		callback_map.updatechat([{
			// 			dest_id: user.id,
			// 			dest_name: user.name,
			// 			sender_id: data.dest_id,
			// 			meg_text: 'OK,that is fine enough,'+user.name
			// 		}]);
			// 	},2000);
			// }
			if (message_type === 'leavechat') {
				delete callback_map.listchange;
				delete callback_map.updatechat;
				// for (i = 0; i < peopleList.length; i++) {
				// 	if (peopleList[i]._id === data) {
				// 		peopleList.splice(i,i+1);
				// 	}
				// }
				peopleList.pop();
			}
			if (message_type === 'updateavatar'&& callback_map.listchange) {
				for (i = 0; i < peopleList.length; i++) {
					if (peopleList[i]._id === data.person_id) {
						peopleList[i].css_map = data.css_map;
						break;
					}
				}
				callback_map.listchange([peopleList]);
			}
			if (message_type ==='send_mes'&&callback_map.updatechat) {
				setTimeout(function(){
					var user = spa.model.people.get_user();
						callback_map.updatechat([{
							dest_id: user.id,
							dest_name: user.name,
							sender_id: data.dest_id,
							meg_text: 'Hi,I have got your message,and I agree with you all the time'
						}]);
				},8000);
			}
			if (message_type === 'listchange'&& callback_map.listchange) {
				callback_map.listchange([peopleList]);
			}
		};
		return {
			on: on_sio,
			emit: emit_sio
		};
	})();
	return {
		mockSio: mockSio
	};
})();