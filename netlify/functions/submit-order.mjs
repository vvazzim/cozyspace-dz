const imageErrorResponse = (statusCode, message) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify({ success: false, message })
});

const handleDriveImageProxy = async (event) => {
  const fileId = String(event.queryStringParameters?.imageId || '').trim();

  if (!fileId) {
    return imageErrorResponse(400, 'Missing Google Drive file id');
  }

  const urls = [
    `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`,
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
        }
      });

      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) continue;

      const buffer = Buffer.from(await response.arrayBuffer());

      return {
        statusCode: 200,
        headers: {
          'content-type': contentType,
          'cache-control': 'public, max-age=3600, s-maxage=3600'
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true
      };
    } catch {
      // Try the next candidate URL.
    }
  }

  return imageErrorResponse(502, 'Unable to fetch Google Drive image');
};

export const handler = async (event) => {
  if (event.httpMethod === 'GET' && event.queryStringParameters?.imageId) {
    return handleDriveImageProxy(event);
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      },
      body: JSON.stringify({ success: false, message: 'Use POST for order submission' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const googleScriptUrl =
      process.env.GOOGLE_SCRIPT_URL || process.env.PUBLIC_GOOGLE_SCRIPT_URL || '';

    if (!googleScriptUrl) {
      return {
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        },
        body: JSON.stringify({ success: false, message: 'Missing GOOGLE_SCRIPT_URL' })
      };
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      params.append(key, String(value ?? ''));
    }

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: params.toString(),
      redirect: 'follow'
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        },
        body: JSON.stringify({
          success: false,
          message: `Google Apps Script rejected the request (${response.status})`,
          details: responseText.slice(0, 300)
        })
      };
    }

    let googleResult = null;
    try {
      googleResult = JSON.parse(responseText || '{}');
    } catch {
      googleResult = null;
    }

    if (googleResult && googleResult.success === false) {
      return {
        statusCode: 502,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        },
        body: JSON.stringify({
          success: false,
          message: googleResult.message || 'Google Apps Script returned an error'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      },
      body: JSON.stringify({ success: true, message: 'Order saved' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      },
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
