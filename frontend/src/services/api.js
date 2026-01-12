import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method.toUpperCase(), config.baseURL + config.url, config.data || config.params);
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

 api.interceptors.response.use(
   (response) => {
     console.log('API Response:', response.status, response.config.url, response.data);
     return response;
   },
   (error) => {
     if (error.code === 'ERR_NETWORK' || !error.response) {
       console.error('API Network Error: Cannot connect to backend at', API_BASE_URL);
       console.error('Make sure the backend is running on http://localhost:8000');
     } else {
       console.error('API Response Error:', error.message, error.response?.data);
       if (error.response?.status === 401) {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/login';
       }
     }
     return Promise.reject(error);
   }
 );

export const processResumes = async (jobData, files) => {
  const formData = new FormData();
  
  formData.append('job_title', jobData.jobTitle);
  formData.append('job_description', jobData.jobDescription);
  formData.append('requirements', jobData.requirements);
  formData.append('skills', jobData.skills);
  formData.append('experience_level', jobData.experienceLevel);
  
  files.forEach((file) => {
    formData.append('resumes', file);
  });

  const response = await api.post('/process-resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const selectCandidates = async (jobId, candidateIds, candidates, jobTitle) => {
  const response = await api.post('/select-candidates', {
    job_id: jobId,
    candidate_ids: candidateIds,
    candidates,
    job_title: jobTitle,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

export const sendConfirmations = async (emailDrafts) => {
  const response = await api.post('/send-confirmations', emailDrafts, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getAvailableSlots = async (startDate, endDate, durationMinutes = 60) => {
  const response = await api.get('/available-slots', {
    params: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_minutes: durationMinutes,
    },
  });

  return response.data;
};

export default api;
