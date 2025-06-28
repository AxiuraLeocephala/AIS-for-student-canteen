import dbService from "./../services/dbService.js";

async function GenIdOrder() {
    const maxOrders = 50;
    let nextId = null;

    let existingIds = await dbService.getOrderId();

    existingIds = existingIds.map(row => row.OrderId) 

    for (let i = 1; i <= maxOrders; i++) {
        const id = String(i).padStart(4, '0')
        if (!existingIds.includes(id)) {
            nextId = id;
            break;
        }
    }
    console.log(nextId);
    if (!nextId) {
        const lastId = existingIds[existingIds.length - 1];
        console.log(lastId);
        const lastNum = String(parseInt(lastId) + 1);
        console.log(lastNum);
        nextId = lastNum.padStart(4, '0');
        console.log(nextId)
    }

    return nextId;
}

export default GenIdOrder;