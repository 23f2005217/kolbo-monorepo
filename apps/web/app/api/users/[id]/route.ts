import { NextResponse } from 'next/server';
import { userQueries } from "@kolbo/database";

/**
 * GET /api/users/[id]
 * Fetch a specific user by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    const user = await userQueries.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a specific user
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const user = await userQueries.update(id, body);

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a specific user
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await userQueries.findById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    await userQueries.delete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}
