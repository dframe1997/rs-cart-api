import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from 'src/constants';

import { v4 } from 'uuid';

import { Cart } from '../models';

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
      const data = await this.conn.query(`
        SELECT * FROM carts JOIN cart_items
        ON carts.id = cart_items.cart_id
        WHERE user_id = ${userId}`
      , null);
      console.log("CART: ", data)
      
      return data.rows.length > 0 ? data.rows[0] : null;
    }
    catch (e) {
      return e
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    try {
      const date = new Date().toDateString();
      console.log(date);
      const data = await this.conn.query(`INSERT INTO carts (created_at, updated_at, user_id, id) VALUES (${date}, ${date}, ${userId}, ${v4(v4())})`, null);
      console.log(data)
      return data.rows.length > 0 ? data.rows[0] : null;
    }
    catch (e) {
      return e
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    try {
      const data = await this.conn.query(`
        UPDATE carts JOIN cart_items
        ON carts.id = cart_items.cart_id
        SET (items) VALUES (${items})
        WHERE carts.user_id = ${userId}`,
      null);
      
      return data.rows.length > 0 ? data.rows[0] : null;
    }
    catch (e) {
      return e
    }
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.conn.query(`
      DELETE FROM carts
      WHERE user_id = ${userId}`,
    null);
    const cart_items = await this.conn.query(`
      DELETE FROM cart_items
      WHERE cart_id = ${cart.id}`,
    null);
  }

}
