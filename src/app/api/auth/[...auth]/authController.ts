import { query } from '../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Debug db client
console.log('Database client loaded in authController');

// Environment variables
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID is not set in environment variables');
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Types
interface User {
  id: number;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  google_id?: string;
}

// Helper functions
async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return result.rows[0] || null;
}

async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const queryText = `
    INSERT INTO users (email, password, full_name, role, google_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, full_name, role
  `;
  const values = [
    userData.email,
    userData.password,
    userData.full_name,
    userData.role || 'user',
    userData.google_id
  ];
  const result = await query(queryText, values);
  return result.rows[0];
}

async function updateUserGoogleId(userId: number, googleId: string): Promise<void> {
  await query(
    'UPDATE users SET google_id = $1 WHERE id = $2',
    [googleId, userId]
  );
}

function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

// Auth functions
export const register = async (req: NextRequest) => {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      email,
      password: hashedPassword,
      full_name: fullName,
      role: 'user'
    });

    return new Response(JSON.stringify({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role
      }
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Registration failed' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const login = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = generateToken(user);

    return new Response(JSON.stringify({
      message: 'Login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name, 
        role: user.role 
      },
      token,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const googleLogin = async (req: NextRequest) => {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return new Response(JSON.stringify({ error: 'Google credential is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!GOOGLE_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Google Client ID is not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid Google token payload' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { sub: googleId, email, name } = payload;
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email not provided by Google' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for existing user by Google ID first
    let user = await findUserByGoogleId(googleId);
    
    if (!user) {
      // If no user with Google ID, check by email
      user = await findUserByEmail(email);
      
      if (user) {
        // User exists but hasn't logged in with Google before
        await updateUserGoogleId(user.id, googleId);
        user.google_id = googleId;
      } else {
        // Create new user with Google auth
        user = await createUser({
          email,
          full_name: name || 'Google User',
          role: 'user',
          google_id: googleId
        });
      }
    }

    const token = generateToken(user);

    return new Response(JSON.stringify({
      message: 'Google login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name, 
        role: user.role 
      },
      token,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Google login failed' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};