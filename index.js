const http = require("http");
const { insertarUsuario, consultarUsuarios, modificarUsuario, eliminarUsuario, realizarTransferencia, consultarTransferencias }  = require("./consultas");
const fs = require("fs");
const url = require("url");

http.createServer(async (req, res) => {


    if (req.url == "/" && req.method === "GET") {

        try{
            res.setHeader("content-type", "text/html");
            const html = fs.readFileSync("index.html", "utf8");
            res.end(html);
            res.statusCode = 200;
        }catch (error){
            console.log(error.code);
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';
            return error;
        }
    }

    if ((req.url == "/usuario" && req.method == "POST")) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", async () => {
            const datos = Object.values(JSON.parse(body));
            //console.log(datos);
            try{
            const respuesta = await insertarUsuario(datos);
            res.statusCode = 200;
            res.end(JSON.stringify(respuesta)); //JSON.stringify(respuesta)
            } catch (error){
                res.statusCode = 500;
                res.statusMessage = 'Internal Server Error';
                console.log(error.code);
                return error;
            }
        });
    }

    if ((req.url == "/usuarios" && req.method == "GET")) {
        
        try{
            const resultado = await consultarUsuarios();
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(resultado.rows));
        }catch (error){
            console.log(error.code);
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';
            return error;
        }   
    }

    if ((req.url.includes("/usuario?id=") && req.method == "PUT")) {
        
        const { id } = url.parse(req.url, true).query
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", async () => {
            const datos = Object.values(JSON.parse(body));
            datos.push(id);                                   //Le agregamos la id al arreglo altiro
           // console.log(datos);
            try{
                const resultado = await modificarUsuario(datos);
                res.statusCode =200;
                res.end(JSON.stringify(resultado.rows));
            } catch (error){
                res.statusCode = 500;
                res.statusMessage = 'Internal Server Error';
                console.log(error.code);
                return error;
            }
        });
    }
    if (req.url.includes("/usuario?id=") && req.method == "DELETE") {
        const { id } = url.parse(req.url, true).query
        try {
            const resultado = await eliminarUsuario(id);
            res.statusCode =200;
            res.end(JSON.stringify(resultado.rows)); 
        }catch (error){
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';
            console.log(error.code);
            return error;
        }
    }

    if ((req.url == "/transferencia" && req.method == "POST")) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", async () => {
            const datos = Object.values(JSON.parse(body));
            try{
                const respuesta = await realizarTransferencia(datos);
                res.statusCode = 200;
                res.end(JSON.stringify(respuesta.rows)); 
            } catch (error){
                res.statusCode = 500;
                res.statusMessage = 'Internal Server Error';
                console.log(error.code);
                return error;
            }
        });
    }

    if ((req.url == "/transferencias" && req.method == "GET")) {
        try{
            const resultado = await consultarTransferencias();
            res.statusCode = 200;
            res.end(JSON.stringify(resultado.rows));
        } catch (error){
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';
            console.log(error.code);
        }
    }
})
.listen(3000 ,()=> console.log('Escuchando en el puerto 3000'));