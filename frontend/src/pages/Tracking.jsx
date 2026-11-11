import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useWallet } from '../context/useWallet';
import LiveRideMap from '../components/LiveRideMap';
import { soundEffects, triggerConfetti } from '../utils/audioCues';

export default function Tracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useWallet();

  const savedRide = JSON.parse(localStorage.getItem('activeRide') || '{}');
  const [ride] = useState(location.state || savedRide);

  const pickup = ride.pickup || ride.startLocation || 'Chennai Central';
  const drop = ride.drop || ride.endLocation || 'Guindy Tech Park';
  const otp = ride.otp || '4829';

  const captain = ride.captain || {};
  const driverName = captain.name || 'Arun';
  const driverPhone = captain.phone || '9840112233';
  const driverVehicle = captain.vehicleDetails
    ? `${captain.vehicleDetails.vehicleNumber} (${captain.vehicleDetails.vehicleModel || captain.vehicleDetails.type || 'Ride'})`
    : 'TN 23 AB 1234 (Honda Activa 6G)';

  // Interactive States
  const [rideStatus, setRideStatus] = useState(ride.status || 'on the way');
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: `Hi! I'm on my way in ${driverVehicle}. See you soon!` }
  ]);

  const [showCallModal, setShowCallModal] = useState(false);

  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Driver Mode Simulator
  const [showDriverSimulator, setShowDriverSimulator] = useState(false);
  const [driverOtpInput, setDriverOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(ride.isOtpVerified || false);

  // Post Ride Rating & Tipping Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [stars, setStars] = useState(5);
  const [selectedCompliments, setSelectedCompliments] = useState(['Safe Driving', 'Polite Driver']);
  const [tipAmount, setTipAmount] = useState(0);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  useEffect(() => {
    soundEffects.playDriverArrivedChime();
  }, []);

  const handleSendChat = (messageText) => {
    const text = messageText || chatInput;
    if (!text.trim()) return;

    const newMsg = { sender: 'rider', text: text.trim() };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    if (ride._id && !ride._id.startsWith('ride_')) {
      api.sendChatMessage(ride._id, text.trim(), 'rider');
    }

    // Driver auto-reply simulation
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'driver', text: 'Received! Traffic is moving smoothly, arriving shortly 👍' }
      ]);
    }, 1800);
  };

  const handleVerifyOtp = async () => {
    if (driverOtpInput.trim() !== otp) {
      alert('Invalid OTP entered by driver. Please match the rider screen OTP.');
      return;
    }

    setOtpVerified(true);
    setRideStatus('started');
    soundEffects.playSuccessChime();

    if (ride._id && !ride._id.startsWith('ride_')) {
      await api.verifyRideOtp(ride._id, driverOtpInput.trim());
    }

    alert('✅ OTP Verified by Driver! Trip has officially started.');
    setShowDriverSimulator(false);
  };

  const handleTriggerSos = async () => {
    soundEffects.playSosAlertSound();
    setSosSent(true);

    if (ride._id && !ride._id.startsWith('ride_')) {
      await api.triggerSos(ride._id);
    }
  };

  const handleShareTrip = () => {
    const shareUrl = window.location.href;
    navigator.clipboard?.writeText?.(shareUrl);
    alert('🔗 Live Trip Tracking link copied to clipboard! Share it with friends or family.');
  };

  const handleCompleteRide = () => {
    setShowRatingModal(true);
  };

  const submitFeedbackAndFinish = async () => {
    soundEffects.playSuccessChime();
    triggerConfetti();

    if (tipAmount > 0 && wallet) {
      wallet.deductFunds(tipAmount, `Tip to Driver ${driverName}`);
    }
    wallet?.addRewardCoins(20);

    try {
      if (ride._id && !ride._id.startsWith('ride_')) {
        await api.submitFeedback(ride._id, {
          rating: stars,
          compliments: selectedCompliments,
          tip: tipAmount
        });
        await api.updateRideStatus(ride._id, { status: 'completed' });
      }
    } catch (err) {
      console.warn('API error during feedback:', err);
    }

    alert(`🎉 Ride Completed! Rated ${stars}⭐. 20 RideGo Coins credited to your wallet.`);
    localStorage.removeItem('activeRide');
    navigate('/dashboard');
  };

  return (
    <div className="gradient-bg py-5">
      <div className="container py-4">
        {/* Top Header & Interactive Tools */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h1 className="fw-bold mb-0">📍 Live Ride Tracking</h1>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={handleShareTrip}
              className="btn btn-outline-dark"
              title="Share Live Trip with Family"
            >
              <i className="bi bi-share-fill me-1"></i> Share Trip
            </button>
            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="btn btn-danger fw-bold"
              style={{ borderRadius: '50px', padding: '8px 20px' }}
            >
              <i className="bi bi-shield-exclamation me-1"></i> SOS
            </button>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-box p-4">
              {/* Ride Status Banner */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Ride Status</h4>
                <span className={`badge ${rideStatus === 'started' ? 'bg-primary' : 'bg-warning text-dark'} fs-6`}>
                  {rideStatus === 'started' ? '🏁 Trip In Progress' : '🚕 Driver On The Way'}
                </span>
              </div>

              {/* Start PIN / OTP Banner */}
              <div className="alert alert-warning d-flex justify-content-between align-items-center p-3 mb-3 border">
                <div>
                  <span className="small text-muted d-block fw-semibold">START PIN / OTP</span>
                  <span className="text-dark fw-bold fs-4 letter-spacing-2">
                    {otp.split('').map((digit, i) => (
                      <span key={i} className="badge bg-dark text-warning me-1 px-2 py-1">
                        {digit}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="text-end">
                  <span className="small text-muted d-block">
                    {otpVerified ? '🟢 OTP Verified' : 'Share OTP when boarding'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDriverSimulator(!showDriverSimulator)}
                    className="btn btn-sm btn-outline-dark mt-1"
                  >
                    <i className="bi bi-person-badge me-1"></i> Driver Test Mode
                  </button>
                </div>
              </div>

              {/* Driver Simulator Drawer */}
              {showDriverSimulator && (
                <div className="p-3 mb-3 bg-light rounded border border-warning">
                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-phone me-1"></i> Driver Verification Simulator
                  </h6>
                  <p className="small text-muted mb-2">
                    Test driver-side verification: enter the 4-digit OTP shown to the rider above to start the trip.
                  </p>
                  <div className="input-group" style={{ maxWidth: '300px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Rider OTP"
                      maxLength={4}
                      value={driverOtpInput}
                      onChange={(e) => setDriverOtpInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="btn btn-warning"
                    >
                      Start Trip
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Interactive Leaflet Map */}
              <div className="my-2">
                <LiveRideMap
                  pickupName={pickup}
                  dropName={drop}
                  vehicleType={ride.vehicleType || 'Bike'}
                  height="340px"
                />
              </div>

              {/* Driver Details & Interactive Actions */}
              <div className="mt-4 p-3 bg-light rounded border d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="icon-circle bg-warning text-dark fw-bold"
                    style={{ width: '56px', height: '56px', fontSize: '24px' }}
                  >
                    👤
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">{driverName} <span className="badge bg-success small">4.9 ⭐</span></h5>
                    <p className="mb-0 text-muted small"><strong>Vehicle :</strong> {driverVehicle}</p>
                    <p className="mb-0 text-muted small"><strong>Estimated Arrival :</strong> 4 mins (Live)</p>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChat(!showChat)}
                    className="btn btn-outline-dark"
                  >
                    <i className="bi bi-chat-dots-fill me-1"></i> Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCallModal(true);
                    }}
                    className="btn btn-success"
                  >
                    <i className="bi bi-telephone-fill me-1"></i> Call
                  </button>
                </div>
              </div>

              {/* In-App Live Quick Chat Drawer */}
              {showChat && (
                <div className="mt-3 p-3 bg-white rounded border shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">💬 Chat with {driverName}</h6>
                    <button
                      type="button"
                      className="btn-close btn-close-sm"
                      onClick={() => setShowChat(false)}
                    ></button>
                  </div>

                  <div className="p-2 mb-2 bg-light rounded" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`d-flex mb-2 ${msg.sender === 'rider' ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div
                          className={`p-2 rounded small ${
                            msg.sender === 'rider' ? 'bg-warning text-dark' : 'bg-white border text-dark'
                          }`}
                          style={{ maxWidth: '80%' }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Canned Quick Response Chips */}
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    {[
                      "I'm at the gate",
                      "Coming in 2 mins",
                      "Please wait near entrance",
                      "I'm wearing a black jacket"
                    ].map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendChat(pill)}
                        className="badge bg-light text-dark border text-decoration-none"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Type a message to driver..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendChat()}
                      className="btn btn-sm btn-warning"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Complete Ride Trigger */}
              <button
                type="button"
                onClick={handleCompleteRide}
                className="btn btn-warning w-100 mt-4 py-3 fw-bold fs-5"
              >
                🏁 Complete Ride & Review
              </button>
            </div>
          </div>
        </div>

        {/* Emergency SOS Modal */}
        {showSosModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-danger">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-shield-fill-exclamation me-2"></i> RideGo Safety & Emergency
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowSosModal(false)}></button>
                </div>
                <div className="modal-body text-center p-4">
                  <div className="display-4 text-danger mb-3">🚨</div>
                  <h4>Need Urgent Assistance?</h4>
                  <p className="text-muted small">
                    Your real-time GPS location and driver details will be instantly dispatched to emergency response teams.
                  </p>

                  {sosSent ? (
                    <div className="alert alert-success">
                      <strong>✅ SOS Alert Broadcasted!</strong> RideGo Safety Operations and Local authorities have been notified of your active trip.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTriggerSos}
                      className="btn btn-danger btn-lg w-100 mb-3 fw-bold"
                    >
                      Broadcast SOS to Safety Command
                    </button>
                  )}

                  <div className="d-flex gap-2">
                    <a href="tel:112" className="btn btn-outline-dark flex-grow-1">
                      <i className="bi bi-telephone-outbound me-1"></i> Call Police (112)
                    </a>
                    <a href="tel:108" className="btn btn-outline-dark flex-grow-1">
                      <i className="bi bi-hospital me-1"></i> Ambulance (108)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Driver Simulation Modal */}
        {showCallModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content text-center p-4">
                <div className="icon-circle bg-warning text-dark mx-auto mb-3" style={{ width: '70px', height: '70px', fontSize: '32px' }}>
                  👤
                </div>
                <h5 className="fw-bold mb-1">Calling {driverName}...</h5>
                <p className="text-muted small mb-3">{driverPhone} (Encrypted Masked)</p>
                <div className="spinner-grow text-success mb-3" role="status"></div>
                <p className="small text-success fw-bold">Connected • 00:12</p>
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="btn btn-danger rounded-circle mx-auto p-3"
                  style={{ width: '56px', height: '56px' }}
                >
                  <i className="bi bi-telephone-x-fill fs-5"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post-Ride Gamified Rating & Tip Modal */}
        {showRatingModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content p-4">
                <div className="text-center mb-3">
                  <div className="display-4">🎉</div>
                  <h4 className="fw-bold mt-2">You Have Arrived!</h4>
                  <p className="text-muted small">How was your journey with <strong>{driverName}</strong>?</p>

                  {/* 5-Star Selector */}
                  <div className="d-flex justify-content-center gap-2 fs-2 my-2 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setStars(star)}
                        className={star <= stars ? 'text-warning' : 'text-muted'}
                        style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Driver Compliments */}
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-2 d-block">Add a Compliment:</label>
                  <div className="d-flex flex-wrap gap-2">
                    {['Safe Driving', 'Polite Driver', 'Clean Vehicle', 'Great Route', 'Fast & On-Time'].map((tag) => {
                      const isSelected = selectedCompliments.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCompliments(selectedCompliments.filter((t) => t !== tag));
                            } else {
                              setSelectedCompliments([...selectedCompliments, tag]);
                            }
                          }}
                          className={`badge border ${isSelected ? 'bg-warning text-dark' : 'bg-light text-dark'}`}
                          style={{ cursor: 'pointer', padding: '8px 12px' }}
                        >
                          {isSelected ? '✓ ' : '+ '} {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tip Selector */}
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-2 d-block">Tip Your Driver (Optional):</label>
                  <div className="d-flex gap-2">
                    {[0, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTipAmount(amt)}
                        className={`btn btn-sm flex-grow-1 ${tipAmount === amt ? 'btn-warning' : 'btn-outline-dark'}`}
                      >
                        {amt === 0 ? 'No Tip' : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scratch & Win Reward Card */}
                <div className="p-3 mb-3 bg-light rounded border text-center">
                  <span className="badge bg-warning text-dark mb-1">🎁 Scratch & Win Bonus</span>
                  <div
                    onClick={() => {
                      setScratchRevealed(true);
                      triggerConfetti();
                      soundEffects.playSuccessChime();
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      background: scratchRevealed ? '#fff3cd' : '#6c757d',
                      color: scratchRevealed ? '#856404' : '#fff',
                      borderRadius: '8px',
                      fontWeight: '700'
                    }}
                  >
                    {scratchRevealed ? '🪙 +20 RideGo Coins Won!' : '👉 Click to Scratch & Reveal Coins'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={submitFeedbackAndFinish}
                  className="btn btn-warning w-100 py-2 fw-bold"
                >
                  Submit & View Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
