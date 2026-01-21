const sequelize = require('./server/db/sequelize');
const fs = require('fs');

async function inspect() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SELECT * FROM api_main_product LIMIT 1');
        if (results.length > 0) {
            const keys = Object.keys(results[0]);
            console.log('Keys:', keys);
            fs.writeFileSync('schema.txt', JSON.stringify(keys, null, 2));
            fs.writeFileSync('sample_row.txt', JSON.stringify(results[0], null, 2));
        } else {
            console.log('Empty table');
            const [desc] = await sequelize.query('DESCRIBE api_main_product');
            fs.writeFileSync('schema.txt', JSON.stringify(desc, null, 2));
        }
    } catch (err) {
        console.error(err);
        fs.writeFileSync('schema.txt', 'Error: ' + err.message);
    } finally {
        await sequelize.close();
    }
}

inspect();
