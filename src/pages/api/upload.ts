import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const POST: APIRoute = async (context) => {
  try {
    const { request } = context;
    const requestAny = request as any;

    // Debug: Log context keys and potential geo info
    console.log('API Context Keys:', Object.keys(context));
    // Astro 本身的 context 通常不包含 geo，但在某些适配器中可能会直接注入到 locals 或 request 上
    console.log('Astro.locals:', JSON.stringify(context.locals || {}, null, 2));

    // 检查是否有 EdgeOne 特有的属性注入到 context 或 request
    const contextAny = context as any;
    if (contextAny.geo) {
      console.log('Found context.geo:', JSON.stringify(contextAny.geo, null, 2));
    }
    if (requestAny.eo) {
      console.log('Found request.eo:', JSON.stringify(requestAny.eo, null, 2));
    }

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
