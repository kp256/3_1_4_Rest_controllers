package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.services.RoleService; // Импортируйте сервис для ролей
import ru.kata.spring.boot_security.demo.services.UserService;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.models.Role;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
public class RESTController {

    private final UserService userService;
    private final RoleService roleService; // Добавьте сервис для ролей

    @Autowired
    public RESTController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping("api/user")
    public ResponseEntity<User> getAuthorizedUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/api/admin/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/api/admin/users/{id}")
    public ResponseEntity<User> getUser(@PathVariable int id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/api/admin/users")
    public ResponseEntity<HttpStatus> createUser(@RequestBody User user) {
        try {
            System.out.println("Received user: " + user);
            Set<Role> roles = new HashSet<>();
            for (Role role : user.getRoles()) {
                Role existingRole = roleService.findById(role.getId());
                roles.add(existingRole);
            }
            user.setRoles(roles);

            userService.saveUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(HttpStatus.BAD_REQUEST);
        }
    }


    @PutMapping("/api/admin/users")
    public ResponseEntity<User> updateUser(@RequestBody User user) {
        try {
            Set<Role> roles = new HashSet<>();
            for (Role role : user.getRoles()) {
                Role existingRole = roleService.findById(role.getId());
                roles.add(existingRole);
            }
            user.setRoles(roles);

            userService.saveUser(user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable int id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("/api/admin/roles")
    public ResponseEntity<List<Role>> getRoles() {
        List<Role> roles = roleService.findAll();
        return ResponseEntity.ok(roles);
    }
}
