package com.publicesafity.config;

import com.publicesafity.entity.PoliceOfficer;
import com.publicesafity.repository.PoliceRepo;
import com.publicesafity.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String AUTHENTICATED_OFFICER = "authenticatedOfficer";

    private final TokenService tokenService;
    private final PoliceRepo policeRepo;

    public AuthInterceptor(TokenService tokenService, PoliceRepo policeRepo) {
        this.tokenService = tokenService;
        this.policeRepo = policeRepo;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing authorization token");
            return false;
        }

        String token = authHeader.substring(7);
        var principal = tokenService.parseToken(token).orElse(null);
        if (principal == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return false;
        }

        PoliceOfficer officer = policeRepo.findById(principal.officerId()).orElse(null);
        if (officer == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Officer not found");
            return false;
        }

        request.setAttribute(AUTHENTICATED_OFFICER, officer);
        return true;
    }
}
