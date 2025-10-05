import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Test from "./pages/Test";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />     {/* Default page */}
        <Route path="/login" element={<Login />} />     {/* Default page */}
        <Route path="/register" element={<Register />} />     {/* Default page */}
        <Route path="/test" element={<Test />} />  {/* Old test screen */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
