package com.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.erp", "com.edupulse"})
@EntityScan(basePackages = {"com.erp", "com.edupulse"})
@EnableJpaRepositories(basePackages = {"com.erp", "com.edupulse"})
public class ERPApplication {

    public static void main(String[] args) {
        SpringApplication.run(ERPApplication.class, args);
    }
}
