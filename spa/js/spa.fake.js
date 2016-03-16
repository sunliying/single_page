/*
* spa.fake.js 
* fake module
*/
/*global $ spa */
spa.fake = (function(){
	'use strict';
	var getPeopleList, makeFakeId,fakeIdSerial,mockSio;
	fakeIdSerial = 5;
	makeFakeId = function(){
		return 'id_'+String(fakeIdSerial++);
	};
	getPeopleList = function(){
		return [
		{
			name: 'Sunly',_id: 'id_01',
			css_map: {
				top: 20, left: 20, 'background-color': 'rgb(128,128,128)'
			}
		},
		{
			name: 'Wendy',_id: 'id_02',
			css_map: {
				top: 60, left: 20, 'background-color': 'rgb(128,255,128)'
			}
		},
		{
			name: 'Amanda',_id: 'id_03',
			css_map: {
				top: 100, left: 20, 'background-color': 'rgb(128,192,192)'
			}
		},
		{
			name: 'Steven',_id: 'id_04',
			css_map: {
				top: 140, left: 20, 'background-color': 'rgb(192,128,128)'
			}
		}
		];
	};
	mockSio = (function(){
		var on_sio,emit_sio,callback_map = {};
		on_sio = function(message_type,callback){
			callback_map[message_type] = callback;
		};
		emit_sio = function(message_type,data){
			if (message_type === 'adduser' && callback_map.userupdate) {
				setTimeout(function(){
					callback_map.userupdate([{
						_id: makeFakeId(),
						name: data.name,
						css_map: data.css_map
					}]);
				},3000);
			}
		};
		return {
			on: on_sio,
			emit: emit_sio
		};
	})();
	return {
		getPeopleList: getPeopleList,
		mockSio: mockSio
	};
})();