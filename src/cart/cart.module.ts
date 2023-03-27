import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';


@Module({
  imports: [ 
    OrderModule,
    DbModule, 
  ],
  providers: [ CartService ],
  controllers: [ CartController ]
})
export class CartModule {}
