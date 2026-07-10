package com.publicesafity.dto;

import com.publicesafity.entity.Alert;

import java.time.LocalDateTime;

public class AlertResponse {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private String policePhone;
    private String imageFileName;
    private String officerName;
    private String officerBadgeNumber;
    private String status;
    private LocalDateTime createdAt;
    private Double distanceKm;
    private String imageUrl;

    public static AlertResponse from(Alert alert, Double distanceKm) {
        AlertResponse response = new AlertResponse();
        response.id = alert.getId();
        response.type = alert.getType();
        response.title = alert.getTitle();
        response.description = alert.getDescription();
        response.locationName = alert.getLocationName();
        response.latitude = alert.getLatitude();
        response.longitude = alert.getLongitude();
        response.radiusKm = alert.getRadiusKm();
        response.policePhone = alert.getPolicePhone();
        response.imageFileName = alert.getImageFileName();
        response.officerName = alert.getOfficerName();
        response.officerBadgeNumber = alert.getOfficerBadgeNumber();
        response.status = alert.getStatus();
        response.createdAt = alert.getCreatedAt();
        response.distanceKm = distanceKm;
        response.imageUrl = alert.getImageFileName() == null || alert.getImageFileName().isBlank()
                ? null
                : "/api/uploads/images/" + alert.getImageFileName();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocationName() {
        return locationName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public String getPolicePhone() {
        return policePhone;
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public String getOfficerName() {
        return officerName;
    }

    public String getOfficerBadgeNumber() {
        return officerBadgeNumber;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
