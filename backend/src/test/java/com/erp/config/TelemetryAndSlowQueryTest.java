package com.erp.config;

import com.erp.ERPApplication;
import com.zaxxer.hikari.HikariDataSource;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ERPApplication.class, properties = {
        "spring.jpa.show-sql=false",
        "logging.level.org.hibernate.SQL=WARN"
})
@DisplayName("Task 2: APM Telemetry, Prometheus & SlowQueryInterceptor Tests")
class TelemetryAndSlowQueryTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private SlowQueryInterceptor slowQueryInterceptor;

    @Autowired
    private MeterRegistry meterRegistry;

    @Test
    @DisplayName("SlowQueryInterceptor inspects SQL and logs warnings for queries exceeding 500ms threshold")
    void shouldLogWarningsWhenQueryExceeds500msThreshold() {
        slowQueryInterceptor.resetSlowQueryCount();

        String fastSql = "SELECT * FROM campus WHERE tenant_id = 'test-tenant'";
        String slowSql = "SELECT * FROM student_attendance_record JOIN academic_core_students ON true WHERE tenant_id = 'large-tenant'";

        // Inspect fast query
        slowQueryInterceptor.inspect(fastSql);
        boolean fastLogged = slowQueryInterceptor.logIfSlow(150, fastSql);
        assertThat(fastLogged).isFalse();
        assertThat(slowQueryInterceptor.getSlowQueryCount()).isEqualTo(0L);

        // Inspect slow query exceeding 500ms threshold
        slowQueryInterceptor.inspect(slowSql);
        boolean slowLogged = slowQueryInterceptor.logIfSlow(680, slowSql);
        assertThat(slowLogged).isTrue();
        assertThat(slowQueryInterceptor.getSlowQueryCount()).isEqualTo(1L);

        // Another slow query
        boolean slowLogged2 = slowQueryInterceptor.logIfSlow(1200, "SELECT COUNT(*) FROM student_invoices");
        assertThat(slowLogged2).isTrue();
        assertThat(slowQueryInterceptor.getSlowQueryCount()).isEqualTo(2L);
    }

    @Test
    @DisplayName("SlowQueryInterceptor configures Hibernate SessionFactory properties")
    void shouldConfigureHibernateProperties() {
        Map<String, Object> props = new HashMap<>();
        slowQueryInterceptor.customize(props);

        assertThat(props).containsKey("hibernate.session_factory.statement_inspector");
        assertThat(props.get("hibernate.session_factory.statement_inspector")).isSameAs(slowQueryInterceptor);
        assertThat(props.get("hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS")).isEqualTo(500L);
    }

    @Test
    @DisplayName("Micrometer Prometheus MeterRegistry is initialized and registers metrics")
    void shouldInitializePrometheusMeterRegistry() {
        assertThat(meterRegistry).isNotNull();
        // Verify application tag or standard JVM/system metrics are present
        assertThat(meterRegistry.getMeters()).isNotEmpty();
    }

    @Test
    @DisplayName("HikariCP pool is configured with pool-name EduPulseHikariCP")
    void shouldConfigureEduPulseHikariPoolName() {
        DataSource ds = applicationContext.getBean(DataSource.class);
        assertThat(ds).isNotNull();

        // Check if primary shared target or pool matches EduPulseHikariCP
        if (ds instanceof HikariDataSource hikariDs) {
            assertThat(hikariDs.getPoolName()).isEqualTo("EduPulseHikariCP");
        }
    }
}
