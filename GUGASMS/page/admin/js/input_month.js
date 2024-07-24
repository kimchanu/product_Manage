$(document).ready(function(){
    let currentYear = new Date().getFullYear();
    let promises = [];
    for (let i = 1; i <= 12; i++) {
        promises.push(code_init(currentYear, i));
    }
    Promise.all(promises).then(results => {
        let abc = transform(list_month);
    }).catch(error => {
        console.error("Error:", error);
    });
	const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월','11월','12월'],
        datasets: [{
            label: 'TCS',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        },
		{
            label: 'FTMS',
            data: [1,2,3,4],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        },
		{
            label: '전산',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
        },
		{
            label: '기타',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1
        }
	
	]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

});
var list_month = [];

function code_init(year, month){
    var target = group_idx;
    // 예시로 사용할 변수 설정
    var b_class = 'TCS'; // 입고에 사용될 B_CLASS 예시 ('TCS')
    var list1 = ['TCS', 'FTMS', '전산', '기타'];
    var promises = [];
    list1.forEach(function(item) {
        b_class = item;
        const now_input = `
        SELECT 
            SUM((COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_price_sum
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_input i ON m.incom_id = i.incom_id
        WHERE 
            m.bc_in_b_class = '${b_class}'
            AND MONTH(i.date) = ${month}
            AND YEAR(i.date) = ${year};
        `;
        var query1 = [now_input];
        query1.forEach(function(query) {
            promises.push(new Promise(function(resolve, reject) {
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Addr",
                    param1 : "accumulate",
                    idx : target,
                    query : query,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    result = JSON.parse(result);
                    resolve(result.value[0].total_price_sum);
                }
            });
        }));
        });
    });
    Promise.all(promises).then(function(results) {
        // let result11 = results.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        // result11 = result11.replace(/\.00$/, "");
        push_function(results);
    }).catch(function(error) {
        console.error("Error:", error);
    });
}

function push_function(a){
    list_month.push(a);
}

function transform(originalData){
    console.log(originalData);
    let transformedData = Array.from({ length: 4 }, () => Array(12).fill(null));
    // 변환 수행
    for (let i = 0; i < originalData.length; i++) {
        for (let j = 0; j < originalData[i].length; j++) {
            console.log(originalData[i][j]);
            transformedData[j][i] = originalData[i][j];
        }
    }
    return transformedData;
}