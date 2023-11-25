import { Router } from 'itty-router';

import { Ai } from "@cloudflare/ai";

export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "AI" with the variable name you defined.
  AI: any;
}



// now let's create a router (note the lack of "new")
const router = Router();

// GET collection index
router.get('/api/todos', () => new Response('Todos Index!'));

// GET item
router.get('/api/todos/:id?/:action?/:arg+', ({ params }) => {
  return Response.json(params)

});

router.get('/api/fy/:source_lang?/:target_lang?/:text+', async (req, env:Env)=>{
  // return Response.json({test:123})
  let p = req.params
  const ai = new Ai(env.AI);
  const inputs = {
    text: p.text || 'Tell me a joke about Cloudflare',
    source_lang:  p.source_lang || 'en',
    target_lang: p.target_lang || 'zh',
  };
  const response = await ai.run('@cf/meta/m2m100-1.2b', inputs);
  let resboody = response.translated_text
  
  return new Response(resboody+'\n')
})

router.post('/api/fy/:from?/:to?', async ( req, env:Env)=>{
  let {from='en', to='zh'} = req.params
  let text = await req.text();

  const ai = new Ai(env.AI);
  const inputs = {
    text,
    source_lang:  from,
    target_lang: to
  };
  let resboody

  const response = await ai.run('@cf/meta/m2m100-1.2b', inputs);
  resboody = response.translated_text
  
  return new Response(resboody+'\n')

  // return new Response(text) 
  return Response.json({text, from, to})
}) 


// POST to the collection (we'll use async here)
router.post('/api/todos', async (request) => {
	const content = await request.text();

	return new Response('Creating Todo: ' + JSON.stringify(content));
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
