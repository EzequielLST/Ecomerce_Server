import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import mongoose from 'mongoose'; // Importa mongoose para la conexión
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.log('Error al conectar a MongoDB:', err));

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
app.use('/static', express.static(path.join(__dirname, 'public'))); // Archivos estáticos

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

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
const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
