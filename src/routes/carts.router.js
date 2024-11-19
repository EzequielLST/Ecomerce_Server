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
        const userId = parseInt(req.params.pid);
        const cart = await cartManager.getCartById(userId);

        if (!cart) {
            return res.status(404).send('carrito no encontrado');
        }

        res.json(cart)
    } catch (error) {
        console.log(error);

    }
})


//agregar id y cantidad del producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params; 
        const updatedCart = await cartManager.addProductToCart(Number(cid), Number(pid)); // Actualiza el carrito
        res.status(200).json(updatedCart); 
    } catch (error) {
        res.status(404).json({ error: error.message }); 
    }
});


export default router;