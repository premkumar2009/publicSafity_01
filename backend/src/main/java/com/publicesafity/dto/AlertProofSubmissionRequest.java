package com.publicesafity.dto;

public class AlertProofSubmissionRequest {
    private String description;
    private String phoneNumber;
    private Double reporterLatitude;
    private Double reporterLongitude;
    private String reporterLocationText;

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
}