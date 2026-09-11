import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function CmsPageViewer() {
  const { slug: routeSlug } = useParams();
  const location = useLocation();
  const slug = routeSlug || location.pathname.replace('/', '');

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/cms/${slug}`)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">Loading page...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{page?.title || slug.toUpperCase().replace('-', ' ')}</h1>
        <div
          className="prose max-w-none text-xs text-slate-600 font-medium leading-relaxed space-y-3"
          dangerouslySetInnerHTML={{ __html: page?.content || '<p>Official policy content for Mobile Accessories Store.</p>' }}
        />
      </div>
    </div>
  );
}
