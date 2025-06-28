import MySql from "./../database/MySQL.js";
import { HOST, PORT, USER, PASSWORD, DATABASE, CONNECTION_LIMIT } from "./../config/dbConfig.js";


class DBService {
    constructor() {
        this.mysql = new MySql({
            host: HOST,
            port: PORT,
            user: USER,
            password: PASSWORD,
            database: DATABASE,
            connectionLimit: CONNECTION_LIMIT
        })
    }

    close() {
        return this.mysql.close()
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

    getCategories() {
        return this.mysql.query(`SELECT * FROM categories`)
    }

    getPriceList(userId) {
        return this.mysql.query(`
            SELECT p.ProductId, p.CategoryId, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductPhoto, b.Quantity, p.Stop
            FROM pricelist p
            LEFT JOIN (
                SELECT b.UserId, jt.ProductId, jt.Quantity
                FROM busket b,
                JSON_TABLE(
                    b.Products,
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId',
                        Quantity INT PATH '$.Quantity'
                    )
                ) AS jt
            ) AS b 
            ON p.ProductId = b.ProductId
            WHERE b.UserId = ?
            UNION
            SELECT p.ProductId, p.CategoryId, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductPhoto, NULL AS Quantity, p.Stop
            FROM pricelist p
            LEFT JOIN (
                SELECT b.UserId, jt.ProductId
                FROM busket b,
                JSON_TABLE(
                    b.Products, 
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId'
                    )
                ) AS jt
            ) AS b 
            ON p.ProductId = b.ProductId
            WHERE b.ProductId IS NULL`, [userId]
        )
    }

    getBusket(userId) {
        return this.mysql.query(`
            SELECT p.ProductId, p.CategoryId, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductPhoto, b.Quantity, p.Stop
            FROM pricelist p
            LEFT JOIN (
                SELECT b.UserId, jt.ProductId, jt.Quantity
                FROM busket b,
                JSON_TABLE(
                    b.Products,
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId',
                        Quantity INT PATH '$.Quantity'
                    )
                ) AS jt
            ) AS b 
            ON p.ProductId = b.ProductId
            WHERE b.UserId = ?`, [userId]
        );
    }

    addToBusket(productId, userId) {
        return this.mysql.query(`
            UPDATE busket b 
            JOIN pricelist p 
            ON p.ProductId = '?'
            SET b.Products = JSON_ARRAY_APPEND(
                b.Products,
                '$',
                JSON_OBJECT('ProductId', '?', 'Quantity', 1, 'MaxQuantity', p.MaxQuantity)
            )
            WHERE b.UserId = ?`, 
            [productId, productId, userId]
        );
    }

    inscreaseQuantity(productId, userId) {
        return this.mysql.query(`
            UPDATE busket b1
            JOIN (
                SELECT b0.UserId, jt.ProductId, jt.Quantity, jt.MaxQuantity
                FROM busket b0,
                JSON_TABLE(
                    b0.Products,
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId',
                        Quantity INT PATH '$.Quantity',
                        MaxQuantity INT PATH '$.MaxQuantity'
                    )
                ) AS jt
                WHERE b0.UserId = ? AND jt.ProductId = ?
            ) AS b2 
            ON b1.UserId = b2.UserId
            SET b1.Products = JSON_SET(
                b1.Products,
                REPLACE(JSON_UNQUOTE(JSON_SEARCH(Products, 'one', ?, NULL, '$[*].ProductId')), '.ProductId', '.Quantity'),
                CASE
                    WHEN b2.Quantity < b2.MaxQuantity THEN b2.Quantity + 1
                    ELSE b2.Quantity
                END
            )
            WHERE b1.UserId = ?`, 
            [userId, productId, productId, userId]
        );
    }

    updateBusketReduce(productId, userId, connection) {
        return this.mysql.query(`
            UPDATE busket b1
            JOIN (
                SELECT b0.UserId, jt.ProductId, jt.Quantity, jt.MaxQuantity
                FROM busket b0,
                JSON_TABLE(
                    b0.Products,
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId',
                        Quantity INT PATH '$.Quantity',
                        MaxQuantity INT PATH '$.MaxQuantity'
                    )
                ) AS jt
                WHERE b0.UserId = ? AND jt.ProductId = '?'
            ) AS b2 
            ON b1.UserId = b2.UserId
            SET b1.Products = JSON_SET(
                b1.Products,
                REPLACE(JSON_UNQUOTE(JSON_SEARCH(Products, 'one', '?', NULL, '$[*].ProductId')), '.ProductId', '.Quantity'),
                CASE
                    WHEN b2.Quantity > 0 THEN b2.Quantity - 1
                    ELSE 0
                END
            )
            WHERE b1.UserId = ?`, [userId, productId, productId, userId], connection
        )
    }

    getQuantityProductsInBusket(productId, userId, connection) {
        return this.mysql.query(`
            SELECT jt.Quantity
            FROM busket b0,
            JSON_TABLE(
                b0.Products,
                '$[*]' COLUMNS (
                    ProductId INT PATH '$.ProductId',
                    Quantity INT PATH '$.Quantity'
                )
            ) AS jt
            WHERE b0.UserId = ? AND jt.ProductId = '?'`, [userId, productId], connection
        )
    }

    updateBusketRemoveProduct(productId, userId, connection) {
        return this.mysql.query(`
            UPDATE busket
            SET Products = JSON_REMOVE(
                Products,
                REPLACE(JSON_UNQUOTE(JSON_SEARCH(Products, 'one', '?', NULL, '$[*].ProductId')), '.ProductId', '')
            )
            WHERE UserId = ?`, [productId, userId], connection
        )
    }

    getOrderInfo(userId) {
        return this.mysql.query(`
            SELECT p.ProductId, p.ProductPrice, b.Quantity, p.Stop
            FROM pricelist p
            JOIN (
                SELECT b0.UserId, jt.ProductId, jt.Quantity
                FROM busket b0,
                JSON_TABLE(
                    b0.Products,
                    '$[*]' COLUMNS (
                        ProductId INT PATH '$.ProductId',
                        Quantity INT PATH '$.Quantity'
                    )
                ) AS jt
            ) AS b
            ON p.ProductId = b.ProductId
            WHERE b.UserId = ?`, [userId]
        );
    }

    makeOrder(userId) {
        return this.mysql.query(`
            SELECT jt.ProductId, jt.Quantity, p.ProductName, p.ProductPrice
            FROM busket b,
            JSON_TABLE(
                b.Products,
                '$[*]' COLUMNS (
                    ProductId INT PATH '$.ProductId',
                    Quantity INT PATH '$.Quantity'
                )
            ) AS jt
            JOIN pricelist p 
            ON jt.ProductId = p.ProductId
            WHERE b.UserId = ?`, 
            [userId]
        )
    }

    createOrder(orderId, userId, products, paymentMethod, codeReceive, currentDateTimeMySQLFormat) {
        return Promise.allSettled([
            this.mysql.query(
                `INSERT INTO orders
                (OrderId, UserId, Products, PaymentMethod, CodeReceive, Status, DateTime)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [orderId, userId, JSON.stringify(products), paymentMethod, codeReceive, "confirmation", currentDateTimeMySQLFormat]
            ),
            this.mysql.query(
                `UPDATE busket SET Products='[]'`
            )
        ])
    }

    cancelOrder(orderId, userId) {
        return this.mysql.query(`
            DELETE FROM orders 
            WHERE OrderId=? AND UserId=?`,
            [orderId, userId]
        )
    }

    getCodeReceive(codeReceive) {
        return this.mysql.query(
            `SELECT CodeReceive 
            FROM orders 
            WHERE CodeReceive = ?`, [codeReceive]
        );
    }

    getOrderId() {
        return this.mysql.query(`SELECT OrderId FROM orders`);
    }

    getSystemParameters() {
        return this.mysql.query("SELECT * FROM system_parameters");
    }

    getJTI(jti) {
        return this.mysql.query('SELECT JTI FROM jwt_whitelist WHERE JTI = ?', [jti]);
    }
}

const dbService = new DBService();

export default dbService