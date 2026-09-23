package com.example.exp5.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.exp5.filter.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    /* =====================================================
       PASSWORD ENCODER
       ===================================================== */

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /* =====================================================
       SECURITY FILTER CHAIN
       ===================================================== */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            /* =================================================
               CORS
               ================================================= */

            .cors(Customizer.withDefaults())

            /* =================================================
               CSRF
               
               Disabled because this is a stateless REST API
               using JWT authentication.
               ================================================= */

            .csrf(csrf -> csrf.disable())

            /* =================================================
               SESSION MANAGEMENT

               JWT is stateless, so Spring should not create
               server-side login sessions.
               ================================================= */

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            /* =================================================
               AUTHORIZATION RULES
               ================================================= */

            .authorizeHttpRequests(auth -> auth

                /* ---------------------------------------------
                   PUBLIC ENDPOINTS
                   --------------------------------------------- */

                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                .requestMatchers(
                    "/api/health"
                ).permitAll()

                /*
                 * H2 console is allowed during development.
                 */
                .requestMatchers(
                    "/h2-console/**"
                ).permitAll()


                /* ---------------------------------------------
                   H2 CONSOLE RESOURCES
                   --------------------------------------------- */

                .requestMatchers(
                    "/h2-console/**"
                ).permitAll()


                /* ---------------------------------------------
                   POSTS
                   --------------------------------------------- */

                /*
                 * Everyone with a valid JWT can view posts.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/posts",
                    "/api/posts/**"
                ).authenticated()

                /*
                 * ADMIN and EDITOR can create posts.
                 */
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/posts",
                    "/api/posts/**"
                ).hasAnyRole(
                    "ADMIN",
                    "EDITOR"
                )

                /*
                 * ADMIN and EDITOR can update posts.
                 */
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/posts/**"
                ).hasAnyRole(
                    "ADMIN",
                    "EDITOR"
                )

                /*
                 * Only ADMIN can delete posts.
                 */
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/posts/**"
                ).hasRole("ADMIN")


                /* ---------------------------------------------
                   SCHEDULES
                   --------------------------------------------- */

                /*
                 * Authenticated users can view schedules.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/schedules",
                    "/api/schedules/**"
                ).authenticated()

                /*
                 * ADMIN and EDITOR can create schedules.
                 */
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/schedules",
                    "/api/schedules/**"
                ).hasAnyRole(
                    "ADMIN",
                    "EDITOR"
                )

                /*
                 * ADMIN and EDITOR can update schedules.
                 */
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/schedules/**"
                ).hasAnyRole(
                    "ADMIN",
                    "EDITOR"
                )

                /*
                 * Only ADMIN can delete schedules.
                 */
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/schedules/**"
                ).hasRole("ADMIN")


                /* ---------------------------------------------
                   AI POST GENERATOR
                   --------------------------------------------- */

                /*
                 * Logged-in users can use AI generation.
                 */
                .requestMatchers(
                    "/api/ai/**"
                ).authenticated()


                /* ---------------------------------------------
                   RAG AI ASSISTANT
                   --------------------------------------------- */

                /*
                 * Logged-in users can use RAG.
                 */
                .requestMatchers(
                    "/api/rag/**"
                ).authenticated()


                /* ---------------------------------------------
                   NOTIFICATIONS
                   --------------------------------------------- */

                /*
                 * Notifications require JWT authentication.
                 */
                .requestMatchers(
                    "/api/notifications/**"
                ).authenticated()


                /* ---------------------------------------------
                   EVERYTHING ELSE
                   --------------------------------------------- */

                /*
                 * Any endpoint not explicitly listed above
                 * requires authentication.
                 */
                .anyRequest().authenticated()
            )

            /* =================================================
               H2 CONSOLE FRAME SUPPORT
               ================================================= */

            .headers(headers ->
                headers.frameOptions(frame ->
                    frame.sameOrigin()
                )
            )

            /* =================================================
               JWT FILTER
               
               This checks:
               Authorization: Bearer <token>
               ================================================= */

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}