/**
* routes.js
**/

var configRoutes;
configRoutes = function(app,server){
	app.get('/',function(req,res){
		res.redirect('/spa.html');
	});
	app.all('/:obj_type/*?',function(req,res,next){
		res.contentType('json');
		next();
	});												
	app.get('/:obj_type/list',function(req,res){
		res.send(":obj_type/list");
	});
	app.get('/:obj_type/read/:id([0-9]+)',function(req,res){
		res.send("the id is"+req.params.id+" with "+ req.params.obj_type +" found !");
	});
	app.get('/:obj_type/create/:id([0-9]+)',function(req,res){
		res.send("create :obj_type");
	});
	app.get('/:obj_type/update/:id([0-9]+)',function(req,res){
		res.send("update :obj_type");
	});
	app.get('/:obj_type/delete/:id([0-9]+)',function(req,res){
		res.send("delete :obj_type");
	});

};
module.exports = {
	configRoutes: configRoutes
};