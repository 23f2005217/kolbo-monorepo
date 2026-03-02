import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.SUPABASE_S3_ENDPOINT;
const accessKeyId = process.env.SUPABASE_S3_ACCESS_ID;
const secretAccessKey = process.env.SUPABASE_S3_SECRET;
const region = process.env.SUPABASE_S3_REGION || 'us-west-2';

if (!endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error('S3 configuration missing: SUPABASE_S3_ENDPOINT, SUPABASE_S3_ACCESS_ID, and SUPABASE_S3_SECRET are required');
}

const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export const storageBucket = 'thumbnails';

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: storageBucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construct the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/${key}`;

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: storageBucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export { s3Client };
