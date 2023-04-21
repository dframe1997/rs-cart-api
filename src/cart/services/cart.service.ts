import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from 'src/constants';

import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';

@Injectable()
export class CartService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async getAllCarts(): Promise<Cart[]> {
    try {
      const data = await this.conn.query(`SELECT * FROM carts`, null);
      
      return data.rows;
    }
    catch (e) {
      return e
    }
  }

  async findByUserId(userId: string): Promise<Cart> {
    try {
      const cartData = await this.conn.query(`
        SELECT * FROM carts
        WHERE user_id = '${userId}'`
      , null);
      
      const cart = cartData.rows.length > 0 ? cartData.rows[0] : null;

      if(cart){
        const cartItemData = await this.conn.query(`
          SELECT * FROM cart_items
          WHERE cart_id = '${cart.id}'`
        , null);

        const cartItems = cartItemData.rows.length > 0 ? cartItemData.rows : null;
        console.log("CART ITEMS: ", cartItems)
        const res = await fetch("https://8s6wue4ha0.execute-api.us-east-1.amazonaws.com/products")
        const products = await res.json();
        const cartItemsWithPrices = cartItems.map(item => {
          return {
            count: item.count,
            product: products.find(p => p.id === item.product_id)
          }
        })

        return { id: cart.id, items: cartItemsWithPrices }
      }

      return null;
    }
    catch (e) {
      return e
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    try {
      const date = new Date().toDateString();
      // console.log(date);
      const data = await this.conn.query(`INSERT INTO carts (created_at, updated_at, user_id, id) VALUES (${date}, ${date}, ${userId}, ${v4(v4())})`, null);
      // console.log(data)
      return data.rows.length > 0 ? data.rows[0] : null;
    }
    catch (e) {
      return e
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      console.log("FOUND USER!")
      return userCart;
    }

    console.log("CREATED USER!")
    return await this.createByUserId(userId);
  }

  async getCartItems(cart: Cart): Promise<CartItem[]> {
    const cartItemData = await this.conn.query(`
      SELECT * FROM cart_items
      WHERE cart_id = '${cart.id}'`
    , null);

    return cartItemData.rows.length > 0 ? cartItemData.rows : null;
  }

  async updateByUserId(userId: string, item: CartItem): Promise<Cart> {
    // If not already in basket, insert into
    // Update the count if the product is already in the cart
    const cart = await this.findByUserId(userId);
    const productsAlreadyInCart = await this.getCartItems(cart);
    console.log("PROD IN CART: ", productsAlreadyInCart)
    console.log("CART: ", cart);
    console.log("ITEM: ", item)

    const thisProduct = productsAlreadyInCart.find(p => p.product_id === item.product.id);
    console.log("THIS PRODUCT: ", thisProduct)
    if(thisProduct){
      console.log("COUNT: ", item.count)
      // The error is here, for some reason this SQL is invalid
      const updated = await this.conn.query(`
        UPDATE cart_items
        SET count = ${item.count}   
        WHERE cart_id = '${cart.id}' AND product_id = '${item.product.id}'`,
      null);

      console.log("UPDATED: ", updated);
    }
    else {
      // The error is here, for some reason this SQL is invalid
      const inserted = await this.conn.query(`
        INSERT INTO cart_items (product_id, count, cart_id)
        VALUES ('${item.product.id}', ${item.count}, '${cart.id}')`,
      null);

      console.log("INSERTED: ", inserted)
    }
    
    return cart;
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.conn.query(`
      DELETE FROM carts
      WHERE user_id = '${userId}'`,
    null);
    const cart_items = await this.conn.query(`
      DELETE FROM cart_items
      WHERE cart_id = '${cart.id}'`,
    null);
  }
}
