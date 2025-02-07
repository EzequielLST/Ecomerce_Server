import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import mongoose from 'mongoose'; // Importa mongoose para la conexión
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import UserModel from "./models/UserModel.js";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import sessionRouter from "./routes/session.routes.js";
import authRoutes from "./routes/authroutes.js";
import dotenv from "dotenv";

dotenv.config();


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("🟢 Conectado a MongoDB"))
  .catch((err) => console.error("🔴 Error al conectar a MongoDB:", err));

// Inicialización de productos (puedes conectarlo con tu ProductManager más adelante)
let products = [];

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Usar ruta absoluta para views
const __dirname = path.resolve();
app.set('views', path.join(__dirname, 'src', 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public'))); 
app.use(cookieParser());
app.use(passport.initialize());

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRouter);

// Ruta para vistas
app.get('/products', (req, res) => {
    res.render('index', { title: 'Productos', products });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

// Configurar eventos de Socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado.');

    // Enviar la lista inicial de productos al cliente
    socket.emit('updateProducts', products);

    // Escuchar cuando se crea un nuevo producto
    socket.on('newProduct', (product) => {
        products.push(product);
        io.emit('updateProducts', products); // Actualizar lista en todos los clientes
    });

    // Escuchar cuando se elimina un producto
    socket.on('deleteProduct', (productId) => {
        const productIndex = products.findIndex((prod) => prod.id === productId);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            io.emit('updateProducts', products); // Actualizar lista en todos los clientes
        }
    });
});

// Iniciar servidor
const PORT = 9090;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
