import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    resumeLimit: 10,
    jobLimit: 1,
    features: ['10 resumes/month', '1 active job', 'Basic analytics']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    resumeLimit: 100,
    jobLimit: 5,
    features: ['100 resumes/month', '5 active jobs', 'Basic analytics', 'Resume storage']
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    resumeLimit: Infinity,
    jobLimit: 25,
    features: ['Unlimited resumes', '25 active jobs', 'Advanced analytics', 'API access', 'Custom workflows']
  }
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [planId, setPlanId] = useState('free');
  const [resumesProcessedThisMonth, setResumesProcessedThisMonth] = useState(0);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentPlan = PLANS[planId];

  useEffect(() => {
    if (user) {
      setPlanId(user.plan || 'free');
      fetchJobs();
      fetchUsage();
    } else {
      setJobs([]);
      setResumesProcessedThisMonth(0);
      setActiveJobCount(0);
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      const fetchedJobs = response.data || [];
      setJobs(fetchedJobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.is_active ? 'active' : 'closed',
        candidates: job.candidates?.length || 0,
        date: new Date(job.created_at).toISOString().split('T')[0]
      })));
      setActiveJobCount(fetchedJobs.filter(job => job.is_active).length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setActiveJobCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await api.get('/usage');
      const usage = response.data;
      setResumesProcessedThisMonth(usage?.resumes_processed || 0);
    } catch (error) {
      console.error('Error fetching usage:', error);
      setResumesProcessedThisMonth(0);
    }
  };

  const upgradePlan = (newPlanId) => {
    setPlanId(newPlanId);
  };

  const canProcessResume = () => {
    if (currentPlan.resumeLimit === Infinity) return true;
    return resumesProcessedThisMonth < currentPlan.resumeLimit;
  };

  const canCreateJob = () => {
    if (currentPlan.jobLimit === Infinity) return true;
    return activeJobCount < currentPlan.jobLimit;
  };

  const addJob = async (jobData) => {
    if (!canCreateJob()) return false;
    
    try {
      const response = await api.post('/jobs', jobData);
      if (jobData.candidates_count) {
        setTotalCandidates(prev => prev + jobData.candidates_count);
      }
      await fetchJobs();
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      return false;
    }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      const isActive = status === 'active';
      await api.patch(`/jobs/${jobId}`, { is_active: isActive });
      await fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const incrementResumeCount = async (count = 1) => {
    setResumesProcessedThisMonth(prev => prev + count);
  };

  const getResumeUsagePercentage = () => {
    if (currentPlan.resumeLimit === Infinity) return 0;
    return (resumesProcessedThisMonth / currentPlan.resumeLimit) * 100;
  };

  const getJobUsagePercentage = () => {
    if (currentPlan.jobLimit === Infinity) return 0;
    return (activeJobCount / currentPlan.jobLimit) * 100;
  };

  const getUpgradeReason = () => {
    if (!canProcessResume()) {
      return 'You\'ve reached your monthly resume limit';
    }
    if (!canCreateJob()) {
      return 'You\'ve reached your active job limit';
    }
    return null;
  };

  const value = {
    planId,
    currentPlan,
    plans: PLANS,
    resumesProcessedThisMonth,
    activeJobCount,
    jobs,
    totalCandidates,
    loading,
    upgradePlan,
    canProcessResume,
    canCreateJob,
    addJob,
    updateJobStatus,
    incrementResumeCount,
    getResumeUsagePercentage,
    getJobUsagePercentage,
    getUpgradeReason,
    fetchJobs,
    fetchUsage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
