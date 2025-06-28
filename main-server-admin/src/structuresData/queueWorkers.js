import jwt from 'jsonwebtoken';

import { JWT_KEY } from '../config/serverConfig.js';

class QueueWorkers {
    constructor() {
        this.collection = [];
    }

    addWS = function(token, client) {
        this.collection.push({token, client});
    }

    removeWS = function(ws) {
        this.collection.splice(this.collection.findIndex(client => client.ws === ws), 1);
    }

    size = function() {
        return this.collection.length
    }

    notify = function(data) {
        this.collection.forEach(({token, client}) => {
            client.send(JSON.stringify({
                "contentType": data.contentType,
                "data": data.info
            }));
        })
    }
}

const queueWorkers = new QueueWorkers(); 

export default queueWorkers;