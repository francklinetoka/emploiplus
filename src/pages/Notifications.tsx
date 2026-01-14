import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { authHeaders } from '@/lib/headers';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const markAllAndFetch = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // mark all unread notifications as read on the server
        try { await fetch('/api/notifications/mark-all-read', { method: 'POST', headers: authHeaders(undefined) }); } catch (e) { /* ignore */ }
        const res = await fetch('/api/notifications', { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setItems(data || []);
        }
        try { window.dispatchEvent(new Event('notifications-updated')); } catch (e) {}
      } catch (e) {
        console.error('Fetch notifications error', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) markAllAndFetch();
  }, [user]);

  const markRead = async (n: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (n.target) {
        // site notification
        await fetch(`/api/notifications/site/${n.id}/read`, { method: 'POST', headers: authHeaders(undefined) });
      } else {
        // personal notification
        await fetch(`/api/notifications/${n.id}/read`, { method: 'POST', headers: authHeaders(undefined) });
      }
      // refresh
      setLoading(true);
      const res = await fetch('/api/notifications', { headers: authHeaders() });
      if (res.ok) setItems(await res.json());
      // notify header to refresh unread count
      try { window.dispatchEvent(new Event('notifications-updated')); } catch (e) {}
    } catch (e) {
      console.error('Mark read error', e);
    } finally { setLoading(false); }
  };

  // When visiting notifications page, inform header to clear badge
  useEffect(() => {
    try { window.dispatchEvent(new Event('notifications-updated')); } catch (e) {}
  }, []);

  const categoryColors: Record<string,string> = {
    notifications: 'bg-blue-100 text-blue-800',
    communique: 'bg-green-100 text-green-800',
    annonce: 'bg-indigo-100 text-indigo-800',
    alerte: 'bg-red-100 text-red-800',
    autre: 'bg-gray-100 text-gray-800',
  };

  if (!user) return (
    <div className="container py-8">
      <p>Veuillez vous connecter pour voir vos notifications. <Link to="/connexion">Connexion</Link></p>
    </div>
  );

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : items.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n.id} className={`p-4 border rounded ${n.read ? 'bg-white' : 'bg-amber-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[(n.category||'notifications').toLowerCase()] || categoryColors.notifications}`}>{(n.category||'notifications')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {n.image_url && <img src={n.image_url} alt={n.title} className="h-12 w-12 object-cover rounded" />}
                  {!n.read && (
                    <button onClick={() => markRead(n)} className="px-3 py-1 text-sm border rounded">Marquer lu</button>
                  )}
                </div>
              </div>
              {n.message && <p className="mt-2 text-sm">{n.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
