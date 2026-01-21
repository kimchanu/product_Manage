const { getAllMaterials } = require('./server/services/materialService');
const { ApiMainProduct } = require('./server/models/material');
const fs = require('fs');

async function testIntegration() {
    const logStream = fs.createWriteStream('test_output.txt', { flags: 'a' });
    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    try {
        const businessLocation = "GN"; // Test mapping logic (GN -> 강남사업소)
        const department = "ITS";

        log(`Fetching materials for ${businessLocation} / ${department}...`);
        const materials = await getAllMaterials(businessLocation, department);

        log(`Total materials found: ${materials.length}`);

        // Check for Groupware items
        const gwItems = materials.filter(m => m.source === 'groupware');
        log(`Groupware items found: ${gwItems.length}`);

        if (gwItems.length > 0) {
            log('Sample Groupware Item: ' + JSON.stringify(gwItems[0], null, 2));
        } else {
            log("No groupware items found. Checking raw table count...");
            const count = await ApiMainProduct.count({ where: { business_location: businessLocation, department: department } });
            log(`Raw ApiMainProduct count: ${count}`);
        }

    } catch (err) {
        log('Test failed: ' + err.message);
        log('Stack: ' + err.stack);
    } finally {
        process.exit();
    }
}

testIntegration();
