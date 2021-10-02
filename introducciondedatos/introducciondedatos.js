const http = require('http');			
const url  = require('url');			
const fs   = require('fs');				
const qs   = require('querystring');	

const mime = {
	'html' : 'text/html',
	'css'  : 'text/css',
	'jpg'  : 'image/jpg',
	'ico'  : 'image/x-icon',
	'mp3'  : 'audio/mpeg3',
	'mp4'  : 'video/mp4'
};

const servidor = http.createServer(
	(pedido, respuesta) => {
		let ourl = url.parse(pedido.url);	
		if (ourl.pathname == '/'){ourl.pathname += 'public/index.html'; pedido.url = url.format(ourl);} 
		const archivo = ourl.pathname.substring(1); 
		console.log(archivo);
		switch(archivo){
			case 'hacerfigura':
				let data = '';
				pedido.on('data', (datosparciales) => {data += datosparciales;});
				pedido.on('end', () => {
					const formulario = qs.parse(data);
					const L = parseInt(formulario['lineas']);
					const ancho = 2*L - 1;
					let figura = '';
					for (let i=0; i<L; i++){
						
						for (let j=0; j<(ancho - (i*2+1))/2; j++) figura += ' ';
						for (let j=0; j<i*2+1; j++) if (j % 2 == 0) figura += '*'; else figura += 'o';
						for (let j=0; j<(ancho - (i*2+1))/2; j++) figura += ' ';
						figura += "\r\n";
					}
					respuesta.writeHead(200, {'Content-Type': 'text/html'});
					const pagina = `
<!doctype html>
<html>
<head>
<style>
div {text-align: center;}
pre {display: inline-block; border: 1px solid black;}
</style>
</head>
<body>
<div><span></span><pre>${figura}</pre><span></span></div>
<br />
<a href="public/index.html">Retornar</a>
</body>
</html>
`;
					
					respuesta.end(pagina);
				});	

				break;
			default:
				
				fs.access(archivo, fs.constants.F_OK, (err) => {
					if (err) {
						
						respuesta.writeHead(404, {'Content-Type': 'text/html'});
						respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');		
						respuesta.end();
					} else {
						
						fs.readFile(archivo, (error, contenido) => {
							if (err) {
								
								respuesta.writeHead(500, {'Content-Type': 'text/plain'});
								respuesta.write('Error interno de servidor');
								respuesta.end();
							} else {
								const ext = archivo.split('.').pop();
								respuesta.writeHead(200, {'Content-Type': mime[ext]});
								respuesta.write(contenido);
								respuesta.end();
							}
						});
					}
				});
				break;
		}
});
servidor.listen(8888);
console.log('Servidor iniciado');
