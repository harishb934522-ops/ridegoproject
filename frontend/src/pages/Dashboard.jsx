import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useWallet } from '../context/useWallet';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const wallet = useWallet();
  const currentUser = auth?.user;

  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Harish',
    email: currentUser?.email || 'harish@gmail.com',
    totalRides: 25,
    totalSpent: 2500,
    rating: '5⭐'
  });

  const [rides, setRides] = useState([
    {
      id: 'RG-101',
      from: 'Chennai Central',
      to: 'Guindy Tech Park',
      fare: '₹150',
      date: 'Today',
      driver: 'Arun (TN 23 AB 1234)',
      vehicle: 'Bike Taxi',
      status: 'Completed'
    },
    {
      id: 'RG-102',
      from: 'Ambur Bypass',
      to: 'Vaniyambadi Town',
      fare: '₹80',
      date: 'Yesterday',
      driver: 'Kumar (TN 23 AC 5678)',
      vehicle: 'Auto',
      status: 'Completed'
    },
    {
      id: 'RG-103',
      from: 'Tambaram Station',
      to: 'Adyar Gate',
      fare: '₹120',
      date: '2 days ago',
      driver: 'Suresh (TN 23 AD 9999)',
      vehicle: 'Parcel Carrier',
      status: 'Completed'
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      if (auth?.token) {
        try {
          const res = await api.getUserProfile(auth.token);
          if (res.result === 'Success' && res.user) {
            setProfile({
              name: res.user.name || currentUser?.name || 'Harish',
              email: res.user.email || currentUser?.email || 'harish@gmail.com',
              totalRides: res.user.totalRides || 25,
              totalSpent: res.user.totalSpent || 2500,
              rating: '5⭐'
            });

            if (res.user.rideHistory && res.user.rideHistory.length > 0) {
              const formatted = res.user.rideHistory.map((r) => ({
                id: r._id || `RG-${Math.floor(100 + Math.random() * 900)}`,
                from: r.pickup || r.startLocation || 'Pickup',
                to: r.drop || r.endLocation || 'Drop',
                fare: `₹${r.price || r.fare || 50}`,
                date: r.date || new Date(r.createdAt).toLocaleDateString(),
                driver: r.captain ? `${r.captain.name} (${r.captain.vehicleDetails?.vehicleNumber || 'Vehicle'})` : 'Arun',
                vehicle: r.vehicleType || 'Ride',
                status: r.status === 'completed' ? 'Completed' : 'Completed'
              }));
              setRides(formatted);
            }
          }
        } catch (err) {
          console.warn('Could not fetch remote user profile, using active session:', err);
        }
      }
    }

    loadDashboard();
  }, [auth?.token, currentUser]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      auth?.logout();
      alert('Logged out successfully.');
      navigate('/login');
    }
  };

  const handleAddFunds = (amt) => {
    const amount = Number(amt || topUpAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    wallet?.addFunds(amount);
    setTopUpAmount('');
    alert(`✅ Successfully added ₹${amount} to your RideGo Wallet!`);
  };

  return (
    <div className="gradient-bg py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow-box p-4 p-md-5">
              <h2 className="text-center mb-4">👤 My Dashboard</h2>

              {/* Profile Card */}
              <div className="text-center mb-4">
                <div className="icon-circle">
                  👤
                </div>
                <h4 className="mt-3 mb-1">{profile.name}</h4>
                <p className="text-muted mb-2">{profile.email}</p>
                <div className="d-flex justify-content-center gap-2">
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                    💰 Wallet: ₹{wallet?.balance ?? 250}
                  </span>
                  <span className="badge bg-dark text-warning px-3 py-2 fs-6">
                    🪙 Coins: {wallet?.coins ?? 50}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="row text-center mb-4 g-3">
                <div className="col-md-4">
                  <div className="feature-box p-3">
                    <h3 className="fw-bold text-warning mb-1">{profile.totalRides}</h3>
                    <p className="mb-0 text-muted">Total Rides</p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="feature-box p-3">
                    <h3 className="fw-bold text-warning mb-1">₹{profile.totalSpent}</h3>
                    <p className="mb-0 text-muted">Total Spent</p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="feature-box p-3">
                    <h3 className="fw-bold text-warning mb-1">{profile.rating}</h3>
                    <p className="mb-0 text-muted">Rider Rating</p>
                  </div>
                </div>
              </div>

              {/* Interactive Wallet Top-Up Tool */}
              <div className="p-4 mb-4 bg-light rounded border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-wallet2 text-warning me-2"></i> RideGo Wallet
                  </h5>
                  <span className="fw-bold fs-5 text-success">
                    ₹{wallet?.balance ?? 250}
                  </span>
                </div>

                <div className="row g-2 mb-3">
                  {[100, 250, 500, 1000].map((preset) => (
                    <div key={preset} className="col-3">
                      <button
                        type="button"
                        onClick={() => handleAddFunds(preset)}
                        className="btn btn-outline-dark btn-sm w-100 fw-bold"
                      >
                        + ₹{preset}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter custom amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFunds()}
                    className="btn btn-warning fw-bold"
                  >
                    Top-Up Balance
                  </button>
                </div>
              </div>

              {/* Booking History with Digital Invoice View */}
              <h4 className="mb-3 fw-bold">Recent Rides & Invoices</h4>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>From & To</th>
                      <th>Driver / Vehicle</th>
                      <th>Fare</th>
                      <th>When</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((r, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{r.from}</strong>
                          <div className="small text-muted">→ {r.to}</div>
                        </td>
                        <td>
                          <div>{r.driver}</div>
                          <span className="badge bg-light text-dark border small">{r.vehicle}</span>
                        </td>
                        <td>
                          <span className="badge bg-success fs-6">{r.fare}</span>
                        </td>
                        <td className="text-muted small">{r.date}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(r)}
                            className="btn btn-sm btn-outline-dark"
                            title="View & Download Digital Tax Invoice"
                          >
                            <i className="bi bi-receipt me-1"></i> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="btn btn-warning flex-grow-1 py-3 fw-bold"
                >
                  Book New Ride
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ borderRadius: '50px', padding: '14px 30px' }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Tax Invoice Modal */}
        {selectedInvoice && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content p-4 border-warning">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3 text-warning fw-bold">RideGo</span>
                    <span className="badge bg-warning text-dark">TAX INVOICE</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedInvoice(null)}
                  ></button>
                </div>

                <div className="small text-muted mb-3 d-flex justify-content-between">
                  <span>Invoice ID: <strong>INV-{selectedInvoice.id || '2026-9821'}</strong></span>
                  <span>Date: {selectedInvoice.date}</span>
                </div>

                <div className="bg-light p-3 rounded mb-3 border small">
                  <div className="row g-2">
                    <div className="col-6">
                      <strong>Customer:</strong> {profile.name}
                    </div>
                    <div className="col-6">
                      <strong>Driver:</strong> {selectedInvoice.driver}
                    </div>
                    <div className="col-6">
                      <strong>Pickup:</strong> {selectedInvoice.from}
                    </div>
                    <div className="col-6">
                      <strong>Drop:</strong> {selectedInvoice.to}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="small mb-3">
                  <div className="d-flex justify-content-between py-1">
                    <span>Base Ride Fare</span>
                    <span>{selectedInvoice.fare}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 text-muted">
                    <span>Platform Safety & Access Fee</span>
                    <span>₹5.00</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 text-muted">
                    <span>GST (5%)</span>
                    <span>Included</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between fw-bold fs-6">
                    <span>Total Paid</span>
                    <span className="text-success">{selectedInvoice.fare}</span>
                  </div>
                  <div className="text-muted small mt-1">Payment Status: <strong>PAID (RideGo Electronic Settlement)</strong></div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-warning flex-grow-1"
                  >
                    <i className="bi bi-printer me-1"></i> Print / Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="btn btn-outline-dark"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
