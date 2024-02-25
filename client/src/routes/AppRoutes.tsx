import { Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/Signup';
import SignIn from '../pages/Signin';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

export default function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<p>Page not found: 404!</p>} />
      </Routes>
    </BrowserRouter>
  );
}
