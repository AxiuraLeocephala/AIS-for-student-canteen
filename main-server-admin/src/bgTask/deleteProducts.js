import { Reset, fgPurple } from "../utils/colorsConsole.js";
import sagaCoordinator from "../services/_sagaCoordinator.js"

function processDeleteProducts() {
    const objDate = new Date();
    const currentTimeUTCMS = objDate.getTime();
    const tomorrowTimeUTCMS = Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate() + 1, 23, 50, 0)
    const delay = tomorrowTimeUTCMS - currentTimeUTCMS;

    setInterval(() => {
        sagaCoordinator.cancelStuckOrder();
    }, delay);
}

export default processDeleteProducts;