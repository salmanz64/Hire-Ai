import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--gray-50)'
      }}>
        <svg className="spinner" fill="none" viewBox="0 0 24 24" style={{ width: 48, height: 48 }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Advanced GPT-4 analyzes resumes and matches candidates with 95% accuracy'
    },
    {
      icon: '📊',
      title: 'Smart Ranking',
      description: 'Automatically rank candidates based on skills, experience, and job fit'
    },
    {
      icon: '📅',
      title: 'Auto Scheduling',
      description: 'Seamlessly schedule interviews with Google Calendar integration'
    },
    {
      icon: '📧',
      title: 'Email Automation',
      description: 'Send personalized interview confirmations and updates automatically'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process hundreds of resumes in minutes, not hours or days'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level encryption and GDPR compliance for your data'
    }
  ];

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for individuals',
      features: [
        '10 resumes per month',
        '1 active job posting',
        'Email support',
        'Basic analytics',
        'Google Calendar integration'
      ],
      popular: false,
      cta: 'Get Started'
    },
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small teams',
      features: [
        '100 resumes per month',
        '5 active job postings',
        'Email support',
        'Basic analytics',
        'Google Calendar integration',
        'Resume storage (30 days)'
      ],
      popular: false,
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Best for growing companies',
      features: [
        'Unlimited resumes',
        '25 active job postings',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom workflows'
      ],
      popular: true,
      cta: 'Get Started'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Define Your Role',
      description: 'Enter job title, requirements, and skills'
    },
    {
      number: '2',
      title: 'Upload Resumes',
      description: 'Drag and drop PDF resumes for analysis'
    },
    {
      number: '3',
      title: 'AI Analysis',
      description: 'Our AI scores and ranks candidates instantly'
    },
    {
      number: '4',
      title: 'Schedule Interviews',
      description: 'Select top candidates and auto-schedule interviews'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'TechCorp Inc.',
      image: 'SJ',
      text: 'HireAI reduced our hiring time by 70%. The AI analysis is incredibly accurate and saves us countless hours of manual screening.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Recruiting Manager',
      company: 'StartupXYZ',
      image: 'MC',
      text: 'We hired our best developer through HireAI. The candidate matching is spot-on, and the automated scheduling is a game-changer.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Talent Acquisition',
      company: 'Global Industries',
      image: 'ER',
      text: 'The Google Calendar integration alone is worth the price. No more back-and-forth emails trying to schedule interviews.',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">
            <div className="logo-icon">HR</div>
            <div className="logo-text">HireAI</div>
          </div>
          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Testimonials</a>
          </nav>
          <div className="landing-nav-actions">
            <button className="button-ghost button-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="button-primary button-lg" onClick={handleGetStarted}>
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">🚀</span>
            AI-Powered Hiring Platform
          </div>
          <h1 className="hero-title">
            Hire the Best Candidates
            <span className="hero-highlight"> 10x Faster</span>
          </h1>
          <p className="hero-subtitle">
            Let AI analyze, rank, and match candidates while you focus on what matters most - building your team. 
            Automate resume screening, interview scheduling, and candidate communication in one powerful platform.
          </p>
          <div className="hero-cta">
            <button className="button-primary button-lg hero-cta-primary" onClick={handleGetStarted}>
              Start Free Trial
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="button-outline button-lg hero-cta-secondary">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20, marginRight: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Companies</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">1M+</div>
              <div className="hero-stat-label">Resumes Analyzed</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">95%</div>
              <div className="hero-stat-label">Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Features</div>
            <h2 className="section-title">Everything You Need to Hire Smarter</h2>
            <p className="section-subtitle">
              Our AI-powered platform handles every step of the hiring process, from resume screening to interview scheduling
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">How It Works</div>
            <h2 className="section-title">Hire Top Talent in 4 Simple Steps</h2>
            <p className="section-subtitle">
              Our streamlined process gets you from job posting to interviews in minutes, not days
            </p>
          </div>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Pricing</div>
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="pricing-grid">
            {pricing.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
                {plan.popular && <div className="pricing-badge">Most Popular</div>}
                <h3 className="pricing-name">{plan.name}</h3>
                <div className="pricing-price">
                  {plan.price}
                  <span className="pricing-period">{plan.period}</span>
                </div>
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
                <button
                  className={`button-lg ${plan.popular ? 'button-primary' : 'button-outline'}`}
                  onClick={plan.popular ? () => navigate('/billing') : handleGetStarted}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Testimonials</div>
            <h2 className="section-title">Loved by HR Teams Worldwide</h2>
            <p className="section-subtitle">
              See what companies are saying about HireAI
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="testimonial-star">⭐</span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{testimonial.image}</div>
                  <div className="testimonial-info">
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                    <div className="testimonial-company">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Hiring?</h2>
          <p className="cta-subtitle">
            Join thousands of companies already using HireAI to hire faster and smarter
          </p>
          <div className="cta-form">
            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="Enter your work email"
                className="cta-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="button-primary button-lg cta-button">
                Start Free Trial
              </button>
            </form>
          </div>
          <p className="cta-footer">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="landing-logo">
              <div className="logo-icon">HR</div>
              <div className="logo-text">HireAI</div>
            </div>
            <p className="footer-description">
              AI-powered HR platform for intelligent resume screening, candidate ranking, and automated interview scheduling.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Integrations</a>
            <a href="#">API</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
            <a href="#">GDPR</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Connect</h4>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
            <a href="#">Discord</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 HireAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;