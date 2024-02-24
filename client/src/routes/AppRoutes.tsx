import { Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/Signup';
import SignIn from '../pages/Signin';

export default function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SignIn />} />
        <Route path="register" element={<SignUp />} />
        <Route path="home" element={<Home />} />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </BrowserRouter>
  );
}
