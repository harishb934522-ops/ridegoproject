import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/banner.png';
import bikeImg from '../assets/bike.png';
import autoImg from '../assets/auto.png';
import parcelImg from '../assets/parcel.png';
import featuresImg from '../assets/features.png';

export default function Home() {
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email) {
      alert('Please fill in your name and email.');
      return;
    }
    setContactSubmitted(true);
    alert('Thank you for contacting RideGo! We will get back to you shortly.');
    setContactData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="home-page">
      {/* ================= HERO ================= */}
      <section id="home" className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-3 fw-bold">
                Ride Smarter.<br />
                Travel Faster.
              </h1>

              <p className="lead mt-4">
                Book Bike, Auto and Parcel Delivery in seconds. Fast, Safe and Affordable rides anytime.
              </p>

              <div className="mt-4">
                <button
                  onClick={() => navigate('/booking')}
                  className="btn btn-warning btn-lg me-3"
                >
                  Book Ride
                </button>

                <a href="#download" className="btn btn-outline-dark btn-lg">
                  Download App
                </a>
              </div>

              <div className="row mt-5">
                <div className="col-4 text-center">
                  <h2 className="fw-bold text-warning">1M+</h2>
                  <p>Happy Users</p>
                </div>
                <div className="col-4 text-center">
                  <h2 className="fw-bold text-warning">5000+</h2>
                  <p>Drivers</p>
                </div>
                <div className="col-4 text-center">
                  <h2 className="fw-bold text-warning">100+</h2>
                  <p>Cities</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <img
                src={bannerImg}
                alt="RideGo Banner"
                className="img-fluid hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5">Our Services</h2>
            <p className="text-muted">Choose the ride that suits your journey.</p>
          </div>

          <div className="row g-4">
            {/* Bike Taxi */}
            <div className="col-lg-4">
              <div className="card service-card h-100">
                <img src={bikeImg} className="card-img-top" alt="Bike Taxi" />
                <div className="card-body text-center">
                  <i className="bi bi-scooter service-icon"></i>
                  <h4 className="mt-3">Bike Taxi</h4>
                  <p>Beat traffic with affordable and quick bike rides.</p>
                  <button
                    onClick={() => navigate('/booking?vehicle=50')}
                    className="btn btn-warning"
                  >
                    Book Bike
                  </button>
                </div>
              </div>
            </div>

            {/* Auto Ride */}
            <div className="col-lg-4">
              <div className="card service-card h-100">
                <img src={autoImg} className="card-img-top" alt="Auto Ride" />
                <div className="card-body text-center">
                  <i className="bi bi-taxi-front-fill service-icon"></i>
                  <h4 className="mt-3">Auto Ride</h4>
                  <p>Comfortable auto rides at the best price.</p>
                  <button
                    onClick={() => navigate('/booking?vehicle=100')}
                    className="btn btn-warning"
                  >
                    Book Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Parcel Delivery */}
            <div className="col-lg-4">
              <div className="card service-card h-100">
                <img src={parcelImg} className="card-img-top" alt="Parcel Delivery" />
                <div className="card-body text-center">
                  <i className="bi bi-box-seam-fill service-icon"></i>
                  <h4 className="mt-3">Parcel Delivery</h4>
                  <p>Send parcels safely with live tracking.</p>
                  <button
                    onClick={() => navigate('/booking?vehicle=200')}
                    className="btn btn-warning"
                  >
                    Send Parcel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 col-6 mb-4">
              <div className="stat-box">
                <i className="bi bi-people-fill stat-icon"></i>
                <h2>1M+</h2>
                <p>Happy Customers</p>
              </div>
            </div>

            <div className="col-md-3 col-6 mb-4">
              <div className="stat-box">
                <i className="bi bi-person-badge-fill stat-icon"></i>
                <h2>5000+</h2>
                <p>Drivers</p>
              </div>
            </div>

            <div className="col-md-3 col-6 mb-4">
              <div className="stat-box">
                <i className="bi bi-geo-alt-fill stat-icon"></i>
                <h2>100+</h2>
                <p>Cities</p>
              </div>
            </div>

            <div className="col-md-3 col-6 mb-4">
              <div className="stat-box">
                <i className="bi bi-star-fill stat-icon"></i>
                <h2>4.9</h2>
                <p>Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5">Why Choose RideGo?</h2>
            <p className="text-muted">Fast • Safe • Affordable • Trusted</p>
          </div>

          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="feature-box text-center">
                <div className="feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Safe Ride</h4>
                <p>Every ride is verified and secured for your safety.</p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="feature-box text-center">
                <div className="feature-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h4>Live Tracking</h4>
                <p>Track your ride in real time from pickup to drop.</p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="feature-box text-center">
                <div className="feature-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <h4>Quick Booking</h4>
                <p>Book your ride within seconds with one click.</p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="feature-box text-center">
                <div className="feature-icon">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <h4>Low Price</h4>
                <p>Affordable fares with no hidden charges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOWNLOAD APP ================= */}
      <section id="download" className="download-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold">Download the RideGo App</h2>
              <p className="lead mt-4">
                Book rides faster, track your driver live and enjoy exciting offers.
              </p>
              <div className="mt-4 d-flex flex-wrap gap-3">
                <button className="btn btn-dark btn-lg">
                  <i className="bi bi-google-play me-2"></i> Play Store
                </button>
                <button className="btn btn-success btn-lg">
                  <i className="bi bi-apple me-2"></i> App Store
                </button>
              </div>
            </div>

            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <img
                src={featuresImg}
                className="img-fluid phone-img"
                alt="RideGo App"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-100">
        <div className="container">
          <h2 className="text-center mb-5">Contact Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form onSubmit={handleContactSubmit} className="shadow-box p-5 rounded-box bg-white contact-form">
                {contactSubmitted && (
                  <div className="alert alert-success mb-4">
                    Message sent successfully! Our team will contact you soon.
                  </div>
                )}
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Name"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your Email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                />
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Your Message"
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  required
                ></textarea>
                <button type="submit" className="btn btn-warning">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

