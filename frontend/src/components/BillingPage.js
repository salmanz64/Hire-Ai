import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BillingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const currentPlan = {
    name: 'Starter',
    price: '$49',
    period: '/month',
    status: 'Active',
    nextBilling: 'January 15, 2024',
    features: [
      { name: 'Resumes Processed', used: 45, limit: 100 },
      { name: 'Active Job Postings', used: 3, limit: 5 },
      { name: 'Team Members', used: 2, limit: 3 }
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

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = () => {
    alert(`Upgraded to ${plans.find(p => p.id === selectedPlan).name} plan!`);
  };

  const handleUpdatePayment = () => {
    alert('Payment method updated!');
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
      <div className="billing-header">
        <button className="button-ghost button-lg" onClick={() => navigate('/app')}>
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
                You're on the {currentPlan.name} plan
              </p>
            </div>
            <div className="badge badge-success">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {currentPlan.status}
            </div>
          </div>

          <div className="current-plan-details">
            <div className="plan-price-large">
              {currentPlan.price}
              <span className="plan-period-large">{currentPlan.period}</span>
            </div>
            <div className="plan-next-billing">
              Next billing date: <strong>{currentPlan.nextBilling}</strong>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Usage This Month</h3>
          <div className="usage-grid">
            {currentPlan.features.map((feature, index) => {
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
              style={{ flex: 1 }}
            >
              Upgrade to {plans.find(p => p.id === selectedPlan).name}
            </button>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Payment Methods</h2>
            <button className="button-outline button-lg">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18, marginRight: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Payment Method
            </button>
          </div>

          <div className="payment-methods">
            {paymentMethods.map((method, index) => (
              <div key={index} className="payment-method-card">
                <div className="payment-method-icon">
                  {method.brand === 'Visa' && (
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#1a1f71' }}>VISA</span>
                  )}
                </div>
                <div className="payment-method-details">
                  <div className="payment-method-brand">{method.brand}</div>
                  <div className="payment-method-number">•••• {method.last4}</div>
                  <div className="payment-method-expiry">Expires {method.expiry}</div>
                </div>
                <div className="payment-method-actions">
                  {method.default && <div className="badge badge-info">Default</div>}
                  <button className="button-ghost">Edit</button>
                </div>
              </div>
            ))}
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
              Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference immediately. When you downgrade, the new price will apply on your next billing cycle.
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
              Yes! All plans come with a 14-day free trial. You can explore all features without providing a credit card. Your trial automatically converts to a paid plan unless you cancel.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">How do I cancel my subscription?</h3>
            <p className="faq-answer">
              You can cancel your subscription at any time from this billing page. Your account will remain active until the end of your current billing period. We'll send you a confirmation email when your cancellation is processed.
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
    </div>
  );
};

export default BillingPage;