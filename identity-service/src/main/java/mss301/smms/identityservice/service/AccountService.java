package mss301.smms.identityservice.service;

import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.PageResponse;
import mss301.smms.identityservice.dto.response.UserResponse;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {
    UserResponse createUser(UserCreateRequest request);
    PageResponse<UserResponse> getUsers(int page, int size, String role, String search);
    UserResponse updateUser(String userId, UserUpdateRequest request);
    UserResponse updateStatus(String userId, UserStatusRequest request);
    void changePassword(String userId, ChangePasswordRequest request);
}
