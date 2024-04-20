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
let players = {}; 
let salas = {};
let questions = [
    // Sistemas
    {categoria: "sistemas", pregunta: "¿Cuál es el principal componente de un sistema computacional?", respuestas: ["CPU", "Monitor", "Teclado", "Disco Duro"], correcta: "CPU"},
    {categoria: "sistemas", pregunta: "¿Qué significa el término 'hardware'?", respuestas: ["Programas de computadora", "Partes físicas de un computador", "Error de sistema", "Interfaz de usuario"], correcta: "Partes físicas de un computador"},
    {categoria: "sistemas", pregunta: "¿Cuál es el propósito de un sistema operativo?", respuestas: ["Procesamiento de texto", "Gestionar los recursos del hardware", "Navegar por internet", "Diseño gráfico"], correcta: "Gestionar los recursos del hardware"},
    {categoria: "sistemas", pregunta: "¿Qué es un servidor?", respuestas: ["Un tipo de software", "Un dispositivo de almacenamiento", "Una computadora que proporciona datos a otras computadoras", "Una aplicación móvil"], correcta: "Una computadora que proporciona datos a otras computadoras"},
    {categoria: "sistemas", pregunta: "¿Qué significa LAN en términos de redes?", respuestas: ["Large Area Network", "Local Area Network", "Long Area Network", "Low Area Network"], correcta: "Local Area Network"},
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
    {categoria: "bases de datos", pregunta: "¿Qué es la normalización en bases de datos?", respuestas: ["Agregar redundancia a los datos", "Eliminar la redundancia y organizar los datos en tablas relacionales", "Modificar el formato de los datos", "Realizar copias de seguridad de la base de datos"], correcta: "Eliminar la redundancia y organizar los datos en tablas relacionales"},
    {categoria: "bases de datos", pregunta: "¿Cuál es la función del lenguaje SQL?", respuestas: ["Definir la estructura de una base de datos", "Controlar el acceso a la base de datos", "Manipular y consultar datos en una base de datos", "Establecer la seguridad física de la base de datos"], correcta: "Manipular y consultar datos en una base de datos"},
    {categoria: "bases de datos", pregunta: "¿Qué es un índice en una base de datos?", respuestas: ["Una lista de tablas", "Una estructura que acelera la búsqueda de registros en una tabla", "Un tipo de dato numérico", "Una función matemática para calcular promedios"], correcta: "Una estructura que acelera la búsqueda de registros en una tabla"},
    {categoria: "bases de datos", pregunta: "¿Qué es la integridad referencial?", respuestas: ["Una característica de las bases de datos NoSQL", "La garantía de que las relaciones entre tablas se mantengan válidas", "Un tipo de consulta SQL avanzada", "La capacidad de realizar copias de seguridad de una base de datos"], correcta: "La garantía de que las relaciones entre tablas se mantengan válidas"},
    {categoria: "bases de datos", pregunta: "¿Cuál es el propósito de la sentencia 'JOIN' en SQL?", respuestas: ["Eliminar datos duplicados", "Modificar la estructura de una tabla", "Combinar datos de múltiples tablas basado en una condición", "Establecer permisos de acceso a la base de datos"], correcta: "Combinar datos de múltiples tablas basado en una condición"},
    // Lógica
    {categoria: "logica", pregunta: "¿Qué es una falacia?", respuestas: ["Un argumento válido", "Una contradicción", "Un error en el razonamiento", "Una pregunta retórica"], correcta: "Un error en el razonamiento"},
    {categoria: "logica", pregunta: "Si todos los B son C, y todos los A son B, ¿todos los A son C?", respuestas: ["Verdadero", "Falso", "A veces", "No se puede determinar"], correcta: "Verdadero"},
    {categoria: "logica", pregunta: "¿Qué estudia la lógica?", respuestas: ["Comportamiento humano", "Estructura de las computadoras", "Principios del razonamiento correcto", "Geometría y matemáticas"], correcta: "Principios del razonamiento correcto"},
    {categoria: "logica", pregunta: "¿Qué es un silogismo?", respuestas: ["Una figura literaria", "Una ecuación matemática", "Un tipo de razonamiento deductivo", "Una forma de lenguaje de programación"], correcta: "Un tipo de razonamiento deductivo"},
    {categoria: "logica", pregunta: "¿Cuál es la ley de identidad en lógica proposicional?", respuestas: ["p ∧ ¬p ≡ V", "p ∨ ¬p ≡ V", "p → q ≡ ¬p ∨ q", "p ↔ q ≡ (p → q) ∧ (q → p)"], correcta: "p ∧ ¬p ≡ V"},
    {categoria: "logica", pregunta: "¿Qué es el principio de no contradicción?", respuestas: ["Dos afirmaciones opuestas no pueden ser ambas verdaderas al mismo tiempo", "Dos afirmaciones opuestas siempre son verdaderas", "Es posible que dos afirmaciones opuestas sean verdaderas", "Dos afirmaciones opuestas no pueden ser ambas falsas al mismo tiempo"], correcta: "Dos afirmaciones opuestas no pueden ser ambas verdaderas al mismo tiempo"},
    {categoria: "logica", pregunta: "¿Cuál es el símbolo de la conjunción en lógica proposicional?", respuestas: ["∨", "¬", "→", "∧"], correcta: "∧"},
    {categoria: "logica", pregunta: "¿Qué es un enunciado lógico?", respuestas: ["Una pregunta abierta", "Una afirmación que es verdadera o falsa, pero no ambas", "Un argumento complejo", "Un problema matemático"], correcta: "Una afirmación que es verdadera o falsa, pero no ambas"},
    {categoria: "logica", pregunta: "¿Qué es la inferencia lógica?", respuestas: ["Una operación matemática", "Un proceso de derivar conclusiones válidas a partir de premisas", "Una función de programación", "Una estructura de datos"], correcta: "Un proceso de derivar conclusiones válidas a partir de premisas"},
    {categoria: "logica", pregunta: "¿Cuál es la ley de doble negación en lógica proposicional?", respuestas: ["¬¬p ≡ p", "¬(p ∧ q) ≡ ¬p ∨ ¬q", "¬(p ∨ q) ≡ ¬p ∧ ¬q", "p → q ≡ ¬p ∨ q"], correcta: "¬¬p ≡ p"},

    //matematicas
    {categoria: "matematicas", pregunta: "¿Cuál es el resultado de 2 + 2?", respuestas: ["3", "4", "5", "6"], correcta: "4"},
    {categoria: "matematicas", pregunta: "¿Cuál es el valor de π (pi)?", respuestas: ["3.14", "2.71", "1.62", "4.20"], correcta: "3.14"},
    {categoria: "matematicas", pregunta: "¿Cuál es el resultado de 5 x 7?", respuestas: ["30", "35", "40", "45"], correcta: "35"},
    {categoria: "matematicas", pregunta: "¿Cuánto es la raíz cuadrada de 64?", respuestas: ["6", "7", "8", "9"], correcta: "8"},
    {categoria: "matematicas", pregunta: "¿Cuál es el resultado de 10 / 2?", respuestas: ["3", "4", "5", "6"], correcta: "5"},
    {categoria: "matematicas", pregunta: "¿Cuál es el área de un cuadrado con lado de longitud 4?", respuestas: ["8", "12", "16", "20"], correcta: "16"},
    {categoria: "matematicas", pregunta: "¿Cuál es el resultado de 3²?", respuestas: ["6", "7", "8", "9"], correcta: "9"},
    {categoria: "matematicas", pregunta: "¿Cuál es el valor de sen(30°)?", respuestas: ["0.5", "0.707", "1", "0"], correcta: "0.5"},
    {categoria: "matematicas", pregunta: "¿Cuál es el resultado de 12 - 8?", respuestas: ["2", "3", "4", "5"], correcta: "4"},
    {categoria: "matematicas", pregunta: "¿Cuál es el perímetro de un rectángulo con largo 5 y ancho 3?", respuestas: ["10", "12", "14", "16"], correcta: "16"},

    //programacion
    {categoria: "programacion", pregunta: "¿Qué es un bucle 'for' en programación?", respuestas: ["Una estructura de control que repite un bloque de código un número específico de veces", "Un tipo de variable numérica", "Una función matemática", "Una librería de JavaScript"], correcta: "Una estructura de control que repite un bloque de código un número específico de veces"},
    {categoria: "programacion", pregunta: "¿Qué significa 'HTML' en desarrollo web?", respuestas: ["Hypertext Markup Language", "Hyper Tool Multi Language", "High Tech Machine Learning", "Home Textual Markup Logic"], correcta: "Hypertext Markup Language"},
    {categoria: "programacion", pregunta: "¿Qué es una 'clase' en programación orientada a objetos?", respuestas: ["Una función en JavaScript", "Una estructura de control condicional", "Un tipo de dato primitivo", "Un prototipo para crear objetos"], correcta: "Un prototipo para crear objetos"},
    {categoria: "programacion", pregunta: "¿Cuál de estos lenguajes es ampliamente utilizado para desarrollo móvil?", respuestas: ["Java", "Cobol", "Fortran", "Pascal"], correcta: "Java"},
    {categoria: "programacion", pregunta: "¿Qué es 'SQL' en el contexto de bases de datos?", respuestas: ["Un lenguaje de programación orientado a objetos", "Un sistema operativo", "Un lenguaje de consulta estructurado", "Un servidor web"], correcta: "Un lenguaje de consulta estructurado"},
    {categoria: "programacion", pregunta: "¿Qué es 'Git' en desarrollo de software?", respuestas: ["Un lenguaje de programación", "Un sistema de gestión de bases de datos", "Un sistema de control de versiones", "Un servidor de aplicaciones"], correcta: "Un sistema de control de versiones"},
    {categoria: "programacion", pregunta: "¿Qué es un 'array' en programación?", respuestas: ["Una estructura de control iterativa", "Un tipo de dato primitivo", "Una colección ordenada de elementos del mismo tipo", "Un operador aritmético"], correcta: "Una colección ordenada de elementos del mismo tipo"},
    {categoria: "programacion", pregunta: "¿Cuál es el resultado de '5 + '5' en JavaScript?", respuestas: ["10", "'55'", "Error de sintaxis", "NaN"], correcta: "'55'"},
    {categoria: "programacion", pregunta: "¿Qué es 'API' en desarrollo de software?", respuestas: ["Automated Programming Interface", "Application Program Interface", "Advanced Protocol Integration", "Automated Programming Instruction"], correcta: "Application Program Interface"},
    {categoria: "programacion", pregunta: "¿Qué significa 'IDE' en programación?", respuestas: ["Integrated Development Environment", "Interactive Data Extraction", "Interface Design Enhancement", "Internal Data Encryption"], correcta: "Integrated Development Environment"}


]
let correctAnswer = ""



