import queueWorkers from '../structuresData/queueWorkers.js';
import queueMessages from '../structuresData/queueMessages.js';

function processQueueMessages() {
    setInterval(() => {
        while (queueMessages.size() > 0) {
            if (queueWorkers.size() > 0) {
                queueWorkers.notify(queueMessages.dequeue());
            } else {
                break;
            }
        };
    }, 500);
}

export default processQueueMessages;