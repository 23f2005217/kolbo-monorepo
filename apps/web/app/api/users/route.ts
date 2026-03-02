import { NextResponse } from 'next/server';
import { userQueries } from "@kolbo/database";

/**
 * GET /api/users
 * Fetch all users
 */
export async function GET() {
  try {
    const users = await userQueries.findAll();
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userQueries.findByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    const user = await userQueries.create({
      email: body.email,
      name: body.name || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}
