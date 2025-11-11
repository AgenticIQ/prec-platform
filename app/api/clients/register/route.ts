// API Route: Client Registration
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { notificationService } from '@/lib/services/notificationService';
import { followUpBossService } from '@/lib/services/followUpBossService';
import bcrypt from 'bcryptjs';
import { Client } from '@/lib/types';
import { CLIENT_EXPIRY_DAYS } from '@/lib/constants/compliance';

/**
 * Generate random password
 */
function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate unique username from email
 */
function generateUsername(email: string, name: string): string {
  const emailPrefix = email.split('@')[0];
  const namePrefix = name.toLowerCase().replace(/\s+/g, '');
  const random = Math.floor(Math.random() * 1000);
  return `${namePrefix}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, searchName, acceptedTOU } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!acceptedTOU) {
      return NextResponse.json(
        { success: false, error: 'You must accept the Terms of Use' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Generate username and temporary password
    const username = generateUsername(email, name);
    const temporaryPassword = generatePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Calculate expiry date (90 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CLIENT_EXPIRY_DAYS.DEFAULT);

    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name,
        email,
        phone,
        username,
        password_hash: passwordHash,
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        accepted_tou: true,
        accepted_tou_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (clientError) {
      throw new Error(clientError.message);
    }

    // Create initial saved search if provided
    if (searchName) {
      await supabase.from('saved_searches').insert({
        client_id: client.id,
        name: searchName,
        active: true,
      });
    }

    // Log activity
    await supabase.from('client_activity').insert({
      client_id: client.id,
      action: 'registered',
      details: 'Client account created',
    });

    // Send welcome email with credentials
    const clientData: Client = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      username: client.username,
      createdAt: new Date(client.created_at),
      expiryDate: new Date(client.expiry_date),
      status: client.status,
      acceptedTOU: client.accepted_tou,
      acceptedTOUDate: client.accepted_tou_date ? new Date(client.accepted_tou_date) : undefined,
      notificationPreferences: {
        email: client.notification_email,
        sms: client.notification_sms,
        frequency: client.notification_frequency,
      },
    };

    // Send welcome email to client
    await notificationService.sendWelcomeEmail(clientData, temporaryPassword);

    // Send admin notification about new registration
    await notificationService.sendAdminNewClientNotification(clientData);

    // Create lead in Follow Up Boss CRM
    await followUpBossService.createLead(clientData, {
      source_detail: 'Website Client Portal Registration',
      initial_search: searchName || 'Not specified',
    });

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        username: client.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
