export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const googleScriptUrl =
      process.env.GOOGLE_SCRIPT_URL || process.env.PUBLIC_GOOGLE_SCRIPT_URL || '';

    if (!googleScriptUrl) {
      return {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Missing GOOGLE_SCRIPT_URL' })
      };
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      params.append(key, String(value ?? ''));
    }

    await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
