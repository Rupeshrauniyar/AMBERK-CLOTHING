import { Navigate, useNavigate } from 'react-router';
import { Package, LogOut, MapPin, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { Seo, Skeleton } from '../../components/ui/Primitives';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  if (isLoading) return <div className="container-x py-20"><Skeleton className="h-60" /></div>;
  if (!isAuthenticated) return <Navigate to="/account/login" replace />;

  return (
    <div className="container-x max-w-4xl pb-10 pt-12 md:pt-20">
      <Seo title="Account" />
      <div className="eyebrow text-brand">Account</div>
      <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">Hi, {user.name?.split(' ')[0]}</h1>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-line bg-white p-7">
          <User className="h-5 w-5 text-brand" />
          <div className="mt-6 font-medium">{user.name}</div>
          <div className="text-mute">{user.email}</div>
          {user.phone && <div className="text-mute">{user.phone}</div>}
        </div>
        <button onClick={() => navigate('/orders')} className="group rounded-[28px] bg-sand p-7 text-left transition hover:bg-champagne/50">
          <Package className="h-5 w-5 text-brand" />
          <div className="mt-6 text-xl font-medium">My orders</div>
          <div className="text-mute">Track deliveries and view past purchases</div>
        </button>
        {user.addresses?.length > 0 && (
          <div className="rounded-[28px] border border-line bg-white p-7 md:col-span-2">
            <MapPin className="h-5 w-5 text-brand" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {user.addresses.map((a, i) => (
                <div key={i} className="text-sm text-mute">
                  <div className="font-medium text-ink">{a.label}{a.isDefault ? ' · Default' : ''}</div>
                  {a.address}, {a.municipality}, {a.district}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button variant="outline" className="mt-10" onClick={async () => { await logout(); navigate('/'); }}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

