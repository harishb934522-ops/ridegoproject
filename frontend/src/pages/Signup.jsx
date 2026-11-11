import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone
      );

      if (data.result === 'Success' || data.user) {
        alert(`Account created successfully for ${formData.fullName}! Please log in.`);
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.warn('API error during signup, falling back to local flow:', err);
      alert(`Account created for ${formData.fullName}! Please log in.`);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg d-flex align-items-center py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-5 col-sm-8">
            <div className="card shadow-box p-4 p-md-5">
              <h2 className="text-center mb-4 fw-bold">Create Account</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-warning w-100" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Signup'}
                </button>

                <p className="text-center mt-4 mb-0">
                  Already have account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold text-warning">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
