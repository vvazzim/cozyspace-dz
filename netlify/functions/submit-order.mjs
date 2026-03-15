export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const payload = await request.json();
    const googleScriptUrl =
      process.env.GOOGLE_SCRIPT_URL || process.env.PUBLIC_GOOGLE_SCRIPT_URL || '';

    if (!googleScriptUrl) {
      return new Response(JSON.stringify({ success: false, message: 'Missing GOOGLE_SCRIPT_URL' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      params.append(key, String(value ?? ''));
    }

    await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
};
