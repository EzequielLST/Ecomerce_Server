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
    async addCart(cart){
        const newCart = {
            userId: this.cart.length ? this.cart [this.cart.length -1].id +1 : 1,
            products: this.products.map(product => ({
                id: product.id,
                quantity: product.quantity || 1,
            }))
        };
        this.cart.push(newCart);
        this.saveToFile()
        return newCart
    }

    //list carrito por ID
    async getCartById(id) {
        return this.cart.find(cart => cart.userId === userId);
    }

    
    
    //agregar id y cantidad del producto al carrito
async addProductToCart(userId, productId) {
    const cart = this.cart.find(cart => cart.userId === userId);

    if (!cart) {
        throw new Error(`El carrito con ID ${userId} no existe`);
    }

    const productInCart = cart.products.find(product => product.id === productId);

    if (productInCart) {
        productInCart.quantity += 1; 
        cart.products.push({ id: productId, quantity: 1 }); 
    }

    await this.saveToFile(); 
    return cart;
}


}