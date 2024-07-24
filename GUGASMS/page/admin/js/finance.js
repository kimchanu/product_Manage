var double_click = true;
function submitForm() {
    var year = document.getElementById("year").value;
    var month = document.getElementById("month").value;
    var department = document.getElementById("department").value;

    // 입력값 확인
    if (year && month && department) {
        // 형식 확인 및 잘못된 입력값 처리
        if (year.match(/^\d{4}$/) && month.match(/^(0[1-9]|1[0-2])$/)) {
            // 링크로 리디렉션
            input_date(year, month);
            $('#inputModal').modal('hide');
        } else {
            alert("연도 또는 월 형식이 잘못되었습니다. 연도는 4자리 숫자, 월은 01-12 사이의 숫자를 입력하세요.");
        }
    } else {
        alert("모든 입력란을 채워주세요.");
    }
}

$(document).ready(function() {
    // 페이지가 로드될 때 모달 팝업 표시
    $('#inputModal').modal('show');
});

function input_date(year, month) {
    // 현재 날짜와 시간을 가져옴
    var currentDate = new Date();
    
    // // 연도, 월, 일 가져오기
    // var year = currentDate.getFullYear();
    // var month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1, 두 자리 형식 유지
    var day = ('0' + currentDate.getDate()).slice(-2); // 두 자리 형식 유지

    // YYYY.MM.DD 형식으로 날짜 생성
    var formattedDate = year + '.' + month + '.' + day;

    // HTML 요소에 날짜 표시
    document.getElementById("date").textContent = formattedDate;
    document.getElementById("title1").textContent = year+"년 "+month+"월 자재수불명세서대장";
    document.getElementById("title2").textContent =  month+"월";
    document.getElementById("title3").textContent =  "예산집행 현황 "+year+"년";
    code_init(year, month);
}

function code_init(year, month){
    var target = group_idx;
    // 예시로 사용할 변수 설정
    var b_class = 'TCS'; // 입고에 사용될 B_CLASS 예시 ('TCS')
    var year = year; // 예시로 연도 설정
    var month = month; // 예시로 월 설정
    var month1 = parseInt(month, 10) + 1; 
    let month2 = month1 < 10 ? '0' + month1 : month1.toString();
    var date = year + '-' + (month < 10 ? '' + month : month) + '-01';
    var date1 = year + '-' + (month2 < 10 ? '' + month2 : month2) + '-01';
    // 입력 SQL 쿼리
    console.log(date1);
    var list1 = ['TCS', 'FTMS', '전산', '기타'];
    var promises = [];
    var list2 = [];
    list1.forEach(function(item) {
        b_class = item;
        const input = `
        SELECT 
            SUM((COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_price_sum
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_input i ON m.incom_id = i.incom_id
        WHERE 
            m.bc_in_b_class = '${b_class}'
            AND (i.date IS NULL OR i.date < '${date1}');
        `;
    
        // 출력 SQL 쿼리
        const output = `
        SELECT 
            SUM((COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_price_sum
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_output o ON m.incom_id = o.incom_id
        WHERE 
            m.bc_in_b_class = '${b_class}'
            AND (o.date IS NULL OR o.date < '${date1}');
        `;
    
        // 현재 입력 SQL 쿼리
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
    
        // 현재 출력 SQL 쿼리
        const now_output = `
        SELECT 
            SUM((COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_price_sum
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_output o ON m.incom_id = o.incom_id
        WHERE 
            m.bc_in_b_class = '${b_class}'
            AND MONTH(o.date) = ${month}
            AND YEAR(o.date) = ${year};
        `;
    
        // 전월 생산 전 SQL 쿼리
        const before_production = `
        SELECT 
            SUM(net_total_price) AS total_price_sum
        FROM (
            SELECT 
                (input_totals.total_input_price - COALESCE(output_totals.total_output_price, 0)) AS net_total_price
            FROM 
                (
                    SELECT 
                        m.incom_id,
                        SUM(COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) AS total_input_amount,
                        SUM((COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) * 
                            CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_input_price
                    FROM 
                        its_mat_coming m
                    LEFT JOIN 
                        its_input i ON m.incom_id = i.incom_id
                    WHERE 
                        m.bc_in_b_class = '${b_class}'
                        AND (i.date IS NULL OR i.date < '${date}')
                    GROUP BY 
                        m.incom_id
                ) AS input_totals
            LEFT JOIN 
                (
                    SELECT 
                        o.incom_id,
                        SUM(COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) AS total_output_amount,
                        SUM((COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) * 
                            CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2))) AS total_output_price
                    FROM 
                        its_output o
                    LEFT JOIN 
                        its_mat_coming m ON o.incom_id = m.incom_id
                    WHERE 
                        (o.date IS NULL OR o.date < '${date}')
                    GROUP BY 
                        o.incom_id
                ) AS output_totals ON input_totals.incom_id = output_totals.incom_id
            WHERE 
                (input_totals.total_input_price - COALESCE(output_totals.total_output_price, 0)) > 0
        ) AS net_totals;
        `;
        var query1 = [before_production, now_input, input, now_output, output];
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
        var list2 = results;
        init_price(list2);
    }).catch(function(error) {
        console.error("Error:", error);
    });
    
}

