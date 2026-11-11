import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.result === 'Success' || data.user) {
        const loggedUser = data.user || data.message;
        auth?.login(loggedUser, loggedUser.token);
        alert(`Welcome back, ${loggedUser.name || email}!`);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      // Graceful offline fallback
      console.warn('API error during login, falling back to local session:', err);
      const fallbackUser = { name: email.split('@')[0], email };
      auth?.login(fallbackUser, 'mock_token_offline');
      alert(`Logged in as ${fallbackUser.name} (Offline Mode)`);
      navigate('/dashboard');
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
              <h2 className="text-center mb-4 fw-bold">🚕 RideGo Login</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-warning w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="text-center mt-4 mb-0">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-decoration-none fw-bold text-warning">
                    Signup
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
