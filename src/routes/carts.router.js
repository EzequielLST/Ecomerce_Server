import { Router } from 'express';
import CartManager from '../services/CartManager.js';

const router = Router();

// Vamons a importar una clase Manager - ProductManager.js
const cartManager = new CartManager()

//crear carrito
router.post('/', async (req,res)=> {
    try {
        const { products } = req.body
        if(!Array.isArray(products)){
            return res.status(404).json({ error: 'products debe ser un array'});
        }
        const newCart = await cartManager.addCart({products});
        res.status(202).json(newCart)

        
    } catch (error) {
        console.log(error)
    }

})

//listar carrito
router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json(cart.products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

//agregar id y cantidad del producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params; 
        const updatedCart = await cartManager.addProductToCart(Number(cid), Number(pid));
        res.status(200).json(updatedCart); 
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: error.message }); 
    }
});


export default router;