import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import {
  CalendarCheck,
  Stethoscope,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  Award,
} from 'lucide-react';
import ScheduleForm from '../components/ScheduleForm';
import '../styles/Landing.css';

/* ── Helpers ─────────────────────────────────────── */
const SERVICE_ICONS = [Stethoscope, ShieldCheck, Sparkles, Heart, Award, Star];

/* ── Section: Hero ───────────────────────────────── */
const Hero = ({ onBookClick }) => (
  <section className="lp-hero-new" id="home">
    <div className="lp-hero-new__overlay" />
    <div className="lp-hero-new__content animate-fade-in">
      <h1 className="lp-hero-new__title">
        Seamless<br />
        Dental Care
      </h1>
      <p className="lp-hero-new__subtitle">
        Whether it's a routine checkup or a major dental emergency,<br/>
        our experienced professionals are just a click away.
      </p>
      <button className="lp-btn lp-btn--hero" onClick={onBookClick} id="hero-book-btn">
        Book Appointment <ArrowRight size={16} />
      </button>
    </div>
  </section>
);

/* ── Section: Stats Banner ───────────────────────── */
const StatsBanner = () => (
  <section className="lp-stats">
    {[
      { value: '500+', label: 'Happy Patients' },
      { value: '10+', label: 'Years of Experience' },
      { value: '98%', label: 'Patient Satisfaction' },
      { value: '20+', label: 'Services Offered' },
    ].map((s, i) => (
      <div key={i} className="lp-stats__item">
        <span className="lp-stats__value">{s.value}</span>
        <span className="lp-stats__label">{s.label}</span>
      </div>
    ))}
  </section>
);

