export interface Env {
  SPOTTY_KV: KVNamespace;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
}

function strings2base64(x, y) {
  const bytes = new TextEncoder().encode(`${x}:${y}`)

  let binary = ''
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
}

async function fetchData({ client_id, client_secret, access_token }) {
  const host = 'https://api.spotify.com/';
  const endpoint = 'v1/me/player/currently-playing';

  const response = await fetch(`${host}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    }
  }).then(async (data) => {
    init.status = data.status
    const json = await data.json();
    return JSON.stringify(json)
  })

  return response;
}

async function handleRequest(request, env) {
  const {
    SPOTTY_KV: spottyKv,
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
  } = env

  const { searchParams } = new URL(request.url)
  let user = searchParams.get('user')

  if (user === 'aidan') {
    const access_token = await spottyKv.get('access_token_aidan')
    return await fetchData({ client_id, client_secret, access_token })
  }

  if (user === 'beno') {
    const access_token = await spottyKv.get('access_token_beno')
    return await fetchData({ client_id, client_secret, access_token })
  }

  else return null
}
let init = {
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
  },
  status: 200
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
    const data = await handleRequest(request, env)
    return new Response(data, init)
	},
};
