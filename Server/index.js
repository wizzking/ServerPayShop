//prende el server con node.js
var Users			=	[];

var express			=	require('express');
var app				=	express();
var server 			=	require('http').Server(app);
var io 				=	require('socket.io')(server);

var st = true;


var mysql = require('mysql');
var connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'hackathon',
   port: 3306
});



connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log("\x1b[32m",'[DB:MySql] == Mode "On"');
   }
});



io.origins('*:*');

server.listen(90,function()
{
	console.log("\x1b[32m",'[SERVER:STATUS] == Mode "On"');
	console.log("\x1b[32m",'[SERVER:STATUS] == Running at: http://localhost:90');
});

io.on('connection',function(socket)
{
	console.log("\x1b[32m",'[USER:MOBILE] == Socket: "'+socket.id+'" Is "On"');

	socket.emit('getResponse',"You're connected.");

	socket.on('sendDatosUser',function(data)
	{
		data = JSON.parse(data);
	var query = connection.query('SELECT * FROM hk_users WHERE hk_email= "'+data.User+'" and hk_password= "'+data.Password+'"', function(error, result){
      if(error)
      {
        throw error;
      }
      else
      {
          var resultado = result;
	      if(resultado.length > 0)
	      {
	        
	        if (resultado[0].hk_type == 'Person') 
	        {
	        	console.log("\x1b[33m",'[SERVER:MSG] == Mobile is "Person"');
	        	
	        	io.sockets.emit('sendDatosUser',{'Respuesta': 'Persona','SockId':resultado[0].hk_nip,'Email':resultado[0].hk_email,'TypePerson':resultado[0].hk_type});
	        }
	    	else if (resultado[0].hk_type == 'Fijo')
	    	{
	    		console.log("\x1b[33m",'[SERVER:MSG] == Mobile is "Fijo"');
	    		io.sockets.emit('sendDatosUser',{'Respuesta': 'Fijo','SockId':resultado[0].hk_nip,'Email':resultado[0].hk_email,'TypePerson':resultado[0].hk_type});
	    	}
	        
	      }
	      else
	      {
	        console.log("\x1b[31m",'[SERVER:MSG] == Mobile no exist');
	        io.sockets.emit('sendDatosUser',{'Respuesta': 'danger'});
	      }
      }
    });

	});


	socket.on('sendDatosUserRegister',function(data)
	{
		data = JSON.parse(data);
		var queryc = connection.query('SELECT * FROM hk_users WHERE hk_email= "'+data.RCorreo+'" and hk_password= "'+data.RPassword+'"', function(error, result){
		if(error)
	      {
	        throw error;
	      }
	      else
	      {
		      var resultado = result;
		      if(resultado.length > 0)
		      {
		      	console.log("\x1b[31m",'[SERVER:MSG] == Denied registration');
		      }
		      else
		      {
		        var query = connection.query('INSERT INTO hk_users (hk_name, hk_lastname_1, hk_lastname_2, hk_latitud, hk_date, hk_password, hk_status, hk_type, hk_email,hk_longitud,hk_nip) VALUES ("'+data.RNombre+'", "'+data.RLastName1+'", "'+data.RLastName2+'", "'+data.RLatitud+'", "martes", "'+data.RPassword+'",  "1", "'+data.RCombo+'", "'+data.RCorreo+'", "'+data.RLongitud+'","'+socket.id+'")', function(error, result){
			      if(error)
			      {
			        throw error;
			      }
			      else
			      {
				    console.log("\x1b[32m",'[SERVER:MSG] == Accepted registration');
				    io.sockets.emit('sendDatosUserRegister',{'Respuesta': 'Usuario Registrado'});
			      }
			    });
		      }
	      }
	    });
	});


	socket.on('sendDatosUserCobro',function(data)
	{
		data = JSON.parse(data);

		
		if(Users.length>0)
		{
			for (var i = 0; i < Users.length; i++) 
			{
				if (data.pasoEmail == Users[i].pasoEmail)
				{
					console.log("\x1b[33m",'[SERVER:MSG] == El pago ya esta Registrado.');
					var query = connection.query('INSERT INTO hk_logs (hk_status, hk_idUser1, hk_idUser2, hk_money, hk_direction) VALUES ("1", "'+Users[i].EmailSerach+'", "'+Users[i].pasoEmail+'", "'+Users[i].SendPago+'", "Pago")', function(error, result){
				      if(error)
				      {throw error;}
				      else
				      {}
				    });

				    var query = connection.query('INSERT INTO hk_logs (hk_status, hk_idUser1, hk_idUser2, hk_money, hk_direction) VALUES ("1", "'+Users[i].pasoEmail+'", "'+Users[i].EmailSerach+'", "'+Users[i].SendPago+'", "Cobro")', function(error, result){
				      if(error)
				      {throw error;}
				      else
				      {}
				    });
				    User.splice(i,1);
					st = false;
					break;
				} 
			}
			if (st) 
			{

				Users.push({'mycorreo':data.pasoEmail,'sucorreo':data.EmailSerach,'SendPago': data.SendPago});
			}
		}
		else
		{

			Users.push({'pasoEmail':data.pasoEmail,'EmailSerach':data.EmailSerach,'SendPago': data.SendPago});
		}
		/// io.sockets.emit('sendDatosUserRegister',{'Respuesta': 'Usuario Registrado'});
	});

	socket.on('sendDatosUserPago',function(data)
	{
		data = JSON.parse(data);
		if(Users.length>0)
		{
			for (var i = 0; i < Users.length; i++) 
			{
				if (data.EmailSerach == Users[i].pasoEmail && data.pasoEmail == Users[i].EmailSerach)
				{
					console.log("\x1b[32m",'[SERVER:MSG] == Generando Pago.');
					io.sockets.emit('sendDatosUserPago',{'Respuesta': 'PAGO EN PROCESO','SendPago':Users[i].SendPago});
					break;
				} 
			}
		}
		else
		{
			console.log("\x1b[31m",'[SERVER:MSG] == No existe pago pendiente.');
		}
	});

	/*socket.on('getDataLogs',function(data)
	{
		data = JSON.parse(data);
		var query = connection.query('SELECT * FROM hk_logs WHERE hk_idUser1= "'+data.pasoEmail+'"', function(error, result){
      if(error)
      {
        throw error;
      }
      else
      {
          var resultado = result;
	      if(resultado.length > 0)
	      {
        	//console.log("\x1b[33m",'[SERVER:MSG] == Mobile is "Person"');
        	io.sockets.emit('getDataLogs',{'Respuesta': 'suses'});
        	//io.sockets.emit('sendDatosUser',{'Respuesta': 'Persona','SockId':resultado[0].hk_nip,'Email':resultado[0].hk_email,'TypePerson':resultado[0].hk_type});
	      }
	      else
	      {
	        console.log("\x1b[31m",'[SERVER:MSG] == Mobile no exist');
	        io.sockets.emit('getDataLogs',{'Respuesta': 'danger'});
	      }
      }
		
	});*/


});

/*
function showAllUsers()
{
	console.log('lista de usuarios\n');
	for (var i = 0; i < Users.length; i++) 
	{
		console.log('mycorreo: '+Users[i].pasoEmail+' sucorreo:'+Users[i].EmailSerach+'\n');
	}
}
*/