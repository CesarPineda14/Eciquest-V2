const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4000; 
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);


const io = socketIo(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"]
  }
});
let salas = {}
let players = {}; 
let questions = [
    // Sistemas
    {categoria: "sistemas", pregunta: "¿Cuál es el principal componente de un sistema computacional?", respuestas: ["CPU", "Monitor", "Teclado", "Disco Duro"], correcta: "CPU"},
    {categoria: "sistemas", pregunta: "¿Qué significa el término 'hardware'?", respuestas: ["Programas de computadora", "Partes físicas de un computador", "Error de sistema", "Interfaz de usuario"], correcta: "Partes físicas de un computador"},
    {categoria: "sistemas", pregunta: "¿Cuál es el propósito de un sistema operativo?", respuestas: ["Procesamiento de texto", "Gestionar los recursos del hardware", "Navegar por internet", "Diseño gráfico"], correcta: "Gestionar los recursos del hardware"},
    {categoria: "sistemas", pregunta: "¿Qué es un servidor?", respuestas: ["Un tipo de software", "Un dispositivo de almacenamiento", "Una computadora que proporciona datos a otras computadoras", "Una aplicación móvil"], correcta: "Una computadora que proporciona datos a otras computadoras"},
    {categoria: "sistemas", pregunta: "¿Qué significa LAN en términos de redes?", respuestas: ["Large Area Network", "Local Area Network", "Long Area Network", "Low Area Network"], correcta: "Local Area Network"},

    // Bases de datos
    {categoria: "bases de datos", pregunta: "¿Qué es SQL?", respuestas: ["Un lenguaje de programación", "Un sistema operativo", "Un lenguaje de consulta estructurado", "Un tipo de base de datos NoSQL"], correcta: "Un lenguaje de consulta estructurado"},
    {categoria: "bases de datos", pregunta: "¿Cuál es una característica de las bases de datos NoSQL?", respuestas: ["Estricta consistencia", "Estructura de tablas fijas", "Escalabilidad horizontal", "Soporte exclusivo para consultas SQL"], correcta: "Escalabilidad horizontal"},
    {categoria: "bases de datos", pregunta: "¿Qué representa una fila en una base de datos relacional?", respuestas: ["Una tabla", "Una relación", "Un dato", "Un registro"], correcta: "Un registro"},
    {categoria: "bases de datos", pregunta: "¿Qué es una clave primaria?", respuestas: ["Una contraseña de usuario", "Una columna que identifica de manera única cada fila de una tabla", "Un tipo de índice", "Una función de la base de datos"], correcta: "Una columna que identifica de manera única cada fila de una tabla"},
    {categoria: "bases de datos", pregunta: "¿Qué es MongoDB?", respuestas: ["Una herramienta de monitoreo de bases de datos", "Un lenguaje de consulta", "Una base de datos relacional", "Una base de datos NoSQL orientada a documentos"], correcta: "Una base de datos NoSQL orientada a documentos"},

    // Lógica
    {categoria: "logica", pregunta: "¿Qué es una falacia?", respuestas: ["Un argumento válido", "Una contradicción", "Un error en el razonamiento", "Una pregunta retórica"], correcta: "Un error en el razonamiento"},
    {categoria: "logica", pregunta: "Si todos los B son C, y todos los A son B, ¿todos los A son C?", respuestas: ["Verdadero", "Falso", "A veces", "No se puede determinar"], correcta: "Verdadero"},
    {categoria: "logica", pregunta: "¿Qué estudia la lógica?", respuestas: ["Comportamiento humano", "Estructura de las computadoras", "Principios del razonamiento correcto", "Geometría y matemáticas"], correcta: "Principios del razonamiento correcto"},
    {categoria: "logica", pregunta: "¿Qué es un silogismo?", respuestas: ["Una figura literaria", "Una ecuación matemática", "Un tipo de razonamiento deductivo", "Una forma de lenguaje de programación"], correcta: "Un tipo de razonamiento deductivo"},
]
let currentQuestionIndex = 0; 
let correctAnswer = ""

function sendQuestion(socket, categoriaSelect) {
    let preguntaDiccionario = questions.filter(porta => porta.categoria == categoriaSelect);
    if (preguntaDiccionario.length === 0) {
        console.log(categoriaSelect)
        socket.emit('error', 'No hay preguntas disponibles para la categoría seleccionada.');
        return; 
    }
    let preguntaRandom = preguntaDiccionario[Math.floor(Math.random() * preguntaDiccionario.length)];
    correctAnswer = preguntaRandom.correcta 
    socket.emit('pregunta', { pregunta: preguntaRandom.pregunta, respuestas: preguntaRandom.respuestas});
}




io.on("connection", (socket) => {
    console.log("New player connected", socket.id);
    players[socket.id] = { score: 0 }; 


    socket.on('requestQuestions', (categoria) => {
        
        sendQuestion(socket, categoria);
      });

    socket.on("answer", (data) => {
        console.log(`Answer received from ${socket.id}:`, data);
        console.log("esperada:", correctAnswer)
        if (data == correctAnswer) {
            players[socket.id].score += 10;
            console.log(players[socket.id].score) 
            socket.emit("correct_answer", { score: players[socket.id].score });
        } else {
            console.log(players[socket.id].score)
            socket.emit("incorrect_answer", { score: players[socket.id].score });
        }
        
        
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected", socket.id);
        delete players[socket.id]; 
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
