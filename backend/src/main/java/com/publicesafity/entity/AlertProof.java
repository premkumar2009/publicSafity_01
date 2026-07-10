package com.publicesafity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_proofs")
public class AlertProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "alert_id", nullable = false)
    private Long alertId;

    @Column(name = "alert_title", nullable = false, length = 160)
    private String alertTitle;

    @Column(name = "alert_type", nullable = false, length = 60)
    private String alertType;

    @Column(name = "officer_id", nullable = false)
    private Long officerId;

    @Column(name = "officer_name", nullable = false, length = 120)
    private String officerName;

    @Column(name = "officer_badge_number", nullable = false, length = 40)
    private String officerBadgeNumber;

    @Column(name = "proof_image_file_name", length = 255)
    private String proofImageFileName;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "reporter_latitude")
    private Double reporterLatitude;

    @Column(name = "reporter_longitude")
    private Double reporterLongitude;

    @Column(name = "reporter_location_text", length = 255)
    private String reporterLocationText;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null || this.status.isBlank()) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public String getAlertTitle() {
        return alertTitle;
    }

    public void setAlertTitle(String alertTitle) {
        this.alertTitle = alertTitle;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public Long getOfficerId() {
        return officerId;
    }

    public void setOfficerId(Long officerId) {
        this.officerId = officerId;
    }

    public String getOfficerName() {
        return officerName;
    }

    public void setOfficerName(String officerName) {
        this.officerName = officerName;
    }

    public String getOfficerBadgeNumber() {
        return officerBadgeNumber;
    }

    public void setOfficerBadgeNumber(String officerBadgeNumber) {
        this.officerBadgeNumber = officerBadgeNumber;
    }

    public String getProofImageFileName() {
        return proofImageFileName;
    }

    public void setProofImageFileName(String proofImageFileName) {
        this.proofImageFileName = proofImageFileName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Double getReporterLatitude() {
        return reporterLatitude;
    }

    public void setReporterLatitude(Double reporterLatitude) {
        this.reporterLatitude = reporterLatitude;
    }

    public Double getReporterLongitude() {
        return reporterLongitude;
    }

    public void setReporterLongitude(Double reporterLongitude) {
        this.reporterLongitude = reporterLongitude;
    }

    public String getReporterLocationText() {
        return reporterLocationText;
    }

    public void setReporterLocationText(String reporterLocationText) {
        this.reporterLocationText = reporterLocationText;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}