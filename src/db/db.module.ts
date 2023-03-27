import { Module } from '@nestjs/common';
import { PG_CONNECTION } from 'src/constants';
import { Pool } from 'pg';

const dbProvider = {
    provide: PG_CONNECTION,
    useValue: new Pool({
        user: 'postgres',
        host: 'rds-cart-orders.cflntyp35g31.us-east-1.rds.amazonaws.com',
        database: 'rds-cart-orders',
        password: 'pO5#S9795R',
        port: 5432,
    }),
};

@Module({
    providers: [dbProvider],
    exports: [dbProvider],
})
export class DbModule {}