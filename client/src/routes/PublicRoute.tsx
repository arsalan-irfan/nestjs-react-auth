/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from 'react-router';
import { isUserAuthenticated } from '../helper/isUserAuthenticated';

export const PublicRoute = ({ children }: any) => {
  return isUserAuthenticated() ? <Navigate to="/home" /> : <>{children}</>;
};
