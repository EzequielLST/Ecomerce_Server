import { Router } from 'express';
import Cart from '../services/CartModel.js';
import Product from '../services/ProductModel.js';

const router = Router();

// Crear un carrito
router.post('/', async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'products debe ser un array' });
        }
        const newCart = new Cart({ products });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// Obtener los productos de un carrito
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        // Obtener productos completos usando "populate" para cargar los detalles de cada producto
        const productsInCart = await productManager.getProductsByIds(cart.products.map(p => p.id));

        res.render('cartDetail', { title: 'Carrito de Compras', products: productsInCart });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener el carrito');
    }
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Filtrar el producto a eliminar
        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();

        res.json({ status: 'success', message: 'Producto eliminado del carrito', payload: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'products debe ser un array' });
        }

        const cart = await Cart.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        cart.products = products;
        await cart.save();

        res.json({ status: 'success', message: 'Carrito actualizado', payload: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.json({ status: 'success', message: 'Cantidad actualizada', payload: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: 'success', message: 'Carrito vacío', payload: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

export default router;
