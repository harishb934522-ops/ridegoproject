const API_BASE = '/api';

const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async register(name, email, password, phone) {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getUserProfile(token) {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  // Rides
  async bookRide(rideData, token) {
    const res = await fetch(`${API_BASE}/rides/book`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(rideData),
    });
    return res.json();
  },

  async getRideDetails(id) {
    const res = await fetch(`${API_BASE}/rides/${id}`);
    return res.json();
  },

  async updateRideStatus(id, updateData) {
    const res = await fetch(`${API_BASE}/rides/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async verifyRideOtp(id, otp) {
    const res = await fetch(`${API_BASE}/rides/${id}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
    return res.json();
  },

  async triggerSos(id) {
    const res = await fetch(`${API_BASE}/rides/${id}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async submitFeedback(id, feedbackData) {
    const res = await fetch(`${API_BASE}/rides/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    return res.json();
  },

  async sendChatMessage(id, text, sender = 'rider') {
    const res = await fetch(`${API_BASE}/rides/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender }),
    });
    return res.json();
  },

  async cancelRide(id, token) {
    const res = await fetch(`${API_BASE}/rides/cancel/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.json();
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },

  async validateCoupon(code, fare) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, fare }),
    });
    return res.json();
  },

  // Admin Controls
  async getAdminCounts() {
    const res = await fetch(`${API_BASE}/admins/counts`);
    return res.json();
  },

  async getAdminDrivers() {
    const res = await fetch(`${API_BASE}/admins/drivers`);
    return res.json();
  },

  async updateDriverStatus(id, status) {
    const res = await fetch(`${API_BASE}/admins/drivers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async addDriver(driverData) {
    const res = await fetch(`${API_BASE}/admins/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData),
    });
    return res.json();
  },

  async getAdminBookings() {
    const res = await fetch(`${API_BASE}/admins/bookings`);
    return res.json();
  },

  async resolveSos(id) {
    const res = await fetch(`${API_BASE}/admins/rides/${id}/resolve-sos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async getFeedbackFeed() {
    const res = await fetch(`${API_BASE}/admins/feedback`);
    return res.json();
  },

  async createCoupon(couponData) {
    const res = await fetch(`${API_BASE}/coupons/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    return res.json();
  },

  async toggleCoupon(id) {
    const res = await fetch(`${API_BASE}/coupons/admin/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async deleteCoupon(id) {
    const res = await fetch(`${API_BASE}/coupons/admin/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
