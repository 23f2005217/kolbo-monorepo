import { NextResponse } from 'next/server';
import { subsiteQueries } from '@kolbo/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const subsite: any = await subsiteQueries.findBySlug(slug);
      
      if (!subsite) {
        return NextResponse.json({ error: 'Subsite not found' }, { status: 404 });
      }
      let thumbnailUrl = null;

      // 1. Try explicit channel thumbnail
      if (subsite.thumbnailStorageBucket && subsite.thumbnailStoragePath) {
        thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${subsite.thumbnailStorageBucket}/${subsite.thumbnailStoragePath}`;
      } 
      // 2. Fallback to latest video thumbnail
      // 2. Fallback to latest available video thumbnail
      // 2. Fallback to latest available video thumbnail
      else if (subsite.videos && subsite.videos.length > 0) {
        let bestCandidateUrl = null;
        let foundPublicMux = false;

        for (const video of subsite.videos) {
            // 2a. Priority 1: Stored image (horizontal/hero)
            let image = video.images?.find((img: any) => img.imageType === 'horizontal' || img.imageType === 'hero');
            if (!image && video.images?.length > 0) image = video.images[0]; 

            if (image) {
                thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${image.storageBucket}/${image.storagePath}`;
                bestCandidateUrl = thumbnailUrl; // Found best possible, stop searching
                foundPublicMux = true; // Treat as "found best"
                break;
            }

            // 2b. Priority 2: Mux asset with Public Playback ID
            if (!bestCandidateUrl || !foundPublicMux) {
                const publicAsset = video.assets?.find((a: any) => a.muxPublicPlaybackId);
                if (publicAsset) {
                     bestCandidateUrl = `https://image.mux.com/${publicAsset.muxPublicPlaybackId}/thumbnail.jpg?width=1920&fit_mode=preserve`;
                     foundPublicMux = true;
                     // Continue loop only to see if we find a real Image, but we have a good fallback now
                }
            }

            // 2c. Priority 3: Mux asset with ANY Playback ID (fallback if nothing else found)
            if (!bestCandidateUrl) {
                const anyAsset = video.assets?.find((a: any) => a.muxPlaybackId);
                if (anyAsset) {
                    bestCandidateUrl = `https://image.mux.com/${anyAsset.muxPlaybackId}/thumbnail.jpg?width=1920&fit_mode=preserve`;
                }
            }
        }
        if (bestCandidateUrl) {
            thumbnailUrl = bestCandidateUrl;
        }
      }

      return NextResponse.json({
        ...subsite,
        thumbnailUrl
      });
    }

    const all = searchParams.get('all') === 'true';
    const subsites = all
      ? await subsiteQueries.findAllForAdmin()
      : await subsiteQueries.findAll();
    return NextResponse.json(subsites);
  } catch (error) {
    console.error('Error fetching subsites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subsites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, isActive, thumbnailStorageBucket, thumbnailStoragePath, monthlyPrice, fiveDevicesAddonPrice, withAdsDiscount } = body;
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'name and slug are required' },
        { status: 400 }
      );
    }
    const subsite = await subsiteQueries.create({
      name: String(name).trim(),
      slug: String(slug).trim().toLowerCase().replace(/\s+/g, '-'),
      description: description != null ? String(description).trim() || undefined : undefined,
      isActive: isActive !== false,
      thumbnailStorageBucket,
      thumbnailStoragePath,
      monthlyPrice: monthlyPrice != null ? parseInt(String(monthlyPrice), 10) || null : null,
      fiveDevicesAddonPrice: fiveDevicesAddonPrice != null ? parseInt(String(fiveDevicesAddonPrice), 10) || 0 : 0,
      withAdsDiscount: withAdsDiscount != null ? parseInt(String(withAdsDiscount), 10) || 0 : 0,
    });
    return NextResponse.json(subsite, { status: 201 });
  } catch (error) {
    console.error('Error creating subsite:', error);
    return NextResponse.json(
      { error: 'Failed to create subsite' },
      { status: 500 }
    );
  }
}
