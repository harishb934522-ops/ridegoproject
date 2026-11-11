import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useWallet } from '../context/useWallet';
import { soundEffects } from '../utils/audioCues';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useWallet();

  const savedRide = JSON.parse(localStorage.getItem('activeRide') || '{}');
  const ride = location.state || savedRide;

  const pickup = ride.pickup || ride.startLocation || 'Chennai';
  const drop = ride.drop || ride.endLocation || 'Vellore';
  const fare = Number(ride.fare || ride.price || 100);
  const discount = Number(ride.discount || 0);

  const [paymentMethod, setPaymentMethod] = useState(
    wallet && wallet.balance >= fare ? 'wallet' : 'upi'
  );
  const [paymentInput, setPaymentInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayNow = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'wallet') {
      if (wallet.balance < fare) {
        alert(`Insufficient wallet balance (₹${wallet.balance}). Please top up or choose another payment method.`);
        return;
      }
      wallet.deductFunds(fare, `Ride from ${pickup} to ${drop}`);
    } else if (paymentMethod !== 'cash' && !paymentInput.trim()) {
      alert(`Please enter your ${paymentMethod === 'upi' ? 'UPI ID' : 'Card Number'}.`);
      return;
    }

    setLoading(true);
    soundEffects.playSuccessChime();

    try {
      if (ride._id && !ride._id.startsWith('ride_')) {
        await api.updateRideStatus(ride._id, {
          status: 'on the way',
          paymentMethod,
          paymentStatus: 'completed'
        });
      }
    } catch (err) {
      console.warn('Payment update API failed, continuing with active session:', err);
    } finally {
      setLoading(false);
    }

    const updatedRide = {
      ...ride,
      status: 'on the way',
      paymentMethod,
      paymentStatus: 'completed'
    };
    localStorage.setItem('activeRide', JSON.stringify(updatedRide));

    alert('🎉 Payment Processed Successfully! Redirecting to live tracking...');
    navigate('/tracking', {
      state: updatedRide
    });
  };

  return (
    <div className="gradient-bg py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-box p-4 p-md-5">
              <h2 className="text-center mb-4">💳 Payment</h2>

              <h5 className="fw-bold mb-3">Ride Details</h5>
              <div className="bg-light p-3 rounded mb-4 border">
                <p className="mb-2"><strong>Pickup:</strong> {pickup}</p>
                <p className="mb-2"><strong>Drop:</strong> {drop}</p>
                {discount > 0 && (
                  <p className="mb-2 text-success">
                    <strong>Coupon Savings:</strong> -₹{discount}
                  </p>
                )}
                <p className="mb-0"><strong>Final Fare:</strong> <span className="text-success fw-bold fs-5">₹{fare}</span></p>
              </div>

              <form onSubmit={handlePayNow}>
                <h5 className="fw-bold mb-3">Choose Payment Method</h5>

                {/* RideGo Wallet 1-Click Pay */}
                <div className="form-check p-3 mb-3 border rounded bg-white" style={{ borderColor: paymentMethod === 'wallet' ? '#ffc107' : '#eee' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="wallet"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-bold d-flex justify-content-between align-items-center w-100" htmlFor="wallet">
                    <span>
                      💰 RideGo Wallet <span className="badge bg-warning text-dark ms-1">Instant</span>
                    </span>
                    <span className={wallet?.balance >= fare ? 'text-success fw-bold' : 'text-danger'}>
                      Balance: ₹{wallet?.balance ?? 0}
                    </span>
                  </label>
                  {wallet?.balance < fare && (
                    <div className="mt-2 text-end">
                      <button
                        type="button"
                        onClick={() => wallet.addFunds(200)}
                        className="btn btn-sm btn-outline-warning"
                      >
                        + Top-up ₹200
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="upi"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="upi">
                    UPI Payment (GPay, PhonePe, Paytm)
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="card">
                    Credit / Debit Card
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="cash"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="cash">
                    Cash Payment (Pay to driver directly)
                  </label>
                </div>

                {paymentMethod !== 'cash' && paymentMethod !== 'wallet' ? (
                  <input
                    type="text"
                    className="form-control mb-4"
                    placeholder={paymentMethod === 'upi' ? 'Enter UPI ID (e.g. user@okhdfcbank)' : 'Enter 16-digit Card Number'}
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                    required
                  />
                ) : paymentMethod === 'wallet' ? (
                  <p className="text-muted small mb-4">
                    <i className="bi bi-shield-check text-success me-1"></i> Amount will be deducted from your secure RideGo Wallet instantly.
                  </p>
                ) : (
                  <p className="text-muted small mb-4">
                    <i className="bi bi-info-circle me-1"></i> You can pay cash directly to the driver upon ride completion.
                  </p>
                )}

                <button type="submit" className="btn btn-warning w-100" disabled={loading}>
                  {loading ? 'Processing...' : paymentMethod === 'wallet' ? `Pay with Wallet (₹${fare})` : paymentMethod === 'cash' ? 'Confirm & Book Ride' : 'Pay Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
