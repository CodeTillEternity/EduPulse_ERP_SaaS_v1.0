import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Server,
  FileCode2,
  Cpu
} from 'lucide-react';

type ArchitectureLayer = 'jwt' | 'threadlocal' | 'rls' | 'datasource';

export const ArchitectureExplorer: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<ArchitectureLayer>('rls');

  const layers = [
    {
      id: 'jwt' as ArchitectureLayer,
      name: '1. Identity Resolution',
      short: 'TenantFilter (JWT Claims)',
      icon: Key,
      summary: 'Extracts and verifies the tenant_id claim directly from cryptographically signed JWT tokens, rejecting unauthenticated tenant spoofing.',
      code: `// From com.erp.multitenancy.TenantFilter.java
String tenantId = jwtService.extractTenantId(jwt);
if (tenantId != null && !tenantId.isBlank()) {
    TenantContext.setTenantId(tenantId.trim());
    // Enforce Tenant Suspension Block
    if (tenantRegistry.getAccountStatus() == AccountStatus.SUSPENDED) {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
    }
}`,
      details: [
        'Tenant context is bound strictly from validated token claims, not mutable URL parameters',
        'Unauthorized attempts on tenant endpoints without a tenant_id claim return HTTP 401',
        'Suspended tenants are intercepted before hitting business services'
      ]
    },
    {
      id: 'threadlocal' as ArchitectureLayer,
      name: '2. Thread Confinement',
      short: 'TenantContextFilter (ThreadLocal)',
      icon: Cpu,
      summary: 'Ensures the execution thread has its TenantContext purged in a guaranteed finally block, eliminating worker thread state leakage in HikariCP connection pools.',
      code: `// From com.erp.multitenancy.TenantContextFilter.java
public class TenantContextFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) 
            throws ServletException, IOException {
        try {
            // Context bound for current request thread
            chain.doFilter(req, res);
        } finally {
            // Guaranteed cleanup prevents state bleeding across pooled threads
            TenantContext.clear();
        }
    }
}`,
      details: [
        'Guaranteed cleanup in finally block prevents thread reuse contamination',
        'Ordered at highest web filter precedence',
        'Conforms to standard enterprise Java thread-confinement design patterns'
      ]
    },
    {
      id: 'rls' as ArchitectureLayer,
      name: '3. PostgreSQL RLS',
      short: 'Row-Level Security Policies',
      icon: Database,
      summary: 'Data isolation is enforced at the PostgreSQL database engine layer. Queries are automatically restricted by tenant_id, even on raw SELECT * queries.',
      code: `-- From db/migration/V15__enable_postgres_rls_tenant_tables.sql
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student;

CREATE POLICY tenant_isolation_policy ON student
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));`,
      details: [
        'Enforced on all institutional tables (students, admissions, finances, attendance, exams)',
        'Database engine evaluates tenant_id against session variable app.current_tenant',
        'Eliminates human error from manual WHERE tenant_id = ... query construction'
      ]
    },
    {
      id: 'datasource' as ArchitectureLayer,
      name: '4. Dynamic Routing',
      short: 'TenantRoutingDataSource',
      icon: Server,
      summary: 'Enterprise institutions can route to dedicated PostgreSQL database pools at runtime while standard tiers share the high-throughput multi-tenant pool.',
      code: `// From com.erp.multitenancy.datasource.TenantRoutingDataSource.java
public class TenantRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || "default".equalsIgnoreCase(tenantId)) {
            return SHARED_LOOKUP_KEY;
        }
        // Resolves from Redis-cached TenantRegistry
        return routingKeyResolver.resolveRoutingKey(tenantId);
    }
}`,
      details: [
        'AbstractRoutingDataSource switches HikariCP pools dynamically per transaction',
        'Standard tiers default to the SHARED pool with Row-Level Security',
        'Enterprise institutions route to isolated dedicated-vip pools with zero code modifications'
      ]
    }
  ];

  const current = layers.find(l => l.id === activeLayer) || layers[2];

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans">
      
      {/* Top Header */}
      <div className="p-6 border-b border-zinc-200 bg-zinc-50/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verifiable Architecture
            </div>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              Multi-Tenant Data Isolation & Security Architecture
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
              Inspect how EduPulse isolates institutional data across the application, thread, and database engine layers. Every layer is backed by verifiable code in the backend.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-500 bg-white px-3 py-1.5 rounded-lg border border-zinc-200">
            Source: com.erp.multitenancy
          </div>
        </div>

        {/* Layer Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-6">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600/10'
                    : 'bg-zinc-100/70 hover:bg-white border-zinc-200/80 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                    {layer.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{layer.short}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Summary & Implementation Details */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">{current.name}</h4>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              {current.summary}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Key Architectural Safeguards</span>
            <ul className="space-y-2 text-xs text-zinc-600">
              {current.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Exact Code Snippet from Repository */}
        <div className="lg:col-span-7 bg-zinc-900 text-zinc-100 rounded-xl p-4 overflow-hidden shadow-inner text-xs font-mono">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Implementation Blueprint</span>
            </div>
            <span className="text-[10px] text-zinc-400">Production Code</span>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
            <code>{current.code}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};

export default ArchitectureExplorer;
