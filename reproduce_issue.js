
const run = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/statement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessLocation: 'GK',
                department: '관리',
                year: 2026,
                month: 1,
                categories: []
            })
        });
        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
};

run();
