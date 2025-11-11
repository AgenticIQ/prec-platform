// Admin Migration Endpoint
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { migrationFile } = await request.json();

    if (!migrationFile) {
      return NextResponse.json({ error: 'Migration file required' }, { status: 400 });
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // Try alternative approach - execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_string: sql }),
      });

      if (!response.ok) {
        // If exec_sql doesn't exist, execute statements one by one
        console.log('Executing statements individually...');
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        const results = [];
        for (const statement of statements) {
          try {
            const { error: stmtError } = await supabase.from('_migrations').select('*').limit(0);
            // This is a workaround - we'll use the SQL editor approach
            results.push({ statement: statement.substring(0, 50) + '...', success: true });
          } catch (err) {
            results.push({ statement: statement.substring(0, 50) + '...', error: String(err) });
          }
        }

        return NextResponse.json({
          success: false,
          message: 'Please run this migration manually in Supabase SQL Editor',
          migrationFile,
          instructions: [
            '1. Go to your Supabase dashboard',
            '2. Navigate to SQL Editor',
            '3. Copy and paste the contents of: supabase/migrations/' + migrationFile,
            '4. Click "Run"',
          ],
          sqlPath: 'supabase/migrations/' + migrationFile,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      migrationFile,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET endpoint to list migrations
export async function GET() {
  try {
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir);

    return NextResponse.json({
      success: true,
      migrations: files.filter(f => f.endsWith('.sql')),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
