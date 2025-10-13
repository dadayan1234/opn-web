/**
 * API route for user photo upload
 * Handles POST requests for uploading user profile photos
 */
import type { NextRequest } from 'next/server';
import { handleApiRoute } from '../../../../_helpers/api-route-handler';

// POST /api/v1/uploads/users/[id]/photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    console.log(`Uploading photo for user ${id}...`);

    // Forward to backend with correct endpoint
    const response = await handleApiRoute(
      request,
      `/uploads/users/${id}/photo`,
      {
        timeout: 30000, // longer timeout for file uploads
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error(`Error uploading photo for user ${id}:`, error);
    return new Response(
      JSON.stringify({
        error: 'Failed to upload photo',
        message: 'There was an error connecting to the server',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
