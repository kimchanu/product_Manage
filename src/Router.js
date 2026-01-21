import Login_page from "./page/Login_page";
import Mat_list_page from "./page/Mat_list_page";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from "./component/PrivateRoute";
import Mypage_page from "./page/Mypage_page";
import Csv_Upload from "./page/Csv_Upload_page";
import Mat_output_page from "./page/Mat_output_page"
import Output_Mod from "./page/Output_Mod"
import Statement_page from "./page/Statement_page";
import Output_Statistics_page from "./page/Output_Statistics_page";
import PostList_page from "./page/PostList_page";
import Dashboard_page from "./page/Dashboard_page";
import Input_Mod from "./page/Input_Mod";
import Input_Statistics from "./page/Input_Statistics";
import Statistics from './component/Output_Statistics';
import WritePost from './component/Post/WritePost';
import PostDetail from './component/Post/PostDetail';
import Budget from "./page/Budget";
import Output_Approve_page from "./page/Output_Approve_page";
import Input_manual_page from "./page/Input_manual_page";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login_page" element={<Login_page />} />
        <Route element={<PrivateRoute />}>
          <Route path="/Mat_list_page" element={<Mat_list_page />} />
          <Route path="/mypage" element={<Mypage_page />} />
          <Route path="/upload" element={<Csv_Upload />} />
          <Route path="/Input_manual_page" element={<Input_manual_page />} />
          <Route path="/Mat_output_page" element={<Mat_output_page />} />
          <Route path="/Output_Mod" element={<Output_Mod />} />
          <Route path="/Statement_page" element={<Statement_page />} />
          <Route path="/Output_Statistics_page" element={<Output_Statistics_page />} />
          <Route path="/PostList_page" element={<PostList_page />} />
          <Route path="/input_mod" element={<Input_Mod />} />
          <Route path="/input_statistics" element={<Input_Statistics />} />
          <Route path="/" element={<Dashboard_page />} />
          <Route path="/statistics/input" element={<Input_Statistics />} />
          <Route path="/statistics/output" element={<Statistics />} />
          <Route path="/WritePost" element={<WritePost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Route>
        {/* 관리자 권한이 필요한 라우트 */}
        <Route element={<PrivateRoute requiredAdminLevel={1} />}>
          <Route path="/Budget" element={<Budget />} />
          <Route path="/Output_Approve_page" element={<Output_Approve_page />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
