import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ message: 'No file found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Environment variables
    const endpoint = import.meta.env.RUSTFS_ENDPOINT;
    const accessKeyId = import.meta.env.RUSTFS_ACCESS_KEY;
    const secretAccessKey = import.meta.env.RUSTFS_SECRET_KEY;
    const bucket = import.meta.env.RUSTFS_BUCKET;
    const publicDomain = import.meta.env.RUSTFS_PUBLIC_DOMAIN;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicDomain) {
      console.error('Missing RUSTFS environment variables');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Needed for some S3-compatible services
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const key = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    const publicUrl = `${publicDomain}/${key}`;

    return new Response(JSON.stringify({ 
      message: 'Upload successful', 
      url: publicUrl 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      message: 'Upload failed', 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
