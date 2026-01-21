const sequelize = require('./server/db/sequelize');

async function inspect() {
    try {
        await sequelize.authenticate();
        //console.log('Connected.');
        const [results] = await sequelize.query('SELECT * FROM api_main_product LIMIT 1');
        if (results.length > 0) {
            console.log('KEYS:', JSON.stringify(Object.keys(results[0])));
            console.log('ROW:', JSON.stringify(results[0]));
        } else {
            console.log('EMPTY TABLE');
            const [desc] = await sequelize.query('DESCRIBE api_main_product');
            console.log('DESC:', JSON.stringify(desc));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
}

inspect();
