const { Pool } = require("pg"); 


const config = {   
    user: "postgres",
    host: "localhost",
    password: "admin",
    database: "bancosolar",
    port: 5432,
    max: 20,
    min: 5,
    idleTimeoutMillis: 5000,
    connetionTimeoutMillis: 2000,
}

const pool = new Pool(config);

const insertarUsuario = async (datos) => {
    const consulta = {
        text: "INSERT INTO usuarios (nombre, balance) values($1, $2);",
        values: datos,
    };
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const realizarTransferencia = async (datos) => {
    
    const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const retiro = {
                text: "UPDATE usuarios SET balance = balance - $2 WHERE id = $1 RETURNING *;",
                values: [datos[3],datos[2]],
            };
            const deposito = {
                text: "UPDATE usuarios SET balance = balance + $2 WHERE id = $1 RETURNING *;",
                values: [datos[4],datos[2]],
            };
            await client.query(retiro);
            await client.query(deposito);
            await client.query("COMMIT");
            const resultado = await insertarTransferencia(client,datos);  // Se llama a la funcion async para insertar los datos en la tabla transacciones
            return resultado;
        } catch (e) {
            await client.query("ROLLBACK");
            console.log(e);
        }finally{
            client.release();
        }
};

async function insertarTransferencia(client,datos) {
    const date = new Date();
    datos.push(date);
    try {
        await client.query("BEGIN");
        const res = await client.query("insert into transferencias (emisor, receptor, monto, fecha) values ($1, $2, $3, $4) RETURNING *;",
            [datos[3],datos[4],datos[2],datos[5]]);
        await client.query("COMMIT");
        return res;
    } catch (e) {
        await client.query("ROLLBACK");
        console.log(e);
    }
}

const consultarTransferencias = async () => {
    //const consulta =`select * from transferencias;`
    const consultaJoin = `select nombre as nombreEmisor, nombreReceptor, monto, fecha from
    (select * from usuarios inner join
    (select emisor,receptor,monto,fecha, usuarios.id as idReceptor, usuarios.nombre as nombreReceptor from transferencias inner join usuarios
    on usuarios.id=transferencias.receptor) as a on usuarios.id=a.emisor) as b;`
    try {
        const result = await pool.query(consultaJoin);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};


const consultarUsuarios = async () => {
    const consulta =`select id, nombre, balance from usuarios order by id asc;`
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const modificarUsuario = async (datos) => {
    const consulta = {
        text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *;",
        values: datos,
    };
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
    
};


const eliminarUsuario = async (id) => {
    console.log(id);
    const SQLQuery = {
        name: "eliminar-usuario",
        text: "DELETE FROM usuarios WHERE id = $1 RETURNING *;",
        values: [id],
    };
    try {
        const result = await pool.query(SQLQuery);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};  


module.exports = { 
                insertarUsuario,
                consultarUsuarios,
                modificarUsuario, 
                eliminarUsuario, 
                realizarTransferencia,
                consultarTransferencias 
            }; 