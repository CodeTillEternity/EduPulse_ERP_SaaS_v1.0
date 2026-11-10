package com.erp.config;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Hibernate StatementInspector that monitors SQL queries and automatically logs
 * warnings for any statement execution exceeding the 500ms threshold.
 */
@Component
public class SlowQueryInterceptor implements StatementInspector, HibernatePropertiesCustomizer {

    private static final Logger log = LoggerFactory.getLogger(SlowQueryInterceptor.class);

    public static final long SLOW_QUERY_THRESHOLD_MS = 500;

    private static final ThreadLocal<Long> QUERY_START_TIME = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_QUERY_SQL = new ThreadLocal<>();

    private final AtomicLong slowQueryCount = new AtomicLong(0);

    @Override
    public String inspect(String sql) {
        if (sql != null && !sql.isBlank()) {
            QUERY_START_TIME.set(System.currentTimeMillis());
            CURRENT_QUERY_SQL.set(sql);
            log.trace("Inspecting SQL query for telemetry: {}", sql);
        }
        return sql;
    }

    /**
     * Inspects query execution duration and pushes warnings directly to application logs
     * if duration exceeds 500ms.
     *
     * @param durationMs Execution duration in milliseconds
     * @param sql        Executed SQL string
     * @return true if slow query warning was logged
     */
    public boolean logIfSlow(long durationMs, String sql) {
        if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
            slowQueryCount.incrementAndGet();
            log.warn("SLOW SQL DETECTED (APM ALERT): Execution took {} ms (threshold: {} ms) for query: [{}]",
                    durationMs, SLOW_QUERY_THRESHOLD_MS, sql);
            return true;
        }
        return false;
    }

    /**
     * Completes and evaluates the current thread's active query execution timing.
     *
     * @return true if query was considered slow
     */
    public boolean completeCurrentQuery() {
        Long start = QUERY_START_TIME.get();
        String sql = CURRENT_QUERY_SQL.get();
        QUERY_START_TIME.remove();
        CURRENT_QUERY_SQL.remove();

        if (start != null && sql != null) {
            long duration = System.currentTimeMillis() - start;
            return logIfSlow(duration, sql);
        }
        return false;
    }

    public long getSlowQueryCount() {
        return slowQueryCount.get();
    }

    public void resetSlowQueryCount() {
        slowQueryCount.set(0);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.STATEMENT_INSPECTOR, this);
        hibernateProperties.put("hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS", SLOW_QUERY_THRESHOLD_MS);
        log.info("Configured SlowQueryInterceptor on Hibernate SessionFactory with 500ms threshold");
    }
}
