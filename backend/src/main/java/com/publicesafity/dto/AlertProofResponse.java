package com.publicesafity.dto;

import com.publicesafity.entity.AlertProof;

import java.time.LocalDateTime;

public class AlertProofResponse {
    private Long id;
    private Long alertId;
    private String proofImageFileName;
    private String description;
    private String phoneNumber;
    private Double reporterLatitude;
    private Double reporterLongitude;
    private String reporterLocationText;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String proofImageUrl;

    public static AlertProofResponse from(AlertProof proof) {
        AlertProofResponse response = new AlertProofResponse();
        response.id = proof.getId();
        response.alertId = proof.getAlertId();
        response.proofImageFileName = proof.getProofImageFileName();
        response.description = proof.getDescription();
        response.phoneNumber = proof.getPhoneNumber();
        response.reporterLatitude = proof.getReporterLatitude();
        response.reporterLongitude = proof.getReporterLongitude();
        response.reporterLocationText = proof.getReporterLocationText();
        response.status = proof.getStatus();
        response.createdAt = proof.getCreatedAt();
        response.updatedAt = proof.getUpdatedAt();
        response.proofImageUrl = proof.getProofImageFileName() == null || proof.getProofImageFileName().isBlank()
                ? null
                : "/api/uploads/images/" + proof.getProofImageFileName();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getAlertId() {
        return alertId;
    }

    public String getProofImageFileName() {
        return proofImageFileName;
    }

    public String getDescription() {
        return description;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Double getReporterLatitude() {
        return reporterLatitude;
    }

    public Double getReporterLongitude() {
        return reporterLongitude;
    }

    public String getReporterLocationText() {
        return reporterLocationText;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }
}