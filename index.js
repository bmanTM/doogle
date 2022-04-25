import path from 'path';
import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import fetch from 'isomorphic-fetch';
import settings from './config.js';
import predictFromDB from './suggestions.js';
import initializeWS from './websockets.js';
import websockify from 'koa-websocket';
import serve from 'koa-static';
import mount from 'koa-mount';

/* Object definitions */

/*
	Object structure for cacheing an external dataset. This object will update itself every refreshTime minutes
*/
class APICache {
	constructor(dataPath, refreshTime) {
		this.data = null;
		this.lastUpdate = null;
		this.dataPath = dataPath;
		this.refreshTime = refreshTime;
	}

	async update () {
		if (this.data === null || this.lastUpdate === null || (Date.now() - this.lastUpdate)/60000 > this.refreshTime) {
			console.log("Updating API Cache");

			const json = await cacheJson(this.dataPath);
			this.data = json.message;
			this.lastUpdate = Date.now();
			
			console.log("Cache updated");
		}
	}

	/*
		Recursively iterates over data structure.
		Route of data follows sequential data structure routing. AKA, ['parent', ... 'child'].
		In other words, isValid() returns true if the data object is navigatable following the order of 
		keys provided in dataRoute.
		{
			'parent': {
				... ['child']
			}
		}

		or 
		{
			'parent': {
				... 'child': val
			}
		}
	*/
	isValid(dataRoute, pos) {
		let element = dataRoute;
		const position = (pos === undefined ? this.data : pos);

		if (typeof position !== "object" || this.data === null) {
			throw Error("Data not traversable (try running update)")
		}

		if (typeof element === "object") {
			if (!Array.isArray(element)) {
				throw Error("Error parsing data route of object not of type array");
			}
			element = dataRoute.shift();
		}

		if (Array.isArray(position) && position.includes(element) && dataRoute.length == 0) {
			return true
		} else if (position[element] !== undefined) {
			if (typeof dataRoute !== "object" || dataRoute.length == 0) {
				return true;
			}
			return this.isValid(dataRoute, position[element])
		}

		return false;
	}
}

/* Object initializers */
const app = websockify(new Koa());
const router = new Router();
const dogBreedCache = new APICache(settings.dogAPI.apiAll, settings.dogAPI.refreshTime)
initializeWS(app, dogBreedCache);
//Serve frontend:
const frontEndPages = new Koa();
frontEndPages.use(serve("./frontend/build"));
app.use(mount("/", frontEndPages));

/* Functions */
async function fetchResponse(jsonPath) {
	const response = await fetch(jsonPath)
	.then(function(response) {
		if (response.status >= 400) {
			throw new Error("Bad response from server");
		}
		return response;
	})

	return response;
}

/*
	Cached in memory, dataset is small in size.
*/
async function cacheJson(jsonPath){
	const json = await fetchResponse(jsonPath)
		.then(function(response) {
			return response.json();
		})
	
	return json;
}

/*
	takes a breed and (if provided) sub-breed and returns a random image of this specified dog 
	(if breed is valid in DogAPI's list of all breeds, cached locally)
*/
async function getRanDogImage(ctx) {
	const breedRoute = [ctx.params.breed, ...(ctx.params.subbreed !== undefined ? [ctx.params.subbreed] : [])];

	if (!dogBreedCache.isValid([...breedRoute]) && dogBreedCache.isValid(ctx.params.breed)) {
		ctx.redirect(path.join(settings.apiRoute, "dog", ctx.params.breed));
	} else {
		const dogAPIpath = `${settings.dogAPI.apiRoot}/breed/${breedRoute.join('/')}/images/random`;
		console.log(dogAPIpath);
		try {
			const imageFetch = await cacheJson(dogAPIpath);
			ctx.body = imageFetch;
		} catch (e) {
			ctx.status=404;
		}
	}
}

/*
	Function for redirecting a search query (I.E "terrier american") into its associated
	getRanDogImage breed and subbreed route. If no match is found, a status of 400 is returned
	with a suggestion set of 10 closest available options to your query.

	Note: order of query is not important, its looking for the existence of breed and subbreed in
	query, not necessarily which comes first. Aka 'terrier american' and 'american terrier' will
	return same result.
*/
function dogQueryRedirect(ctx) {
	let query = ctx.params.query;

	query = query.trim().replace(/[^\x00-\x7F]/g, "");
	let queryWords = query.split('_');
	const queryWordCount = queryWords.length;
	let breedSearch = {};
	let dropIndices = [];

	for (let i = 0; i < queryWords.length; i++) {
		const word = queryWords[i]; 
		if (dogBreedCache.isValid(word)) {
			if (breedSearch[word] === undefined) {
				breedSearch[word] = [];
			}
			dropIndices.push(i);
		}
	}
	for (const i of dropIndices) {
		queryWords.splice(i, 1);
	}

	for (const breed in breedSearch) {
		for (const subbreed of queryWords) {
			console.log(subbreed)
			if (dogBreedCache.isValid([breed, subbreed])) {
				breedSearch[breed].push(subbreed);
			}
		}
	}

	/* Priority of search:
		Find direct match, aka perfect breed: ['single sub breed']
		if unable to find perfect match, go for match with max number of sub breed matches
	*/
	let breedMatch;
	let maxBreedMatch;
	let maxLength = 0;

	if (queryWordCount > 1) {
		for (const breed in breedSearch) {
			const subBreedLength = breedSearch[breed].length;

			if (breedMatch === undefined) {
				if (subBreedLength === 1) {
					breedMatch = breed;
				}
			}

			if (subBreedLength > maxLength) {
				maxBreedMatch = breed;
				maxLength = subBreedLength;
			}
		}
	} else if (Object.keys(breedSearch).length > 0){
		breedMatch=Object.keys(breedSearch)[0];
	}

	if (breedMatch === undefined) {
		breedMatch = maxBreedMatch;
	}

	if (breedMatch !== undefined) {
		const redirPath = [breedMatch, ...(breedSearch[breedMatch].length >= 1 ? [breedSearch[breedMatch].shift()] : [])].join('/');
		ctx.redirect(path.join(settings.apiRoute, "dog", redirPath))
	} else {
		ctx.status = 400;
		ctx.body = predictFromDB(ctx.params.query, dogBreedCache.data, 10);
	}
}

async function getRandomActivity(ctx) {
	const activityFetch = await cacheJson(settings.boredAPI.apiRoot.trim("/")+ "/activity");
	ctx.body = activityFetch;
}

await dogBreedCache.update();
console.log("Dog breed API cached!");

/* api path routing */
router.get(path.join(settings.apiRoute,"dog/:breed"), getRanDogImage);
router.get(path.join(settings.apiRoute,"dog/:breed/:subbreed"), getRanDogImage);
router.get(path.join(settings.apiRoute,"redirect/dog/:query"), dogQueryRedirect);
router.get(path.join(settings.apiRoute,"activity/random"), getRandomActivity);


/* Adding middlewear  */
app.use(cors({origin: '*'}));

app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.get('X-Response-Time');
	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await dogBreedCache.update();

	await next();
	const ms = Date.now() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(router.routes());

/* Launch server */
app.listen(settings.port, () => {
	console.log(`Server running on http://localhost:${settings.port}`);
});

export default app;