function init_price(price_list){
    console.log(price_list);
    var groups = ['tcs', 'ftms', 'com', 'etc'];
    var sumValues = Array(7).fill(0);
    var value6Array = [];
    var ratio = [];
    groups.forEach(function(group, groupIndex) {
        var values = price_list.slice(groupIndex * 5, (groupIndex + 1) * 5).map(value => value !== null ? parseFloat(value) : null);
        
        for (var i = 0; i < 5; i++) {
            var tdId = `${group}${i + 1}`;
            var formattedValue = values[i] !== null ? values[i].toLocaleString('en-US') : '-';
            document.getElementById(tdId).textContent = formattedValue;

            if (values[i] !== null) {
                sumValues[i] += values[i];
            }
        }

        var tdId6 = `${group}6`;
        var tdId7 = `${group}7`;

        var value6 = (values[0] !== null ? values[0] : 0) + (values[1] !== null ? values[1] : 0) - (values[3] !== null ? values[3] : 0);
        value6Array.push(value6);
        var formattedValue6 = value6 !== 0 ? value6.toLocaleString('en-US') : '-';
        document.getElementById(tdId6).textContent = formattedValue6;

        var value7 = (values[0] !== null && values[2] !== null && values[2] !== 0) ? (value6 / values[2]) : '-';
        var formattedValue7 = value7 !== '-' ? (value7 * 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + '%' : '-';
        document.getElementById(tdId7).textContent = formattedValue7;

        if (value6 !== 0) {
            sumValues[5] += value6;
            ratio.push(value6);
        }
        if (value7 !== '-') {
            sumValues[6] += parseFloat(value7);  // update sumValues[6] with a number, not a string
        }

    });
    groups.forEach(function(group, groupIndex) {
        var tdId8 = `${group}8`;
        var value8 = sumValues[5] !== 0 ? ((ratio[groupIndex] / sumValues[5]) * 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + '%' : '-';
        document.getElementById(tdId8).textContent = value8;
    });
    for (var i = 0; i < sumValues.length; i++) {
        var tdId = `sum${i + 1}`;
        var formattedSumValue = sumValues[i] !== 0 ? sumValues[i].toLocaleString('en-US') : '-';
        document.getElementById(tdId).textContent = formattedSumValue;
    }

    if (sumValues[2] !== 0 && sumValues[5] !== 0) {
        var sum7Value = sumValues[5] / sumValues[2];
        var formattedSum7Value = (sum7Value * 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + '%';
        document.getElementById('sum7').textContent = formattedSum7Value;
    } else {
        document.getElementById('sum7').textContent = '-';
    }
}
