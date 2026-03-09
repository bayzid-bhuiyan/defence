import axios from 'axios';

const api = axios.create({
  baseURL: 'url/api', 
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (
      error.response && 
      error.response.status === 403 && 
      error.response.data?.message === 'USER_BLOCKED'
    ) {
      window.location.href = '/?blocked=true'; 
      return new Promise(() => {});
    }
    
    return Promise.reject(error);
  }
);

export default api;