const { ApiMainProduct } = require("./models/material");
const sequelize = require("./db2");

async function check() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const items = await ApiMainProduct.findAll({
            raw: true
        });

        console.log(`Total Items: ${items.length}`);

        const summary = {};
        items.forEach(i => {
            const key = `${i.business_location}|${i.department}`;
            if (!summary[key]) summary[key] = { count: 0, minDate: i.date, maxDate: i.date };
            summary[key].count++;
            if (i.date < summary[key].minDate) summary[key].minDate = i.date;
            if (i.date > summary[key].maxDate) summary[key].maxDate = i.date;
        });

        console.log("Summary by Location/Dept:");
        for (const [key, val] of Object.entries(summary)) {
            console.log(`- ${key}: ${val.count} items. Date Range: ${val.minDate} ~ ${val.maxDate}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
