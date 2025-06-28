import dbService from "./../services/dbService.js";

async function CheckStopProducts(products, userId) {
    let flag = false;
    const connection = await dbService.getConnection();
    await dbService.startTransaction(connection);
    try {
        for (let id=0; id < products.length; id++) {
            if (products[id]["Stop"] === 1 && products[id]["Quantity"] !== null) {
                flag = true;
                await dbService.updateBusketRemoveProduct(products[id]["ProductId"], userId, connection)
                products[id]["Quantity"] = 0;
            }
        }
        await dbService.commitTransaction(connection);
    } catch(error) {
        await dbService.rollbackTransaction(connection);
        throw error
    } finally {
        dbService.releaseTransaction(connection);
    }

    return products, flag
}

export default CheckStopProducts;