/* ── Section: About ──────────────────────────────── */
const About = () => (
  <section className="lp-about" id="about">
    <div className="lp-about__text animate-fade-in">
      <span className="lp-section-eyebrow">Who We Are</span>
      <h2 className="lp-section-title">A Clinic Built on Trust &amp; Excellence</h2>
      <p className="lp-about__body">
        At Stellar's Dental Clinic, we believe that a healthy smile is a foundation for confidence and well-being. Our team of dedicated dental professionals combines cutting-edge technology with personalised care to give you the best experience possible.
      </p>
      <ul className="lp-about__list">
        {['State-of-the-art dental equipment', 'Personalised treatment plans', 'Comfortable &amp; welcoming environment', 'Comprehensive dental services'].map((item, i) => (
          <li key={i} className="lp-about__list-item">
            <CheckCircle2 size={16} className="lp-about__check" />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
    <div className="lp-about__visual">
      <div className="lp-about__badge">
        <Award size={28} />
        <span>Certified<br/>Excellence</span>
      </div>
      <div className="lp-about__img-wrap">
        <div className="lp-about__img-placeholder">
          <Stethoscope size={64} strokeWidth={1} />
          <p>Stellar's Dental Clinic</p>
        </div>
      </div>
    </div>
  </section>
);

/* ── Section: Services ───────────────────────────── */
const Services = ({ services, loading }) => (
  <section className="lp-services" id="services">
    <div className="lp-section-header">
      <span className="lp-section-eyebrow">What We Offer</span>
      <h2 className="lp-section-title">Our Dental Services</h2>
      <p className="lp-section-sub">From routine check-ups to advanced procedures, we cover all your dental needs under one roof.</p>
    </div>
    {loading ? (
      <div className="lp-loading-row">
        {[1, 2, 3].map(i => <div key={i} className="lp-service-card lp-service-card--skeleton" />)}
      </div>
    ) : (
      <div className="lp-services__grid">
        {services.map((svc, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <div key={svc.id} className="lp-service-card animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="lp-service-card__icon">
                <Icon size={26} />
              </div>
              <h3 className="lp-service-card__name">{svc.name}</h3>
              <p className="lp-service-card__desc">{svc.description || 'Professional dental service tailored to your needs.'}</p>
              {svc.price && (
                <div className="lp-service-card__price">
                  <span>Starting at</span>
                  <strong>₱{Number(svc.price).toLocaleString()}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </section>
);

/* ── Section: Dentists ───────────────────────────── */
const Dentists = ({ dentists, loading }) => (
  <section className="lp-dentists" id="dentists">
    <div className="lp-section-header">
      <span className="lp-section-eyebrow">Meet the Team</span>
      <h2 className="lp-section-title">Our Team</h2>
      <p className="lp-section-sub">Skilled, compassionate professionals committed to your oral health.</p>
    </div>
    {loading ? (
      <div className="lp-dentists__grid">
        {[1, 2, 3].map(i => <div key={i} className="lp-dentist-card lp-dentist-card--skeleton" />)}
      </div>
    ) : dentists.length === 0 ? (
      <p className="lp-empty">Our team will be listed here soon.</p>
    ) : (
      <div className="lp-dentists__grid">
        {dentists.map((d, i) => {
          const initials = d.name ? d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';
          return (
            <div key={d.id} className="lp-dentist-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="lp-dentist-card__avatar">{initials}</div>
              <h3 className="lp-dentist-card__name">{d.name}</h3>
              <p className="lp-dentist-card__role">{d.role === 'dentist' ? 'Dentist' : 'Assistant'}</p>
            </div>
          );
        })}
      </div>
    )}
  </section>
);

/* ── Section: How It Works ───────────────────────── */
const HowItWorks = ({ onBookClick }) => (
  <section className="lp-how" id="how">
    <div className="lp-section-header">
      <span className="lp-section-eyebrow">Simple Process</span>
      <h2 className="lp-section-title">How It Works</h2>
    </div>
    <div className="lp-how__steps">
      {[
        { icon: <CalendarCheck size={28} />, step: '01', title: 'Book Online', desc: 'Choose a date and service that works best for you.' },
        { icon: <Stethoscope size={28} />, step: '02', title: 'See a Dentist', desc: 'Our expert dentist reviews your needs and creates a plan.' },
        { icon: <CheckCircle2 size={28} />, step: '03', title: 'Get Treated', desc: 'Receive world-class dental care in a comfortable environment.' },
      ].map((s, i) => (
        <div key={i} className="lp-how__step">
          <div className="lp-how__step-num">{s.step}</div>
          <div className="lp-how__step-icon">{s.icon}</div>
          <h3 className="lp-how__step-title">{s.title}</h3>
          <p className="lp-how__step-desc">{s.desc}</p>
          {i < 2 && <div className="lp-how__connector"><ArrowRight size={20} /></div>}
        </div>
      ))}
    </div>
    <button className="lp-btn lp-btn--primary lp-btn--center" onClick={onBookClick} id="how-book-btn">
      <CalendarCheck size={18} /> Book My Appointment
    </button>
  </section>
);

/* ── Section: FAQs ───────────────────────────────── */
const Faqs = ({ faqs, loading }) => {
  const [open, setOpen] = useState(null);
  return (
    <section className="lp-faqs" id="faqs">
      <div className="lp-section-header">
        <span className="lp-section-eyebrow">Got Questions?</span>
        <h2 className="lp-section-title">Frequently Asked Questions</h2>
      </div>
      {loading ? (
        <div className="lp-faq-skeleton-list">
          {[1, 2, 3].map(i => <div key={i} className="lp-faq-skeleton" />)}
        </div>
      ) : faqs.length === 0 ? (
        <p className="lp-empty">No FAQs available yet.</p>
      ) : (
        <div className="lp-faqs__list">
          {faqs.map((faq, i) => (
            <div key={faq.id} className={`lp-faq-item ${open === i ? 'lp-faq-item--open' : ''}`}>
              <button className="lp-faq-item__q" onClick={() => setOpen(open === i ? null : i)} id={`faq-${i}`}>
                <span>{faq.question}</span>
                {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {open === i && <div className="lp-faq-item__a">{faq.answer}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/* ── Section: Inline Booking ─────────────────────── */
const BookingSection = () => (
  <section className="lp-booking-section" id="appointment">
    <div className="lp-section-header">
      <span className="lp-section-eyebrow">Book Online</span>
      <h2 className="lp-section-title">Book Your Appointment</h2>
      <p className="lp-section-sub">Fill in your details, pick a date and time, and we'll confirm your appointment shortly.</p>
    </div>
    <div className="lp-booking-section__form">
      <ScheduleForm publicMode />
    </div>
  </section>
);

/* ── Main Landing Page ───────────────────────────── */
const Landing = () => {

  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [loadingDen, setLoadingDen] = useState(true);
  const [loadingFaq, setLoadingFaq] = useState(true);

  useEffect(() => {
    apiFetch('/api/services/public')
      .then(r => r.json())
      .then(j => setServices(j.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoadingSvc(false));

    apiFetch('/api/public/dentists')
      .then(r => r.json())
      .then(j => setDentists(j.data || []))
      .catch(() => setDentists([]))
      .finally(() => setLoadingDen(false));

    apiFetch('/api/public/faqs')
      .then(r => r.json())
      .then(j => setFaqs(j.data || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoadingFaq(false));
  }, []);

  const scrollToBooking = () => {
    document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-root">
      <div className="lp-bg-blob-top" />

      <Hero onBookClick={scrollToBooking} />
      <StatsBanner />
      <About />
      <Services services={services} loading={loadingSvc} />
      <HowItWorks onBookClick={scrollToBooking} />
      <Dentists dentists={dentists} loading={loadingDen} />
      <Faqs faqs={faqs} loading={loadingFaq} />
      <BookingSection />
    </div>
  );
};

export default Landing;
