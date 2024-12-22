import { Router } from 'express';
import ProductManager from '../services/ProductManager.js';
import Product from '../services/ProductModel.js';


const router = Router();

// Vamons a importar una clase Manager - ProductManager.js
const productManager = new ProductManager()


// Todas las APIs
// Listar
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, sort = '', query = '' } = req.query;

    // Configurar parámetros de paginación y búsqueda
    const queryObj = query ? { category: query } : {};
    const sortObj = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    try {
        const products = await productManager.getPaginatedProducts(
            page,
            limit,
            queryObj,
            sortObj
        );

        // Enviar a la vista con la información de la paginación
        res.render('index', {
            title: 'Productos',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            limit,
            cartId: req.session.cartId // Asumiendo que tienes el carrito en la sesión
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener productos');
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productDetail', { title: product.title, product });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener el producto');
    }
});


// Crear un producto
router.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const { title, description, code, price, stock, category, thumbnails } = req.body
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
        }

        const newProduct = await productManager.addProduct({ title, description, code, price, stock, category, thumbnails });

        res.status(201).json(newProduct)
    } catch (error) {
        console.log(error);
    }
})


// Actualizar un producto por id
router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        const updatedProduct = await productManager.updateProduct(productId, req.body);
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.log(error);
    }
})

// Eliminar un producto por id
router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            res.json(deletedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.log(error);
    }
})

export default router;