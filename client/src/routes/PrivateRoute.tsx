/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from 'react-router';
import { isUserAuthenticated } from '../helper/isUserAuthenticated';

export const PrivateRoute = ({ children }: any) => {
  return isUserAuthenticated() ? <>{children}</> : <Navigate to="/" />;
};
