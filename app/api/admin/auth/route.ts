import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  removeAuthCookie,
} from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validations';
import { getCurrentAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { mongoConnectErrorResponse } from '@/lib/mongo-connect-hint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'check') {
      const admin = await getCurrentAdmin();
      if (!admin) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        admin: { username: admin.username, adminId: admin.adminId },
      });
    }

    await connectDB();

    if (action === 'login') {
      const { username, password } = adminLoginSchema.parse(body);
      const loginId = username.trim();
      const emailRegex = new RegExp(
        `^${loginId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i'
      );
      const admin = await Admin.findOne({
        $or: [{ username: loginId }, { email: emailRegex }],
      });
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      const isPasswordValid = await verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();
      
      // Generate token
      const token = generateToken({
        username: admin.username,
        adminId: admin._id.toString(),
      });
      
      // Set cookie
      await setAuthCookie(token);
      
      return NextResponse.json({
        success: true,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
        },
      });
    }
    
    if (action === 'logout') {
      await removeAuthCookie();
      return NextResponse.json({ success: true });
    }
    
    if (action === 'register') {
      return NextResponse.json(
        { error: 'Registration is disabled. Use the configured admin account.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Auth error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const mongo = mongoConnectErrorResponse(error);
    if (mongo) {
      return NextResponse.json(mongo.body, { status: mongo.status });
    }

    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
