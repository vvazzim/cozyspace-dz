export const handler = async (event) => {
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
