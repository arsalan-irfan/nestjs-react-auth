import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const isUserAuthenticated = () => {
  const sessionId = cookies.get('session-id');
  return sessionId ? true : false;
};
