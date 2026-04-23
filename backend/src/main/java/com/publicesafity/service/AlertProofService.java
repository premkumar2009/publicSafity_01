package com.publicesafity.service;

import com.publicesafity.dto.AlertProofResponse;
import com.publicesafity.dto.AlertProofSubmissionRequest;
import com.publicesafity.entity.Alert;
import com.publicesafity.entity.AlertProof;
import com.publicesafity.repository.AlertProofRepo;
import com.publicesafity.repository.AlertRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class AlertProofService {

    private static final Set<String> REVIEW_STATUSES = Set.of("PENDING", "REVIEWED", "USEFUL", "REJECTED");

    private final AlertRepo alertRepo;
    private final AlertProofRepo alertProofRepo;
    private final ImageStorageService imageStorageService;

    public AlertProofService(AlertRepo alertRepo,
                             AlertProofRepo alertProofRepo,
                             ImageStorageService imageStorageService) {
        this.alertRepo = alertRepo;
        this.alertProofRepo = alertProofRepo;
        this.imageStorageService = imageStorageService;
    }

    public AlertProofResponse submitPublicProof(Long alertId,
                                                AlertProofSubmissionRequest request,
                                                MultipartFile proofImage) throws IOException {
        Alert alert = alertRepo.findById(alertId)
                .filter(found -> "ACTIVE".equalsIgnoreCase(found.getStatus()))
                .orElseThrow(() -> new NoSuchElementException("Alert not found"));

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }

        String proofImageFileName = null;
        if (proofImage != null && !proofImage.isEmpty()) {
            proofImageFileName = imageStorageService.storeImage(proofImage).storageKey();
        }

        AlertProof proof = new AlertProof();
        proof.setAlertId(alert.getId());
        proof.setAlertTitle(alert.getTitle());
        proof.setAlertType(alert.getType());
        proof.setOfficerId(alert.getCreatedByOfficerId());
        proof.setOfficerName(alert.getOfficerName());
        proof.setOfficerBadgeNumber(alert.getOfficerBadgeNumber());
        proof.setProofImageFileName(proofImageFileName);
        proof.setDescription(request.getDescription().trim());
        proof.setPhoneNumber(normalizeOptional(request.getPhoneNumber()));
        proof.setReporterLatitude(request.getReporterLatitude());
        proof.setReporterLongitude(request.getReporterLongitude());
        proof.setReporterLocationText(normalizeOptional(request.getReporterLocationText()));
        proof.setStatus("PENDING");
        alertProofRepo.save(proof);
        return AlertProofResponse.from(proof);
    }

    public List<AlertProofResponse> getProofsForOfficer(Long alertId, Long officerId) {
        requireOwnedAlert(alertId, officerId);
        return alertProofRepo.findByAlertIdOrderByCreatedAtDesc(alertId)
                .stream()
                .map(AlertProofResponse::from)
                .toList();
    }

    public AlertProofResponse updateProofStatus(Long alertId, Long proofId, Long officerId, String status) {
        requireOwnedAlert(alertId, officerId);

        String normalizedStatus = normalizeStatus(status);
        if (!REVIEW_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid proof status");
        }

        AlertProof proof = alertProofRepo.findByIdAndAlertId(proofId, alertId)
                .orElseThrow(() -> new NoSuchElementException("Proof not found"));
        proof.setStatus(normalizedStatus);
        alertProofRepo.save(proof);
        return AlertProofResponse.from(proof);
    }

    private Alert requireOwnedAlert(Long alertId, Long officerId) {
        return alertRepo.findByIdAndCreatedByOfficerId(alertId, officerId)
                .orElseThrow(() -> new NoSuchElementException("Alert not found"));
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return "";
        }
        return status.trim().toUpperCase();
    }
}