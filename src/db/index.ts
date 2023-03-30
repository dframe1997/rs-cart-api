import { Pool } from 'pg';
 
const pool = new Pool();
 
export const query = (text, params, callback) => (
    pool.query(text, params, callback)
);