var labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
var budget1;
$(document).ready(function(){
    // 비동기 함수 호출 예시
    
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    let promises = [];
    for (let i = 1; i <= currentMonth; i++) {
        promises.push(code_init(currentYear, i));
    }
    Promise.all(promises).then(results => {
        list_month = results; // list_month에 결과 할당
        let abc = transform(list_month);
        getBudget().then(function(budget_its) {
            updateTotalUsage(abc, budget_its);
            updateCharts(abc, budget_its);
            
        });
    }).catch(error => {
        console.error("Error:", error);
    });
});

var list_month = [];

function code_init(year, month) {
    return new Promise((resolve, reject) => {
        var target = group_idx;
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
                    its_output i ON m.incom_id = i.incom_id
                WHERE 
                    m.bc_in_b_class = '${b_class}'
                    AND MONTH(i.date) = ${month}
                    AND YEAR(i.date) = ${year};
            `;
            promises.push(new Promise(function(innerResolve, innerReject) {
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Addr",
                        param1 : "accumulate",
                        idx : target,
                        query : now_input,
                    },
                    action : "index.php",
                    havior : function(result){
                        result = JSON.parse(result);
                        innerResolve(result.value[0].total_price_sum);
                    },
                    error: function(error) {
                        innerReject(error);
                    }
                });
            }));
        });

        Promise.all(promises).then(function(results) {
            resolve(results);
        }).catch(function(error) {
            reject(error);
        });
    });
}

function transform(originalData){
    let transformedData = Array.from({ length: 4 }, () => Array(12).fill(null));
    for (let i = 0; i < originalData.length; i++) {
        for (let j = 0; j < originalData[i].length; j++) {
            transformedData[j][i] = originalData[i][j] === null ? 0 : originalData[i][j];
        }
    }
    return transformedData;
}

function updateCharts(data, budget_its) {
    var dataTCS = data[0];
    var dataFTMS = data[1];
    var dataCS = data[2];
    var dataETC = data[3];

    var totalTCS = dataTCS.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalFTMS = dataFTMS.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalCS = dataCS.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalETC = dataETC.reduce((a, b) => a + (parseFloat(b) || 0), 0);

    var totalData = totalTCS + totalFTMS + totalCS + totalETC;

    var pieData = [
        (totalTCS / totalData * 100).toFixed(2),
        (totalFTMS / totalData * 100).toFixed(2),
        (totalCS / totalData * 100).toFixed(2),
        (totalETC / totalData * 100).toFixed(2)
    ];

    var budgetData = [
        (totalTCS / budget_its * 100).toFixed(2),
        (totalFTMS / budget_its * 100).toFixed(2),
        (totalCS / budget_its * 100).toFixed(2),
        (totalETC / budget_its * 100).toFixed(2)
    ];

    var ctxBar = document.getElementById('barChart').getContext('2d');
    var barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'TCS',
                    data: dataTCS,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'FTMS',
                    data: dataFTMS,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '전산',
                    data: dataCS,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: '기타',
                    data: dataETC,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    var ctxPie = document.getElementById('pieChart').getContext('2d');
    var pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: [
                `TCS (${pieData[0]}%)`,
                `FTMS (${pieData[1]}%)`,
                `전산 (${pieData[2]}%)`,
                `기타 (${pieData[3]}%)`
            ],
            datasets: [{
                data: pieData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}


function updateTotalUsage(data, budget_its) {
    var totalTCS = data[0].reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalFTMS = data[1].reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalCS = data[2].reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalETC = data[3].reduce((a, b) => a + (parseFloat(b) || 0), 0);
    var totalSum = totalTCS + totalFTMS + totalCS + totalETC;
    var totalUsageDiv = document.getElementById('totalUsage');
    var remain = budget_its - totalSum;


    totalUsageDiv.innerHTML = `

        <p>TCS 출고금액: ${totalTCS.toLocaleString()}원</p>
        <p>FTMS 출고금액: ${totalFTMS.toLocaleString()}원</p>
        <p>전산 출고금액: ${totalCS.toLocaleString()}원</p>
        <p>기타 출고금액: ${totalETC.toLocaleString()}원</p>
        <p>총출고 금액: ${totalSum.toLocaleString()}원</p>

    `;
}


function budget() {
    return new Promise(function(resolve, reject) {
        var department = 'its';
        lb.ajax({
            type: "JsonAjaxPost",
            list: {
                ctl: "Addr",
                param1: "budget",
                department: department,
            },
            action: "index.php",
            havior: function(result) {
                result = JSON.parse(result);
                if (result && result.value && result.value[0] && result.value[0].budget_amount !== undefined) {
                    resolve(result.value[0].budget_amount);
                } else {
                    reject("No budget amount found");
                }
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

async function getBudget() {
    try {
        var budget_its = await budget();
        console.log("Budget amount:", budget_its);
        // budget_its 변수를 여기서 사용할 수 있습니다.
        budget1 = budget_its;
        return budget_its;
    } catch (error) {
        console.error("Error:", error);
    }
}


