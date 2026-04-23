package com.publicesafity.controller;

import com.publicesafity.config.AuthInterceptor;
import com.publicesafity.dto.AuthRequest;
import com.publicesafity.dto.AuthResponse;
import com.publicesafity.dto.SignupRequest;
import com.publicesafity.entity.PoliceOfficer;
import com.publicesafity.repository.PoliceRepo;
import com.publicesafity.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PoliceRepo policeRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Value("${app.police.access-code}")
    private String policeAccessCode;

    public AuthController(PoliceRepo policeRepo,
                          BCryptPasswordEncoder passwordEncoder,
                          TokenService tokenService) {
        this.policeRepo = policeRepo;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (!policeAccessCode.equals(request.getAccessCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid police access code"));
        }
        if (policeRepo.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Officer email already exists"));
        }

        PoliceOfficer officer = new PoliceOfficer();
        officer.setName(request.getName().trim());
        officer.setEmail(request.getEmail().trim().toLowerCase());
        officer.setPhone(request.getPhone().trim());
        officer.setBadgeNumber(request.getBadgeNumber().trim());
        officer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        policeRepo.save(officer);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Police officer account created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        PoliceOfficer officer = policeRepo.findByEmailIgnoreCase(request.getEmail()).orElse(null);
        if (officer == null || !passwordEncoder.matches(request.getPassword(), officer.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        String token = tokenService.generateToken(officer.getId(), officer.getEmail());
        return ResponseEntity.ok(new AuthResponse(token,
                new AuthResponse.OfficerSummary(
                        officer.getId(),
                        officer.getName(),
                        officer.getEmail(),
                        officer.getPhone(),
                        officer.getBadgeNumber())));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        PoliceOfficer officer = (PoliceOfficer) request.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        if (officer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(new AuthResponse.OfficerSummary(
                officer.getId(),
                officer.getName(),
                officer.getEmail(),
                officer.getPhone(),
                officer.getBadgeNumber()));
    }
}
