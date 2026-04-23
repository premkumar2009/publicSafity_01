package com.publicesafity.controller;

import com.publicesafity.config.AuthInterceptor;
import com.publicesafity.dto.AlertProofResponse;
import com.publicesafity.dto.AlertProofStatusRequest;
import com.publicesafity.entity.PoliceOfficer;
import com.publicesafity.service.AlertProofService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/alerts")
public class AlertProofController {

    private final AlertProofService alertProofService;

    public AlertProofController(AlertProofService alertProofService) {
        this.alertProofService = alertProofService;
    }

    @GetMapping("/{alertId}/proofs")
    public ResponseEntity<?> getProofsForAlert(@PathVariable Long alertId, HttpServletRequest request) {
        PoliceOfficer officer = (PoliceOfficer) request.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        try {
            List<AlertProofResponse> proofs = alertProofService.getProofsForOfficer(alertId, officer.getId());
            return ResponseEntity.ok(proofs);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{alertId}/proofs/{proofId}")
    public ResponseEntity<?> updateProofStatus(@PathVariable Long alertId,
                                               @PathVariable Long proofId,
                                               @RequestBody AlertProofStatusRequest request,
                                               HttpServletRequest servletRequest) {
        PoliceOfficer officer = (PoliceOfficer) servletRequest.getAttribute(AuthInterceptor.AUTHENTICATED_OFFICER);
        try {
            AlertProofResponse response = alertProofService.updateProofStatus(alertId, proofId, officer.getId(), request.getStatus());
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}