package com.publicesafity.dto;

public class AuthResponse {
    private String token;
    private OfficerSummary officer;

    public AuthResponse() {
    }

    public AuthResponse(String token, OfficerSummary officer) {
        this.token = token;
        this.officer = officer;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public OfficerSummary getOfficer() {
        return officer;
    }

    public void setOfficer(OfficerSummary officer) {
        this.officer = officer;
    }

    public static class OfficerSummary {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String badgeNumber;

        public OfficerSummary() {
        }

        public OfficerSummary(Long id, String name, String email, String phone, String badgeNumber) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.badgeNumber = badgeNumber;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getBadgeNumber() {
            return badgeNumber;
        }

        public void setBadgeNumber(String badgeNumber) {
            this.badgeNumber = badgeNumber;
        }
    }
}
