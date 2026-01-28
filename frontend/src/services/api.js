import axios from 'axios';

const API_BASE_URL = 'https://hire-ai-6fgr.onrender.com/api/v1';

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
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
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
  });

  return response.data;
};

export const sendConfirmations = async (emailDrafts) => {
  const response = await api.post('/send-confirmations', emailDrafts);
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

