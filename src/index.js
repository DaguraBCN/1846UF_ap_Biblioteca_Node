// Carga de los modulos necesarios
const express = require('express');
const app = express();

// Cargamos las rutas del proyecto
const path = require('node:path');

// Cargamos el puerto desde el archivo .env
process.loadEnvFile()
const PORT = process.env.PORT

// Cargamos los datos
const datos = require('../data/ebooks.json');
// console.log(datos);

// Indicamos la ruta de los ficheros estáticos, con un punto es en el mismo directorio que el archivo actual, con dos puntos subes un nivel
app.use(express.static(path.join(__dirname, "../public")));

// Ruta Home = Inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Ruta de la lista completa de los autores ordenados alfabéticamente por apellido
datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, "es-ES"));
app.get("/api", (req, res) => {
    res.json(datos);
});

// Ruta para filtrar autores por apellido
app.get("/api/apellido/:apellido", (req, res) => {
    const apellido = req.params.apellido.toLocaleLowerCase();
    const filtroAutores = datos.filter(autor => autor.autor_apellido.toLocaleLowerCase() == apellido);
    if (filtroAutores.length == 0) {
        return res.status(404).send("Autor no encontrado");
    }
    res.json(filtroAutores);
});

// Ruta para filtrar autores por nombre y apellido
app.get("/api/nombre_apellido/:autor_nombre/:autor_apellido", (req, res) => {
    const nombre = req.params.autor_nombre.toLocaleLowerCase();
    const apellido = req.params.autor_apellido.toLocaleLowerCase();
    const filtroAutores = datos.filter(autor => autor.autor_nombre.toLocaleLowerCase() == nombre && autor.autor_apellido.toLocaleLowerCase() == apellido);
    if (filtroAutores.length == 0) {
        return res.status(404).send("Autor no encontrado");
    }
    res.json(filtroAutores);
});

// Ruta para filtrar autores por nombre y primeras letras del apellido

app.get("/api/nombre/:nombre", (req, res) => {
    const nombre = req.params.nombre.toLocaleLowerCase();
    const apellido = req.query.apellido;
    // console.log(nombre, apellido);
    if (apellido === undefined) {
        return res.status(400).send("Falta el parametro apellido");
    }
    // Para saber cuantas letras tiene el apellido escrito por el usuario
    const letras = apellido.length
    // Comprobamos con la longitud de las letras del apellido coincida con el apellido intrducido
    const filtroAutores = datos.filter(autor => autor.autor_nombre.toLocaleLowerCase() == nombre && autor.autor_apellido.slice(0, letras).toLocaleLowerCase() == apellido.toLocaleLowerCase());
    // Si no encuentra coincidencias, devuelve un 404
    if (filtroAutores.length == 0) {
        return res.status(404).send("Autor no encontrado");
    }
    // Devolvemos datos filtrados
    res.json(filtroAutores);
});

// Ruta para filtrar las obras editadas en el año indicado
app.get("/api/edicion/:edicion", (req, res) => {
    const anio = parseInt(req.params.edicion);
    if (isNaN(anio)) {
        return res.status(400).send("El año debe ser un número entero");
    }
    const filtroObras = datos.flatMap(autor => autor.obras.filter(obra => obra.edicion == anio))
    if (filtroObras.length == 0) {
        return res.status(404).send("No hay obras editadas en ese año");
    }
    res.json(filtroObras);
});

// Cargar la página 404 de error
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "../public", "404.html")) );

// Ponemos en marcha el servidor
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));