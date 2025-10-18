package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.services.MatchSuggestionService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matches/suggestions")
@RequiredArgsConstructor
@Slf4j
public class MatchSuggestionController {

    private final MatchSuggestionService matchSuggestionService;
    private final UserAuthorizationService userAuthorizationService;

    @PostMapping("/{targetUserId}/dismiss")
    public ResponseEntity<Void> dismissSuggestion(
        @PathVariable Long targetUserId,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        log.debug("User {} dismissing suggestion {}", user.getId(), targetUserId);

        matchSuggestionService.dismissSuggestion(user, targetUserId);
        return ResponseEntity.ok().build();
    }
}
