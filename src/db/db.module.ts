import { Module } from '@nestjs/common';
import { PG_CONNECTION } from 'src/constants';
import { Pool } from 'pg';

const dbProvider = {
    provide: PG_CONNECTION,
    useValue: new Pool({
        user: process.env.db_user,
        host: process.env.db_host,
        database: process.env.db_database,
        password: process.env.db_password,
        port: process.env.db_port,
    }),
};

@Module({
    providers: [dbProvider],
    exports: [dbProvider],
})
export class DbModule {}