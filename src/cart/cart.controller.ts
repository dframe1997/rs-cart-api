import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus } from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @Get()
  // async getAllCarts() {
  //   const carts = await this.cartService.getAllCarts();

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'OK',
  //     data: carts,
  //   }
  // }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cart = await this.cartService.findOrCreateByUserId(getUserIdFromRequest(req));
    console.log("CART: ", cart)
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
    }
  }

  // @Get()
  // async findByUserId(@Req() req: AppRequest) {
  //   const cart = await this.cartService.findByUserId(getUserIdFromRequest(req));

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'OK',
  //     data: cart,
  //   }
  // }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) { // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(getUserIdFromRequest(req), body)

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      }
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    const res = await this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      res
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const order = this.orderService.create({
      ...body, // TODO: validate and pick only necessary data
      userId,
      cartId,
      items,
      total,
    });
    await this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
