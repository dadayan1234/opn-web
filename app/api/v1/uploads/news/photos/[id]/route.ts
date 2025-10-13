/**
 * API route for news photos
 * Handles PUT and DELETE requests for news photos
 */
import type { NextRequest } from 'next/server';
import { handleApiRoute } from '../../../../_helpers/api-route-handler';

// PUT /api/v1/uploads/news/photos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params - use Promise.resolve to handle async params
    const { id } = await Promise.resolve(params);
    // console.log(`Processing PUT request for updating news photo ${id}`);

    // Forward the request to the backend API using the correct uploads endpoint
    const response = await handleApiRoute(request, `/uploads/news/photos/${id}`, {
      timeout: 30000, // Increase timeout for uploads
      requireAuth: true
    });

    // Check if response is HTML (indicates wrong endpoint/404)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      console.error(`Received HTML response instead of JSON for news photo ${id} update`);
      return new Response(
        JSON.stringify({
          error: 'Invalid API endpoint or server error'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: errorData.error || 'Failed to update news photo',
          status: response.status
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return response;
  } catch (error) {
    // Get the ID safely
    const id = await Promise.resolve(params).then(p => p.id).catch(() => 'unknown');
    console.error(`Error in PUT /uploads/news/photos/${id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to update news photo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/v1/uploads/news/photos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params - use Promise.resolve to handle async params
    const { id } = await Promise.resolve(params);
    // console.log(`Processing DELETE request for news photo ${id}`);

    // Forward the request to the backend API using the correct uploads endpoint
    const response = await handleApiRoute(request, `/uploads/news/photos/${id}/`, {
      timeout: 15000, // Increase timeout for deletes
      requireAuth: true
    });

    // Check if response is HTML (indicates wrong endpoint/404)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      console.error(`Received HTML response instead of JSON for news photo ${id} delete`);
      return new Response(
        JSON.stringify({
          error: 'Invalid API endpoint or server error'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: errorData.error || 'Failed to delete news photo',
          status: response.status
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return response;
  } catch (error) {
    // Get the ID safely
    const id = await Promise.resolve(params).then(p => p.id).catch(() => 'unknown');
    console.error(`Error in DELETE /uploads/news/photos/${id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete news photo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
