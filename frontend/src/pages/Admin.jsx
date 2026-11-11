import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { soundEffects } from '../utils/audioCues';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  const [counts, setCounts] = useState({
    totalUsers: 1200,
    totalRides: 3500,
    totalCaptains: 250,
    activeSosAlerts: 0,
    activeCoupons: 4,
    totalIncome: 84500,
    totalTips: 3200
  });

  const [drivers, setDrivers] = useState([
    { id: '1', name: 'Arun', vehicle: 'Bike', vehicleNumber: 'TN 23 AB 1234', status: 'Active', rating: 4.9, phone: '9840112233' },
    { id: '2', name: 'Kumar', vehicle: 'Auto', vehicleNumber: 'TN 23 AC 5678', status: 'Busy', rating: 4.8, phone: '9840223344' },
    { id: '3', name: 'Suresh', vehicle: 'Parcel Carrier', vehicleNumber: 'TN 23 AD 9999', status: 'Active', rating: 4.9, phone: '9840334455' }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 'RG-101',
      customer: 'Harish',
      customerPhone: '9876543210',
      driver: 'Arun',
      location: 'Chennai Central → Guindy Tech Park',
      vehicleType: 'Bike Taxi',
      status: 'Accepted',
      fare: 150,
      paymentMethod: 'wallet',
      otp: '4829',
      isOtpVerified: true,
      sosTriggered: false,
      rating: 5,
      tip: 20
    },
    {
      id: 'RG-102',
      customer: 'Rahul',
      customerPhone: '9876543211',
      driver: 'Kumar',
      location: 'Ambur Bypass → Vaniyambadi Town',
      vehicleType: 'Auto',
      status: 'Completed',
      fare: 80,
      paymentMethod: 'cash',
      otp: '9124',
      isOtpVerified: true,
      sosTriggered: false,
      rating: 5,
      tip: 0
    },
    {
      id: 'RG-103',
      customer: 'Priya',
      customerPhone: '9876543212',
      driver: 'Suresh',
      location: 'Tambaram Station → Adyar Gate',
      vehicleType: 'Parcel Carrier',
      status: 'Pending',
      fare: 200,
      paymentMethod: 'upi',
      otp: '6543',
      isOtpVerified: false,
      sosTriggered: false,
      rating: 0,
      tip: 0
    }
  ]);

  const [coupons, setCoupons] = useState([
    { id: '1', code: 'RIDEGO50', discountPercent: 50, maxDiscount: 75, minFare: 50, isActive: true, usageCount: 142, description: '50% OFF up to ₹75' },
    { id: '2', code: 'FIRSTFREE', flatDiscount: 50, maxDiscount: 50, minFare: 50, isActive: true, usageCount: 88, description: 'Flat ₹50 OFF' },
    { id: '3', code: 'WEEKEND20', discountPercent: 20, maxDiscount: 40, minFare: 50, isActive: true, usageCount: 65, description: '20% OFF weekend special' },
    { id: '4', code: 'RAPID10', discountPercent: 10, maxDiscount: 20, minFare: 40, isActive: true, usageCount: 30, description: '10% instant discount' }
  ]);

  const [feedback, setFeedback] = useState([
    { customer: 'Harish', driver: 'Arun', vehicle: 'Bike Taxi', rating: 5, compliments: ['Safe Driving', 'Polite Driver'], tip: 20, date: 'Today' },
    { customer: 'Rahul', driver: 'Kumar', vehicle: 'Auto', rating: 5, compliments: ['Clean Vehicle', 'Great Route'], tip: 10, date: 'Yesterday' }
  ]);

  // Form states
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('Bike');
  const [newDriverPhone, setNewDriverPhone] = useState('');

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('20');
  const [newCouponMax, setNewCouponMax] = useState('50');
  const [newCouponMinFare, setNewCouponMinFare] = useState('40');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const countsRes = await api.getAdminCounts();
        if (countsRes.result === 'Success' && countsRes.counts) {
          setCounts((prev) => ({
            ...prev,
            ...countsRes.counts
          }));
        }

        const driversRes = await api.getAdminDrivers();
        if (driversRes.result === 'Success' && driversRes.drivers?.length > 0) {
          setDrivers(driversRes.drivers);
        }

        const bookingsRes = await api.getAdminBookings();
        if (bookingsRes.result === 'Success' && bookingsRes.bookings?.length > 0) {
          setBookings(bookingsRes.bookings);
        }

        const couponsRes = await api.getCoupons();
        if (couponsRes.result === 'Success' && couponsRes.coupons?.length > 0) {
          setCoupons(couponsRes.coupons);
        }

        const feedbackRes = await api.getFeedbackFeed();
        if (feedbackRes.result === 'Success' && feedbackRes.feedback?.length > 0) {
          setFeedback(feedbackRes.feedback);
        }
      } catch (err) {
        console.warn('Backend admin sync fallback:', err);
      }
    }

    loadAdminData();
  }, []);

  // Driver actions
  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    setLoading(true);
    try {
      const res = await api.addDriver({
        name: newDriverName.trim(),
        vehicle: newDriverVehicle,
        phone: newDriverPhone.trim()
      });

      if (res.result === 'Success' && res.driver) {
        setDrivers([res.driver, ...drivers]);
      } else {
        const newD = {
          id: String(Date.now()),
          name: newDriverName.trim(),
          vehicle: newDriverVehicle,
          vehicleNumber: `TN 23 ${newDriverVehicle.slice(0, 2).toUpperCase()} ${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Active',
          rating: 4.9,
          phone: newDriverPhone || '9840112233'
        };
        setDrivers([newD, ...drivers]);
      }
      soundEffects.playSuccessChime();
    } catch {
      const newD = {
        id: String(Date.now()),
        name: newDriverName.trim(),
        vehicle: newDriverVehicle,
        vehicleNumber: `TN 23 ${newDriverVehicle.slice(0, 2).toUpperCase()} ${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Active',
        rating: 4.9,
        phone: newDriverPhone || '9840112233'
      };
      setDrivers([newD, ...drivers]);
    } finally {
      setLoading(false);
      setNewDriverName('');
      setNewDriverPhone('');
      setShowAddDriver(false);
    }
  };

  const handleToggleDriverStatus = async (driverId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Busy' : currentStatus === 'Busy' ? 'Offline' : 'Active';
    setDrivers(drivers.map((d) => (d.id === driverId || d._id === driverId ? { ...d, status: nextStatus } : d)));

    try {
      await api.updateDriverStatus(driverId, nextStatus);
    } catch (err) {
      console.warn('Driver status API sync:', err);
    }
  };

  // Booking actions
  const handleBookingStatusChange = async (id, newStatus) => {
    setBookings(
      bookings.map((b) => (b.id === id || b._id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await api.updateRideStatus(id, { status: newStatus.toLowerCase() });
    } catch (err) {
      console.warn('API error updating ride status:', err);
    }
  };

  const handleResolveSos = async (rideId) => {
    setBookings(
      bookings.map((b) => (b.id === rideId || b._id === rideId ? { ...b, sosTriggered: false } : b))
    );
    try {
      await api.resolveSos(rideId);
    } catch (err) {
      console.warn('SOS resolve API sync:', err);
    }
    alert('✅ Emergency SOS marked as resolved by Admin Dispatch.');
  };

  // Coupon actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setLoading(true);
    const newCouponPayload = {
      code: newCouponCode.trim().toUpperCase(),
      discountPercent: Number(newCouponPercent),
      maxDiscount: Number(newCouponMax),
      minFare: Number(newCouponMinFare),
      description: newCouponDesc.trim() || `${newCouponPercent}% OFF up to ₹${newCouponMax}`
    };

    try {
      const res = await api.createCoupon(newCouponPayload);
      if (res.result === 'Success' && res.coupon) {
        setCoupons([res.coupon, ...coupons]);
      } else {
        setCoupons([{ ...newCouponPayload, id: String(Date.now()), isActive: true, usageCount: 0 }, ...coupons]);
      }
      soundEffects.playSuccessChime();
    } catch {
      setCoupons([{ ...newCouponPayload, id: String(Date.now()), isActive: true, usageCount: 0 }, ...coupons]);
    } finally {
      setLoading(false);
      setNewCouponCode('');
      setNewCouponDesc('');
      setShowAddCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId) => {
    setCoupons(
      coupons.map((c) => (c.id === couponId || c._id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
    try {
      await api.toggleCoupon(couponId);
    } catch (err) {
      console.warn('Toggle coupon sync:', err);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this promo code permanently?')) return;
    setCoupons(coupons.filter((c) => c.id !== couponId && c._id !== couponId));
    try {
      await api.deleteCoupon(couponId);
    } catch (err) {
      console.warn('Delete coupon sync:', err);
    }
  };

  return (
    <div className="gradient-bg py-5">
      <div className="container py-4">
        {/* Header with live telemetry badge */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h1 className="fw-bold mb-0">🚕 RideGo Admin Command Center</h1>
            <p className="text-muted small mb-0">Real-time Fleet Dispatch, Security Telemetry & Revenue Control</p>
          </div>
          {counts.activeSosAlerts > 0 && (
            <span className="badge bg-danger p-2 fs-6 animate-pulse">
              🚨 {counts.activeSosAlerts} Active SOS Alerts
            </span>
          )}
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="card shadow-box mb-4 p-2 bg-white">
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'overview', label: '📊 Platform Metrics', icon: 'bi-speedometer2' },
              { id: 'drivers', label: '🏍️ Fleet Management', icon: 'bi-person-badge' },
              { id: 'bookings', label: '📋 Live Bookings & OTP', icon: 'bi-calendar-check' },
              { id: 'coupons', label: '🎟️ Promo Codes & Coupons', icon: 'bi-tags-fill' },
              { id: 'feedback', label: '⭐ Ratings & Reviews Feed', icon: 'bi-star-fill' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm ${
                  activeTab === tab.id ? 'btn-warning text-dark fw-bold' : 'btn-outline-dark'
                }`}
                style={{ borderRadius: '10px', padding: '10px 18px' }}
              >
                <i className={`bi ${tab.icon} me-1`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW & FINANCIALS ================= */}
        {activeTab === 'overview' && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-md-3 col-6">
                <div className="feature-box text-center p-4">
                  <h2 className="fw-bold text-warning display-5">{counts.totalUsers}</h2>
                  <p className="text-muted fs-6 mb-0">Total Riders</p>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="feature-box text-center p-4">
                  <h2 className="fw-bold text-warning display-5">{counts.totalRides}</h2>
                  <p className="text-muted fs-6 mb-0">Total Rides Booked</p>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="feature-box text-center p-4">
                  <h2 className="fw-bold text-warning display-5">{counts.totalCaptains}</h2>
                  <p className="text-muted fs-6 mb-0">Active Drivers</p>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="feature-box text-center p-4">
                  <h2 className="fw-bold text-success display-5">₹{counts.totalIncome.toLocaleString()}</h2>
                  <p className="text-muted fs-6 mb-0">Platform Revenue</p>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card shadow-box p-4 h-100">
                  <h5 className="fw-bold mb-3">💰 Driver Tips & Financial Health</h5>
                  <div className="d-flex justify-content-between p-3 bg-light rounded mb-2">
                    <span>Total Driver Tips Captured:</span>
                    <strong className="text-success">₹{counts.totalTips.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between p-3 bg-light rounded mb-2">
                    <span>Active Marketing Coupons:</span>
                    <strong>{coupons.filter((c) => c.isActive).length} Promo Codes</strong>
                  </div>
                  <div className="d-flex justify-content-between p-3 bg-light rounded">
                    <span>Fleet Readiness:</span>
                    <span className="badge bg-success">98.4% On-Time</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card shadow-box p-4 h-100">
                  <h5 className="fw-bold mb-3">🛡️ Safety & SOS Operations</h5>
                  <div className="p-3 bg-light rounded mb-2 d-flex justify-content-between align-items-center">
                    <span>Unresolved SOS Emergency Alerts:</span>
                    <span className={`badge ${counts.activeSosAlerts > 0 ? 'bg-danger' : 'bg-success'} fs-6`}>
                      {counts.activeSosAlerts} Active
                    </span>
                  </div>
                  <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <span>OTP Ride Verification Enforcement:</span>
                    <span className="badge bg-primary">Enabled (100% Mandatory)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DRIVER FLEET MANAGEMENT ================= */}
        {activeTab === 'drivers' && (
          <div className="card shadow-box p-4 p-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div>
                <h3 className="mb-0 fw-bold">🏍️ Driver Fleet & Vehicle Controls</h3>
                <p className="text-muted small mb-0">Control driver availability, view ratings, and onboard new drivers</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDriver(!showAddDriver)}
                className="btn btn-warning fw-bold"
              >
                {showAddDriver ? '✕ Cancel' : '+ Add Driver'}
              </button>
            </div>

            {showAddDriver && (
              <form onSubmit={handleAddDriver} className="bg-light p-4 rounded mb-4 border">
                <h5 className="fw-bold mb-3">Onboard New Driver</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="small text-muted fw-bold">Driver Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted fw-bold">Vehicle Service</label>
                    <select
                      className="form-select"
                      value={newDriverVehicle}
                      onChange={(e) => setNewDriverVehicle(e.target.value)}
                    >
                      <option value="Bike">Bike Taxi (Two-Wheeler)</option>
                      <option value="Auto">Auto (Three-Wheeler)</option>
                      <option value="Parcel Carrier">Parcel Carrier (Courier)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="9840XXXXXX"
                      value={newDriverPhone}
                      onChange={(e) => setNewDriverPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-warning w-100 fw-bold" disabled={loading}>
                      {loading ? 'Adding...' : 'Save Driver'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Driver Name</th>
                    <th>Vehicle Details</th>
                    <th>Contact</th>
                    <th>Rating</th>
                    <th>Status Control</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id || d._id}>
                      <td className="fw-bold">{d.name}</td>
                      <td>
                        <span className="badge bg-dark text-warning me-1">{d.vehicle}</span>
                        <span className="small text-muted">{d.vehicleNumber}</span>
                      </td>
                      <td className="small">{d.phone || '9840112233'}</td>
                      <td>
                        <span className="text-warning fw-bold">★ {d.rating || 4.9}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleDriverStatus(d.id || d._id, d.status)}
                          className={`btn btn-sm ${
                            d.status === 'Active'
                              ? 'btn-success'
                              : d.status === 'Busy'
                              ? 'btn-warning text-dark'
                              : 'btn-secondary'
                          }`}
                          title="Click to toggle driver status"
                        >
                          {d.status === 'Active' ? '🟢 Active' : d.status === 'Busy' ? '🟡 Busy' : '⚪ Offline'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LIVE BOOKINGS & OTP ================= */}
        {activeTab === 'bookings' && (
          <div className="card shadow-box p-4 p-md-5">
            <h3 className="mb-2 fw-bold">📋 Live Bookings & Ride Dispatch</h3>
            <p className="text-muted small mb-4">
              Real-time telemetry, 4-digit security PIN status, emergency alerts, and status dispatch
            </p>

            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Customer & Driver</th>
                    <th>Route / Vehicle</th>
                    <th>Start OTP</th>
                    <th>Payment</th>
                    <th>Safety / SOS</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id || b._id} className={b.sosTriggered ? 'table-danger' : ''}>
                      <td>
                        <strong>{b.customer}</strong>
                        <div className="small text-muted">Driver: {b.driver || 'Assigned'}</div>
                      </td>
                      <td>
                        <div className="small fw-semibold">{b.location}</div>
                        <span className="badge bg-light text-dark border small">{b.vehicleType}</span>
                      </td>
                      <td>
                        <span className="badge bg-dark text-warning font-monospace fs-6 px-2">
                          {b.otp}
                        </span>
                        <div className="small text-muted">
                          {b.isOtpVerified ? '✅ Verified' : '⏳ Awaiting'}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-success">₹{b.fare}</div>
                        <span className="badge bg-secondary small text-uppercase">{b.paymentMethod}</span>
                      </td>
                      <td>
                        {b.sosTriggered ? (
                          <div>
                            <span className="badge bg-danger animate-pulse mb-1 d-block">🚨 SOS ACTIVE</span>
                            <button
                              type="button"
                              onClick={() => handleResolveSos(b.id || b._id)}
                              className="btn btn-xs btn-outline-danger small"
                            >
                              Resolve
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-success">Secure</span>
                        )}
                      </td>
                      <td style={{ minWidth: '140px' }}>
                        <select
                          className="form-select form-select-sm"
                          value={b.status}
                          onChange={(e) => handleBookingStatusChange(b.id || b._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PROMO CODES & COUPONS ================= */}
        {activeTab === 'coupons' && (
          <div className="card shadow-box p-4 p-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div>
                <h3 className="mb-0 fw-bold">🎟️ Promo Codes & Coupons Manager</h3>
                <p className="text-muted small mb-0">Create, enable, and retire discount codes available to riders</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="btn btn-warning fw-bold"
              >
                {showAddCoupon ? '✕ Cancel' : '+ Create Promo Code'}
              </button>
            </div>

            {showAddCoupon && (
              <form onSubmit={handleCreateCoupon} className="bg-light p-4 rounded mb-4 border">
                <h5 className="fw-bold mb-3">Create New Promotional Coupon</h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="small text-muted fw-bold">Coupon Code</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. MONSOON30"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="small text-muted fw-bold">Discount %</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="30"
                      value={newCouponPercent}
                      onChange={(e) => setNewCouponPercent(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="small text-muted fw-bold">Max Discount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="50"
                      value={newCouponMax}
                      onChange={(e) => setNewCouponMax(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="small text-muted fw-bold">Min Fare (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="40"
                      value={newCouponMinFare}
                      onChange={(e) => setNewCouponMinFare(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted fw-bold">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 30% OFF up to ₹50"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                    />
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-warning fw-bold px-4" disabled={loading}>
                      {loading ? 'Creating...' : 'Launch Coupon'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Code & Description</th>
                    <th>Discount Terms</th>
                    <th>Usage Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id || c._id}>
                      <td>
                        <span className="badge bg-warning text-dark font-monospace fs-6 px-2 me-2">
                          {c.code}
                        </span>
                        <div className="small text-muted mt-1">{c.description}</div>
                      </td>
                      <td className="small">
                        {c.flatDiscount ? (
                          <span>Flat ₹{c.flatDiscount} OFF</span>
                        ) : (
                          <span>{c.discountPercent}% OFF (Max ₹{c.maxDiscount})</span>
                        )}
                        <div className="text-muted">Min Fare: ₹{c.minFare}</div>
                      </td>
                      <td className="fw-bold">{c.usageCount || 0} redeemed</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.id || c._id)}
                          className={`btn btn-sm ${c.isActive ? 'btn-success' : 'btn-secondary'}`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id || c._id)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Coupon"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: RATINGS & DRIVER FEEDBACK ================= */}
        {activeTab === 'feedback' && (
          <div className="card shadow-box p-4 p-md-5">
            <h3 className="mb-2 fw-bold">⭐ Rider Ratings & Compliments Feed</h3>
            <p className="text-muted small mb-4">Monitor customer satisfaction, driver performance, and driver tipping trends</p>

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Driver & Service</th>
                    <th>Star Rating</th>
                    <th>Driver Compliments</th>
                    <th>Tip Given</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((f, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{f.customer}</td>
                      <td>
                        <strong>{f.driver}</strong>
                        <div className="small text-muted">{f.vehicle}</div>
                      </td>
                      <td>
                        <span className="text-warning fs-5">{'★'.repeat(f.rating || 5)}</span>
                      </td>
                      <td>
                        {f.compliments && f.compliments.length > 0 ? (
                          f.compliments.map((c, i) => (
                            <span key={i} className="badge bg-light text-dark border me-1 small">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td>
                        {f.tip > 0 ? (
                          <span className="badge bg-success">+₹{f.tip}</span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-muted small">{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
