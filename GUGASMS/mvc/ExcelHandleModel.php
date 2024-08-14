<?php
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExcelHandleModel extends gf{
    private $param;
    private $dir;
    private $version;
    private $db;

    function __construct($init_object) {
        $this->param = $init_object["json"];
        $this->dir = $init_object["dir"];
        $this->version = $init_object["version"];
        $this->db = $init_object["db"];
        
        $json = $this->param;
        if(isset($json["param1"])) {
            $param1 = $json["param1"];
            $this->$param1();
        } else {
            $error = array(
                "result" => "0",
                "error_code" => "404",
                "message" => "Not found",
            );
            echo json_encode($error, JSON_UNESCAPED_UNICODE);
        }
    }

    public function export_excel() {
        $param = $this->param;

        try {
            // 엑셀 템플릿 로드
            $templateFilePath = $this->dir . '/inc/pd_sample.xlsx';
            $spreadsheet = IOFactory::load($templateFilePath);
            $sheet = $spreadsheet->getActiveSheet();

            // 필요한 데이터를 가져오는 SQL 쿼리
            $sql = "
                SELECT 
                    m.incom_id, m.mat_in_code, m.mat_in_place, m.bc_in_b_class, m.bc_in_s_class, m.mat_in_name, m.mat_in_stand, m.mat_in_maker, m.mat_in_custom, m.mat_in_union, m.mat_in_price,
                    i.carry_over as input_carry_over, i.amount as input_amount, i.date as input_date,
                    o.carry_over as output_carry_over, o.amount as output_amount, o.date as output_date
                FROM 
                    eletech_mat_coming m
                LEFT JOIN 
                    eletech_input i ON m.incom_id = i.incom_id
                LEFT JOIN 
                    eletech_output o ON m.incom_id = o.incom_id
                ORDER BY 
                    m.incom_id ASC";

            $result = $this->db->db_select($sql);
            if ($result['result'] == 1) {
                $data = $result['value'];

                // 데이터를 Excel에 채우기
                $rowIndex = 2; // 데이터 시작 행
                foreach ($data as $row) {
                    $sheet->setCellValue('A' . $rowIndex, $row['incom_id']);
                    $sheet->setCellValue('B' . $rowIndex, $row['mat_in_code']);
                    $sheet->setCellValue('C' . $rowIndex, $row['mat_in_place']);
                    $sheet->setCellValue('D' . $rowIndex, $row['bc_in_b_class']);
                    // 필요한 데이터를 다른 열에도 채움
                    $rowIndex++;
                }

                // 엑셀 파일을 클라이언트에 전송
                $filename = "exported_data.xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment;filename="' . $filename . '"');
                header('Cache-Control: max-age=0');

                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
                exit;
            } else {
                echo json_encode([
                    'result' => 0,
                    'message' => '데이터를 가져오는 중 오류가 발생했습니다.'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'result' => 0,
                'message' => $e->getMessage()
            ]);
        }
    }
}
?>