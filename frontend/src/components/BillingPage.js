import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import api from '../services/api';

const BillingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentPlan, resumesProcessedThisMonth, activeJobCount, totalCandidates, planId, upgradePlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(planId);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    
    if (success === 'true') {
      setShowSuccessMessage(true);
      const plan = searchParams.get('plan');
      if (plan && plan !== 'free' && upgradePlan) {
        upgradePlan(plan);
        setSelectedPlan(plan);
      }
      setTimeout(() => {
        setShowSuccessMessage(false);
        window.history.replaceState({}, '', '/billing');
      }, 5000);
    }
    
    if (cancelled === 'true') {
      setShowCancelledMessage(true);
      setTimeout(() => {
        setShowCancelledMessage(false);
        window.history.replaceState({}, '', '/billing');
      }, 5000);
    }
  }, [searchParams, upgradePlan]);

  const planDetails = {
    free: { name: 'Free', price: '$0', period: '/month' },
    starter: { name: 'Starter', price: '$49', period: '/month' },
    professional: { name: 'Professional', price: '$149', period: '/month' }
  };

  const currentPlanInfo = {
    name: currentPlan.name,
    price: planDetails[planId]?.price || '$0',
    period: planDetails[planId]?.period || '/month',
    status: 'Active',
    features: [
      { name: 'Resumes Processed', used: resumesProcessedThisMonth, limit: currentPlan.resumeLimit === Infinity ? 'Unlimited' : currentPlan.resumeLimit },
      { name: 'Active Job Postings', used: activeJobCount, limit: currentPlan.jobLimit === Infinity ? 'Unlimited' : currentPlan.jobLimit },
      { name: 'Total Candidates', used: totalCandidates, limit: 'N/A' }
    ]
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      savings: '',
      description: 'Perfect for individuals',
      features: [
        '10 resumes per month',
        '1 active job posting',
        'Email support',
        'Basic analytics',
        'Google Calendar integration'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: '$49',
      yearlyPrice: '$470',
      savings: 'Save 20%',
      description: 'Perfect for small teams',
      features: [
        '100 resumes per month',
        '5 active job postings',
        'Email support',
        'Basic analytics',
        'Google Calendar integration',
        'Resume storage (30 days)'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: '$149',
      yearlyPrice: '$1,430',
      savings: 'Save 20%',
      description: 'Best for growing companies',
      popular: true,
      features: [
        'Unlimited resumes',
        '25 active job postings',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom workflows',
        'Unlimited resume storage'
      ]
    }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: 'December 15, 2024',
      amount: '$149.00',
      status: 'Paid',
      download: true
    },
    {
      id: 'INV-2024-002',
      date: 'November 15, 2024',
      amount: '$149.00',
      status: 'Paid',
      download: true
    },
    {
      id: 'INV-2024-003',
      date: 'October 15, 2024',
      amount: '$149.00',
      status: 'Paid',
      download: true
    }
  ];

  const paymentMethods = [
    {
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/2025',
      default: true
    }
  ];

  const handlePlanChange = (newPlanId) => {
    setSelectedPlan(newPlanId);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      console.log('Creating checkout session for:', selectedPlan, billingCycle);
      
      const response = await api.post('/billing/subscribe', {
        plan_id: selectedPlan,
        billing_cycle: billingCycle
      });
      
      console.log('Checkout response:', response.data);
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setLoading(false);
      
      const errorMessage = error.response?.data?.detail || 
                        error.message || 
                        'Failed to create checkout session. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const formatUsage = (used, limit) => {
    if (limit === 'Unlimited') return { percentage: 0, text: 'Unlimited' };
    const percentage = Math.round((used / parseInt(limit)) * 100);
    return { percentage, text: `${used}/${limit}` };
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'var(--success)';
    if (percentage < 80) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="billing-page">
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Payment Successful!</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Your plan has been upgraded to {plans.find(p => p.id === selectedPlan)?.name}</div>
          </div>
        </div>
      )}
      
      {showCancelledMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Payment Cancelled</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>You can try upgrading anytime</div>
          </div>
        </div>
      )}
      
      <div className="billing-header">
        <button className="button-ghost button-lg" onClick={() => navigate('/app/dashboard')}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20, marginRight: 8 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="billing-title">Billing & Plans</h1>
      </div>

      <div className="billing-content">
        {/* Current Plan Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Current Plan</h2>
              <p className="page-subtitle" style={{ margin: 0 }}>
                You're on {currentPlanInfo.name} plan
              </p>
            </div>
            <div className="badge badge-success">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {currentPlanInfo.status}
            </div>
          </div>

          <div className="current-plan-details">
            <div className="plan-price-large">
              {currentPlanInfo.price}
              <span className="plan-period-large">{currentPlanInfo.period}</span>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Usage This Month</h3>
          <div className="usage-grid">
            {currentPlanInfo.features.map((feature, index) => {
              const { percentage, text } = formatUsage(feature.used, feature.limit);
              return (
                <div key={index} className="usage-card">
                  <div className="usage-header">
                    <div className="usage-name">{feature.name}</div>
                    <div className="usage-value">{text}</div>
                  </div>
                  {feature.limit !== 'Unlimited' && (
                    <div className="usage-bar-container">
                      <div 
                        className="usage-bar" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getUsageColor(percentage)
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Selection Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upgrade or Change Plan</h2>
            <div className="billing-toggle">
              <button 
                className={`billing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`billing-toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className="billing-toggle-badge">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="pricing-grid billing-pricing-grid">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const isSelected = selectedPlan === plan.id;
              return (
                <div 
                  key={plan.id} 
                  className={`pricing-card ${isSelected ? 'selected' : ''} ${plan.popular ? 'pricing-card-popular' : ''}`}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  {plan.popular && <div className="pricing-badge">Most Popular</div>}
                  {isSelected && <div className="pricing-selected">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>}
                  <h3 className="pricing-name">{plan.name}</h3>
                  <div className="pricing-price">
                    {price}
                    {billingCycle === 'yearly' && (
                      <span className="pricing-period">/year</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="pricing-savings">{plan.savings}</div>
                  )}
                  <p className="pricing-description">{plan.description}</p>
                  <ul className="pricing-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="pricing-feature">
                        <svg className="pricing-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="button-group" style={{ marginTop: 32 }}>
            <button className="button-secondary button-lg">
              Compare All Plans
            </button>
            <button 
              className="button-primary button-lg" 
              onClick={handleUpgrade}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                `Upgrade to ${plans.find(p => p.id === selectedPlan).name}`
              )}
            </button>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Payment Methods</h2>
              <p className="page-subtitle" style={{ margin: 0, fontSize: 14, color: 'var(--gray-600)' }}>
                Secure payments powered by Stripe
              </p>
            </div>
            <button className="button-outline button-lg">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18, marginRight: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Payment Method
            </button>
          </div>

          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 40 }}>
                <svg viewBox="0 0 60 40" style={{ height: 40 }}>
                  <defs>
                    <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#635BFF', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#8B85FF', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <text x="5" y="30" style={{ fill: 'url(#stripeGradient)', fontSize: 22, fontWeight: 700, fontFamily: 'system-ui, -apple-system, sans-serif' }}>stripe</text>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>Secure Payments</div>
                <div style={{ fontSize: 14, color: 'var(--gray-600)' }}>
                  All payments are processed securely through Stripe. We accept all major credit cards.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fff', 
                  borderRadius: 6, 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: '#1a1f71',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>VISA</div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fff', 
                  borderRadius: 6, 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: '#eb001b',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>MC</div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fff', 
                  borderRadius: 6, 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: '#0066b2',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>AMEX</div>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            {paymentMethods.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                color: 'var(--gray-500)',
                fontSize: 14
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>💳</div>
                <div>No payment methods added yet</div>
                <div style={{ marginTop: 8 }}>You'll be prompted to add a payment method when you upgrade your plan</div>
              </div>
            ) : (
              paymentMethods.map((method, index) => (
                <div key={index} className="payment-method-card">
                  <div className="payment-method-icon">
                    <svg viewBox="0 0 60 40" style={{ height: 32 }}>
                      <text x="5" y="24" style={{ fill: '#635BFF', fontSize: 16, fontWeight: 700 }}>stripe</text>
                    </svg>
                  </div>
                  <div className="payment-method-details">
                    <div className="payment-method-brand">{method.brand} (via Stripe)</div>
                    <div className="payment-method-number">•••• {method.last4}</div>
                    <div className="payment-method-expiry">Expires {method.expiry}</div>
                  </div>
                  <div className="payment-method-actions">
                    {method.default && <div className="badge badge-info">Default</div>}
                    <button className="button-ghost">Manage in Stripe</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Billing History Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Billing History</h2>
            <button className="button-outline button-lg">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18, marginRight: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Download All
            </button>
          </div>

          <div className="invoice-table">
            <div className="invoice-table-header">
              <div>Invoice</div>
              <div>Date</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {invoices.map((invoice, index) => (
              <div key={index} className="invoice-table-row">
                <div className="invoice-id">{invoice.id}</div>
                <div className="invoice-date">{invoice.date}</div>
                <div className="invoice-amount">{invoice.amount}</div>
                <div>
                  <span className={`badge ${invoice.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {invoice.status}
                  </span>
                </div>
                <div>
                  <button 
                    className="button-ghost"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 24 }}>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3 className="faq-question">Can I change my plan at any time?</h3>
            <p className="faq-answer">
              Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be redirected to Stripe's secure checkout to complete the payment. When you downgrade, the new price will apply on your next billing cycle.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">What happens if I exceed my limits?</h3>
            <p className="faq-answer">
              We'll send you a notification when you're approaching your limits. If you exceed them, your account will continue to work, but we may contact you to discuss upgrading to a plan that better fits your needs.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">Is there a free trial?</h3>
            <p className="faq-answer">
              Yes! All paid plans come with a 14-day free trial. You can explore all features without providing a credit card. Your trial automatically converts to a paid plan unless you cancel through Stripe.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">How do I cancel my subscription?</h3>
            <p className="faq-answer">
              You can manage and cancel your subscription through our secure Stripe customer portal. Your account will remain active until the end of your current billing period. We'll send you a confirmation email when your cancellation is processed.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">What payment methods do you accept?</h3>
            <p className="faq-answer">
              We accept all major credit cards including Visa, Mastercard, and American Express. All payments are securely processed through Stripe, a PCI-compliant payment processor. We do not store any of your payment information on our servers.
            </p>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '2px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--gray-900)' }}>
                Need Help with Billing?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                Our support team is here to help you with any billing questions, plan changes, or technical issues.
              </p>
            </div>
            <button className="button-primary button-lg">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BillingPage;