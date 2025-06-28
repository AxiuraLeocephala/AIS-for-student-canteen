class QueueMessages {
    constructor() {
        this.collection = [];
    }
    
    enqueue = function(element) {
        this.collection.push(element);
    }

    dequeue = function() {
        return this.collection.shift();
    }

    size = function() {
        return this.collection.length
    }
}

const queueMessages = new QueueMessages();

export default queueMessages