io.on("connection", (socket) => {
    console.log("New player connected", socket.id);
    players[socket.id] = { score: 0 }; 


    socket.on('requestQuestions', (categoria) => {
        const roomId = socket.roomId;
        if (!salas[roomId]) {
            salas[roomId] = { players: {}, questions: [], currentQuestion: null, correctAnswer: null };
        }
        
        if (salas[roomId].currentQuestion) {
            io.to(roomId).emit('newQuestion', { pregunta: salas[roomId].currentQuestion, respuestas: salas[roomId].currentAnswers });
            return;
        }
    
        const preguntaDiccionario = questions.filter(q => q.categoria == categoria);
        if (preguntaDiccionario.length === 0) {
            socket.to(roomId).emit('error', 'No hay preguntas disponibles para la categoría seleccionada.');
            return;
        }
        let preguntaRandom = preguntaDiccionario[Math.floor(Math.random() * preguntaDiccionario.length)];
        salas[roomId].currentQuestion = preguntaRandom.pregunta;
        salas[roomId].currentAnswers = preguntaRandom.respuestas;
        salas[roomId].correctAnswer = preguntaRandom.correcta;
        console.log(`Current question for room ${roomId}: ${salas[roomId].currentQuestion}`)
        io.to(roomId).emit('newQuestion', { pregunta: preguntaRandom.pregunta, respuestas: preguntaRandom.respuestas });
    });

      socket.on('iniciarSorteo', ({ roomId }) => {
            let ganador = Math.random()
            salas[roomId].currentQuestion = null;     
            salas[roomId].correctAnswer = null;
            io.to(roomId).emit('realizarSorteo', { numero:ganador});
    });

      socket.on('joinRoom', ({ roomId }) => {
        socket.roomId = roomId;
        socket.join(roomId);
        console.log(`Player ${socket.id} joined room ${roomId}`);
        if (!salas[roomId]) {
            salas[roomId] = { players: {}, questions: [] };
        }
        salas[roomId].players[socket.id] = { score: 0 };
        io.to(roomId).emit('playerJoined', { playerId: socket.id });
    });


    socket.on("answer", ({ roomId, answer }) => {
        let isCorrect = answer === salas[roomId].correctAnswer;
        if (isCorrect) {
            salas[roomId].players[socket.id].score += 10;
        }
        // io.to(roomId).emit("answerResult", { playerId: socket.id, isCorrect, score: salas[roomId].players[socket.id].score });
        socket.emit("answerResult", { playerId: socket.id, isCorrect, score: salas[roomId].players[socket.id].score });
    });
        
        
    

    socket.on("disconnect", () => {
        console.log("Player disconnected", socket.id);
        delete players[socket.id]; 
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
