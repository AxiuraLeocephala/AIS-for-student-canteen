import MySql from "./../database/MySQL.js";
import { HOST, PORT, DATABASE, USER, PASSWORD, CONNECTION_LIMIT } from "./../config/dbConfig.js"

class DBService {
    constructor() {
        this.mysql = new MySql({
            host: HOST,
            port: PORT,
            database: DATABASE,
            user: USER,
            password: PASSWORD,
            connectionLimit: CONNECTION_LIMIT
        })
    }

    close() {
        return this.mysql.close();
    }

    getConnection() {
        return this.mysql.getConnection();
    }

    startTransaction(connection) {
        return this.mysql.startTransaction(connection);
    }

    releaseTransaction(connection) {
        return this.mysql.releaseTransaction(connection);
    }

    commitTransaction(connection) {
        return this.mysql.commitTransaction(connection);
    }

    rollbackTransaction(connection) {
        return this.mysql.rollbackTransaction(connection);
    }

    customQuery(query) {
        return this.mysql.query(query)
    }

    getJWT(field="*", condition="") {
        return this.mysql.query(`SELECT ${field} FROM jwt_whitelist ${condition}`)
    }

    getOrders(field="*", condition="") {
        return this.mysql.query(`SELECT ${field} FROM orders ${condition}`);
    }

    getPriceList(field="*", condition="") {
        return this.mysql.query(`SELECT ${field} FROM pricelist ${condition}`)
    }

    getSystemParameters(field="*", condition="") {
        return this.mysql.query(`SELECT ${field} FROM system_parameters ${condition}`)
    }

    updateSystemParameters(value, condition="") {
        return this.mysql.query(`UPDATE system_parameters ${value} ${condition}`)
    }

    deleteWorkers(condition="") {
        return this.mysql.query(`DELETE FROM workers ${condition}`)
    }

    getWorkers(field="*", condition="") {
        return this.mysql.query(`SELECT ${field} FROM workers ${condition}`)
    }

    updateWorkers(value, condition="") {
        return this.mysql.query(`UPDATE workers SET ${value} ${condition}`)
    }

    setWorkers(field, value) {
        return this.mysql.query(`INSERT INTO workers (${field}) VALUE (${value})`)
    }

    acceptOrder(orderId, userId, connection) {
        return this.mysql.query(`UPDATE orders SET Status="assembly" WHERE OrderId=? AND UserId=?`, [orderId, userId], connection)
    }
    
    async moveOrderHistory(orderId, userId, status, connection) {
        const [order] = await this.mysql.query(`SELECT * FROM orders WHERE OrderId=? AND UserId=?`, [orderId, userId], connection)

        return this.mysql.query(`
            INSERT INTO history
            (OrderId, UserId, Products, PaymentMethod, CodeReceive, Status, MessageId, DateTime) 
            VALUE (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                order.OrderId, order.UserId, JSON.stringify(order.Products), order.PaymentMethod, 
                order.CodeReceive, status, order.MessageId, order.DateTime
            ],
            connection
        )
    }

    async moveOrderStuck(order, connection) {
        return this.mysql.query(`
            INSERT INTO history
            (OrderId, UserId, Products, PaymentMethod, CodeReceive, Status, MessageId, DateTime) 
            VALUE (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                order.OrderId, order.UserId, JSON.stringify(order.Products), order.PaymentMethod, 
                order.CodeReceive, order.Status, order.MessageId, order.DateTime
            ],
            connection
        )
    }

    deleteOrder(orderId, userId, connection){
        return this.mysql.query(`
            DELETE FROM orders
            WHERE OrderId=? AND UserId=?`, 
            [orderId, userId],
            connection
        )
    }

    completedOrder(orderId, userId) {
        return this.mysql.query(`
            UPDATE orders
            SET Status="awaitingDelivery"
            WHERE OrderId=? AND UserId=?`, 
            [orderId, userId]
        )
    }

    changeShutdownTime(time) {
        return this.mysql.query("UPDATE system_parameters SET ShutdownTime=?", [time])
    }
}

const dbService = new DBService();

export default dbService