package com.publicesafity.service;

import com.publicesafity.entity.PoliceOfficer;
import com.publicesafity.repository.PoliceRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class BootstrapDataService {

    private final PoliceRepo policeRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${BOOTSTRAP_POLICE_EMAIL:officer@police.local}")
    private String bootstrapEmail;

    @Value("${BOOTSTRAP_POLICE_PASSWORD:Police@123}")
    private String bootstrapPassword;

    @Value("${BOOTSTRAP_POLICE_NAME:Officer Demo}")
    private String bootstrapName;

    @Value("${BOOTSTRAP_POLICE_PHONE:1000000000}")
    private String bootstrapPhone;

    @Value("${BOOTSTRAP_POLICE_BADGE:PS-001}")
    private String bootstrapBadge;

    public BootstrapDataService(PoliceRepo policeRepo, BCryptPasswordEncoder passwordEncoder) {
        this.policeRepo = policeRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedDefaultOfficer() {
        policeRepo.findByEmailIgnoreCase(bootstrapEmail).ifPresentOrElse(existing -> {}, () -> {
            PoliceOfficer officer = new PoliceOfficer();
            officer.setName(bootstrapName);
            officer.setEmail(bootstrapEmail.toLowerCase());
            officer.setPhone(bootstrapPhone);
            officer.setBadgeNumber(bootstrapBadge);
            officer.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
            policeRepo.save(officer);
        });
    }
}
