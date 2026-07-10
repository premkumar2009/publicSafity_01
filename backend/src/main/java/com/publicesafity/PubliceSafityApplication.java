package com.publicesafity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class PubliceSafityApplication {

    private static final Logger log = LoggerFactory.getLogger(PubliceSafityApplication.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(PubliceSafityApplication.class, args);
        Environment env = context.getEnvironment();
        String port = env.getProperty("server.port", "8080");
        log.info("====================================\n" +
                "Public Safety Alert System Started\n" +
                "Environment : Production\n" +
                "Port        : {}\n" +
                "====================================", port);
    }
}
