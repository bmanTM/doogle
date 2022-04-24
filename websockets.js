import Router from '@koa/router'; 
import predictFromDB from './suggestions.js';

let dogDB = undefined;

async function suggestionGenerator(ctx, next) {
    ctx.websocket.on('message', function(message) {
        ctx.websocket.send(JSON.stringify(predictFromDB(message.toString(), dogDB.data, 5)));
    })

    return next;
}

function initializeWS(app, dogDBVal) {
    dogDB = dogDBVal;
    const wsRouter = Router();

    wsRouter.get('/api/ws/suggestions/dog', suggestionGenerator)

    app.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());
}

export default initializeWS;