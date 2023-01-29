export interface Env {
  SPOTTY_KV: KVNamespace;
}

async function fetchData({ access_token, market }) {
  const host = 'https://api.spotify.com/';
  const endpoint = 'v1/me/player/currently-playing/';
  const searchParams = new URLSearchParams({ market });

  const response = await fetch(`${host}${endpoint}?${searchParams}`, {
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
  } = env

  const { searchParams } = new URL(request.url)
  let user = searchParams.get('user')
  let market = searchParams.get('market')

  if (market === null) {
    market = 'US'
  }

  if (user === 'aidan') {
    const access_token = await spottyKv.get('access_token_aidan')
    return await fetchData({ access_token, market })
  }

  if (user === 'beno') {
    const access_token = await spottyKv.get('access_token_beno')
    return await fetchData({ access_token, market })
  }

  else {
    init.status = 400
    return JSON.stringify({
      error: {
        status: 400,
        message: "Bad request"
      }
    })
  }
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
