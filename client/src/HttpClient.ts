import axios from 'axios';

const HttpClient = axios.create({
  baseURL: import.meta.env.REACT_APP_SERVER_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});

HttpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    //Handling the expired token
    if (
      error.response.status === 401 &&
      !request._retry &&
      !request.headers.noAuth
    ) {
      request._retry = true;
      try {
        await HttpClient.post('/auth/refresh-tokens');
        return axios(request);
      } catch (error) {
        window.location.reload();
      }
    }

    return Promise.reject(error);
  },
);
export default HttpClient;
