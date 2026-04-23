package com.publicesafity.controller;

import com.publicesafity.config.AuthInterceptor;
import com.publicesafity.dto.AlertRequest;
import com.publicesafity.dto.AlertResponse;
import com.publicesafity.entity.Alert;
import com.publicesafity.entity.PoliceOfficer;
import com.publicesafity.repository.AlertRepo;
import com.publicesafity.util.GeoUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepo alertRepo;

    public AlertController(AlertRepo alertRepo) {
        this.alertRepo = alertRepo;
    }

    @PostMapping
    public ResponseEntity<AlertResponse> createAlert(@Valid @RequestBody AlertRequest request, HttpServletRequest servletRequest) {
        PoliceOfficer officer = (PoliceOfficer) servletRequest.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        Alert alert = new Alert();
        applyRequest(alert, request, officer);
        alertRepo.save(alert);
        return ResponseEntity.status(HttpStatus.CREATED).body(AlertResponse.from(alert, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAlert(@PathVariable Long id,
                                         @Valid @RequestBody AlertRequest request,
                                         HttpServletRequest servletRequest) {
        PoliceOfficer officer = (PoliceOfficer) servletRequest.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        Optional<Alert> optionalAlert = alertRepo.findByIdAndCreatedByOfficerId(id, officer.getId());
        if (optionalAlert.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Alert not found"));
        }

        Alert alert = optionalAlert.get();
        applyRequest(alert, request, officer);
        alertRepo.save(alert);
        return ResponseEntity.ok(AlertResponse.from(alert, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateAlert(@PathVariable Long id, HttpServletRequest servletRequest) {
        PoliceOfficer officer = (PoliceOfficer) servletRequest.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        Optional<Alert> optionalAlert = alertRepo.findByIdAndCreatedByOfficerId(id, officer.getId());
        if (optionalAlert.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Alert not found"));
        }

        Alert alert = optionalAlert.get();
        alert.setStatus("INACTIVE");
        alertRepo.save(alert);
        return ResponseEntity.ok(Map.of("message", "Alert deactivated"));
    }

    @GetMapping("/police")
    public ResponseEntity<List<AlertResponse>> getOfficerAlerts(HttpServletRequest servletRequest) {
        PoliceOfficer officer = (PoliceOfficer) servletRequest.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        List<AlertResponse> responses = alertRepo.findByCreatedByOfficerIdOrderByCreatedAtDesc(officer.getId())
                .stream()
                .map(alert -> AlertResponse.from(alert, null))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/public")
    public ResponseEntity<List<AlertResponse>> getPublicAlerts(@RequestParam(required = false) Double lat,
                                                               @RequestParam(required = false) Double lng) {
        if (lat == null || lng == null) {
            return ResponseEntity.ok(List.of());
        }

        List<AlertResponse> responses = alertRepo.findByStatusOrderByCreatedAtDesc("ACTIVE")
                .stream()
                .map(alert -> {
                    double distanceKm = GeoUtils.distanceKm(lat, lng, alert.getLatitude(), alert.getLongitude());
                    if (distanceKm <= alert.getRadiusKm()) {
                        return AlertResponse.from(alert, distanceKm);
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparing(AlertResponse::getCreatedAt).reversed())
                .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicAlertById(@PathVariable Long id,
                                                @RequestParam(required = false) Double lat,
                                                @RequestParam(required = false) Double lng) {
        Optional<Alert> optionalAlert = alertRepo.findById(id);
        if (optionalAlert.isEmpty() || !"ACTIVE".equalsIgnoreCase(optionalAlert.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Alert not found"));
        }
        Alert alert = optionalAlert.get();
        if (lat == null || lng == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Location permission is required"));
        }
        double distanceKm = GeoUtils.distanceKm(lat, lng, alert.getLatitude(), alert.getLongitude());
        if (distanceKm > alert.getRadiusKm()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You are outside the alert notification range"));
        }
        return ResponseEntity.ok(AlertResponse.from(alert, distanceKm));
    }

    private void applyRequest(Alert alert, AlertRequest request, PoliceOfficer officer) {
        alert.setType(request.getType().trim());
        alert.setTitle(request.getTitle().trim());
        alert.setDescription(request.getDescription().trim());
        alert.setLocationName(request.getLocationName().trim());
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setRadiusKm(request.getRadiusKm());
        alert.setPolicePhone(request.getPolicePhone().trim());
        alert.setImageFileName(request.getImageFileName() == null ? null : request.getImageFileName().trim());
        alert.setOfficerName(officer.getName());
        alert.setOfficerBadgeNumber(officer.getBadgeNumber());
        alert.setCreatedByOfficerId(officer.getId());
        if (alert.getStatus() == null || alert.getStatus().isBlank()) {
            alert.setStatus("ACTIVE");
        }
    }
}
