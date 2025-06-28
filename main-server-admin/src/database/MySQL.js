import mysql from 'mysql2';

class MySql {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) return reject(err)
                resolve(connection);
            });
        });
    }

    startTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    
    releaseTransaction(connection) {
        return connection.release();
    }

    commitTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) return reject(err);
                resolve();
            })
        })
    }

    rollbackTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.rollback(err => {
                if (err) return reject(err);
                resolve();
            })
        })
    }

    query(sql, params, connection) {
        const executor = connection || this.pool;
        return new Promise((resolve, reject) => {
            executor.query(sql, params, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if (err) reject(err);
                resolve("Connection closed");
            })
        })
    }
}

export default MySql