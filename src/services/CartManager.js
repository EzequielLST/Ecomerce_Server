import fs from 'fs/promises';
import path from 'path';

const cartFilePath = path.resolve('data', 'cart.json');

export default class CartManager {
    
    constructor() {
        this.cart = [];
        this.init()
    }
    async init() {
        try {
            const data = await fs.readFile(cartFilePath, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            this.cart = [];
        }
    }
    async saveToFile() {
        try {
            await fs.writeFile(cartFilePath, JSON.stringify(this.cart, null, 2));
        } catch (error) {
            console.error(error);
        }
    }

    //crear carrito
    async addCart() {
        const newCart = {
            id: this.cart.length ? this.cart[this.cart.length - 1].id + 1 : 1, // Generar un ID único.
            products: [] // Inicializar con un array vacío.
        };
        this.cart.push(newCart);
        await this.saveToFile();
        return newCart;
    }
    

    //list carrito por ID
    async getCartById(id) {
        return this.cart.find(cart => cart.id === id); // Corregido el uso del campo.
    }

    
    
    //agregar id y cantidad del producto al carrito
    async addProductToCart(cid, pid) {
        const cart = this.cart.find(cart => cart.id === cid);
    
        if (!cart) {
            throw new Error(`El carrito con ID ${cid} no existe`);
        }
    
        const productInCart = cart.products.find(product => product.id === pid);
    
        if (productInCart) {
            productInCart.quantity += 1; // Incrementar cantidad si ya existe.
        } else {
            cart.products.push({ id: pid, quantity: 1 }); // Agregar nuevo producto si no existe.
        }
    
        await this.saveToFile(); 
        return cart;
    }


}