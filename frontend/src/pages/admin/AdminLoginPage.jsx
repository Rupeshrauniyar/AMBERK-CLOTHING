import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { fetchApi } from '../../services/api';
import { toast } from 'sonner';
import { Lock, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@amberk.com');
  const [password, setPassword] = useState('AmberkAdmin@2026');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetchApi('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(res.user);
      toast.success('Admin authentication authorized.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#24231F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#F8F7F3] p-8 sm:p-10 shadow-2xl border border-[#383632] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#EAD9BA] text-[#6F4C24] rounded-full mb-2">
            <Lock size={22} />
          </div>
          <span className="font-serif text-2xl uppercase tracking-widest font-bold text-[#24231F] block">
            AMBERK CONTROL
          </span>
          <h1 className="text-xs uppercase tracking-[0.2em] font-bold text-[#77746D]">
            Store Administration Portal
          </h1>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#77746D] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E1D8] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C58A38]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#77746D] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E5E1D8] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C58A38]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24231F] hover:bg-[#C58A38] text-white py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Access Administration'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E5E1D8] text-[11px] text-[#77746D]">
          <p>Protected area. All administrative interactions are logged.</p>
        </div>
      </div>
    </div>
  );
}

