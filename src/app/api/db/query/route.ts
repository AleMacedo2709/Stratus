import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { environment } from '@/config/environment';

const pool = new Pool({
  host: environment.database.host,
  port: environment.database.port,
  database: environment.database.name,
  user: environment.database.user,
  password: environment.database.password,
  ssl: environment.isProduction ? {
    rejectUnauthorized: false
  } : undefined
});

export async function POST(request: Request) {
  try {
    const { query, params } = await request.json();
    
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 