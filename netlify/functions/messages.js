const AIRTABLE_BASE = 'appWHz2387I5X9M72';
const AIRTABLE_TABLE = 'tblRXaZY33wi2lGRl';
const TOKEN = process.env.AIRTABLE_TOKEN || 'patR8Q4zzK9DsKVn3.4eaf62392bbc92caa8d945704d86140fbc9f408a678a2a10d850391713656797';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET — lire les messages publiés
  if (event.httpMethod === 'GET') {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?filterByFormula={Status}='Publié'&sort[0][field]=Date&sort[0][direction]=desc`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const data = await res.json();
    const messages = (data.records || []).map(r => r.fields.Message).filter(Boolean);
    return { statusCode: 200, headers, body: JSON.stringify({ messages }) };
  }

  // POST — envoyer un nouveau message
  if (event.httpMethod === 'POST') {
    const { message } = JSON.parse(event.body || '{}');
    if (!message || message.length < 10) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message trop court' }) };
    }
    await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: [{ fields: { Message: message, Date: new Date().toISOString(), Status: 'En attente' } }]
        })
      }
    );
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: 'Method not allowed' };
};
