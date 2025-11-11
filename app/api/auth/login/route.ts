// API Route: Client Portal Login
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Find client by username
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if client is active
    if (client.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active. Please contact your realtor.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, client.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await supabase
      .from('clients')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', client.id);

    // Log activity
    await supabase.from('client_activity').insert({
      client_id: client.id,
      action: 'login',
      details: 'Client logged in',
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: client.id,
        username: client.username,
        email: client.email,
        type: 'client',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        username: client.username,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
