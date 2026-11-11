import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import LiveRideMap from '../components/LiveRideMap';
import { soundEffects, triggerConfetti } from '../utils/audioCues';

export default function Booking() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [vehicle, setVehicle] = useState(() => {
    const vParam = searchParams.get('vehicle');
    return vParam && ['50', '100', '200'].includes(vParam) ? vParam : '50';
  });
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Parcel delivery options
  const [parcelCategory, setParcelCategory] = useState('Documents');
  const [parcelWeight, setParcelWeight] = useState(2);
  const [recipientPhone, setRecipientPhone] = useState('');

  // Promo code & discounts
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);



  const getVehicleName = (val) => {
    switch (val) {
      case '50':
        return 'Bike Taxi';
      case '100':
        return 'Auto';
      case '200':
        return 'Parcel Delivery';
      default:
        return 'Ride';
    }
  };

  const baseFare = Number(vehicle);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const platformFee = 5;
  const totalPayable = Math.max(baseFare + platformFee - discountAmount, 0);

  const handleApplyCoupon = async (codeToTry = couponCode) => {
    const code = (codeToTry || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponError('');
    setCouponLoading(true);

    try {
      const res = await api.validateCoupon(code, baseFare);
      if (res.result === 'Success' && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCode(res.coupon.code);
        triggerConfetti();
        soundEffects.playSuccessChime();
      } else {
        setCouponError(res.message || 'Invalid or expired promo code.');
      }
    } catch {
      // Local fallback for offline mode
      if (code === 'RIDEGO50') {
        const disc = Math.round(baseFare * 0.5);
        setAppliedCoupon({ code: 'RIDEGO50', discount: disc, description: '50% OFF (Offline)' });
        triggerConfetti();
        soundEffects.playSuccessChime();
      } else if (code === 'FIRSTFREE') {
        setAppliedCoupon({ code: 'FIRSTFREE', discount: Math.min(50, baseFare), description: 'Flat ₹50 OFF' });
        triggerConfetti();
        soundEffects.playSuccessChime();
      } else {
        setCouponError('Invalid promo code. Try RIDEGO50 or FIRSTFREE');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!pickup.trim() || !drop.trim()) {
      alert('Please enter both locations.');
      return;
    }

    setLoading(true);
    soundEffects.playBookingChime();

    const bookingPayload = {
      pickup: pickup.trim(),
      drop: drop.trim(),
      fare: totalPayable,
      price: totalPayable,
      discount: discountAmount,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : '',
      vehicleType: getVehicleName(vehicle),
      date,
      time,
      userId: auth?.user?._id,
      parcelDetails: vehicle === '200' ? {
        category: parcelCategory,
        weight: parcelWeight,
        recipientPhone: recipientPhone || 'N/A'
      } : undefined
    };

    try {
      const data = await api.bookRide(bookingPayload, auth?.token);
      const activeRide = data.ride || {
        ...bookingPayload,
        _id: `ride_${Date.now()}`,
        status: 'pending',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        captain: {
          name: 'Arun',
          phone: '9840112233',
          vehicleDetails: { vehicleNumber: 'TN 23 AB 1234', vehicleModel: 'Honda Activa 6G' }
        }
      };

      localStorage.setItem('activeRide', JSON.stringify(activeRide));
      navigate('/payment', { state: activeRide });
    } catch (err) {
      console.warn('Backend booking API error, using local booking fallback:', err);
      const fallbackRide = {
        ...bookingPayload,
        _id: `ride_${Date.now()}`,
        status: 'pending',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        captain: {
          name: 'Arun',
          phone: '9840112233',
          vehicleDetails: { vehicleNumber: 'TN 23 AB 1234', vehicleModel: 'Honda Activa 6G' }
        }
      };
      localStorage.setItem('activeRide', JSON.stringify(fallbackRide));
      navigate('/payment', { state: fallbackRide });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-box p-4 p-md-5">
              <h2 className="text-center mb-3">🏍️ Book Your Ride</h2>

              {/* Live Route Interactive Map Preview */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted fw-semibold">
                    <i className="bi bi-geo-alt-fill text-warning me-1"></i> Interactive Route Preview
                  </span>
                  <span className="badge bg-success">🟢 Normal Traffic (14 mins)</span>
                </div>
                <LiveRideMap
                  pickupName={pickup.trim() || 'Central'}
                  dropName={drop.trim() || 'Guindy'}
                  vehicleType={getVehicleName(vehicle)}
                  height="220px"
                />
              </div>

              <form onSubmit={handleBooking} id="rideForm">
                <label className="fw-semibold mb-2">Pickup Location</label>
                <input
                  id="pickup"
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter pickup location (e.g. Chennai Central)"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  required
                />

                <label className="fw-semibold mb-2">Drop Location</label>
                <input
                  id="drop"
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter drop location (e.g. Guindy Tech Park)"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  required
                />

                <label className="fw-semibold mb-2">Select Vehicle</label>
                <select
                  id="vehicle"
                  className="form-select mb-3"
                  value={vehicle}
                  onChange={(e) => {
                    setVehicle(e.target.value);
                    setAppliedCoupon(null);
                  }}
                >
                  <option value="50">🏍️ Bike Taxi - ₹50 (Solo & Quick)</option>
                  <option value="100">🛺 Auto - ₹100 (Comfortable 3-Seater)</option>
                  <option value="200">📦 Parcel Delivery - ₹200 (Doorstep Courier)</option>
                </select>

                {/* Parcel Mode Specific Details */}
                {vehicle === '200' && (
                  <div className="p-3 mb-3 bg-light rounded border">
                    <h6 className="fw-bold text-warning mb-2">📦 Parcel Specifications</h6>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="small text-muted">Category</label>
                        <select
                          className="form-select form-select-sm"
                          value={parcelCategory}
                          onChange={(e) => setParcelCategory(e.target.value)}
                        >
                          <option value="Documents">Documents</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Food & Groceries">Food & Groceries</option>
                          <option value="Clothing & Gifts">Clothing & Gifts</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="small text-muted">Weight: {parcelWeight} kg</label>
                        <input
                          type="range"
                          className="form-range"
                          min="0.5"
                          max="15"
                          step="0.5"
                          value={parcelWeight}
                          onChange={(e) => setParcelWeight(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="Recipient Phone Number (Optional)"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                    />
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="fw-semibold mb-1 small">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="fw-semibold mb-1 small">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Promo Code & Coupon Section */}
                <div className="mb-4">
                  <label className="fw-semibold mb-1 small">Have a Promo Code?</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="Enter code (e.g. RIDEGO50)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={() => handleApplyCoupon(couponCode)}
                      disabled={couponLoading}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {couponError && <p className="text-danger small mb-2">{couponError}</p>}

                  {appliedCoupon && (
                    <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <i className="bi bi-tag-fill me-1"></i> Coupon <strong>{appliedCoupon.code}</strong> applied! Saved ₹{appliedCoupon.discount}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-sm"
                        onClick={() => setAppliedCoupon(null)}
                      ></button>
                    </div>
                  )}

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('RIDEGO50')}
                      className="badge bg-light text-dark border text-decoration-none"
                    >
                      🎉 RIDEGO50 (50% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FIRSTFREE')}
                      className="badge bg-light text-dark border text-decoration-none"
                    >
                      🎁 FIRSTFREE (₹50 OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('WEEKEND20')}
                      className="badge bg-light text-dark border text-decoration-none"
                    >
                      ⭐ WEEKEND20 (20% OFF)
                    </button>
                  </div>
                </div>

                {/* Itemized Fare Breakdown */}
                <div className="bg-light p-3 rounded mb-4 border">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Base Ride Fare:</span>
                    <span>₹{baseFare}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Distance Charge (5.2 km):</span>
                    <span className="text-success">Included</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Platform Safety Fee:</span>
                    <span>₹{platformFee}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between small mb-1 text-success fw-bold">
                      <span>Promo Discount ({appliedCoupon?.code}):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Estimated Fare:</span>
                    <span className="text-warning">₹{totalPayable}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={loading}
                >
                  {loading ? 'Securing Driver...' : `Confirm & Pay ₹${totalPayable}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
