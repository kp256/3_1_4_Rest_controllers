//package ru.kata.spring.boot_security.demo.controllers;
//
//import io.micrometer.common.util.StringUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.ModelAttribute;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//
//import ru.kata.spring.boot_security.demo.models.Role;
//import ru.kata.spring.boot_security.demo.models.User;
//import ru.kata.spring.boot_security.demo.services.RoleService;
//import ru.kata.spring.boot_security.demo.services.UserService;
//
//import java.util.Set;
//import java.util.stream.Collectors;
//
//
//@Controller
//@RequestMapping("/admin")
//@PreAuthorize("hasRole('ROLE_ADMIN')")
//public class AdminController {
//    private final UserService userService;
//    private final RoleService roleService;
//    private final PasswordEncoder passwordEncoder;
//
//    @Autowired
//    public AdminController(UserService userService, RoleService roleService, PasswordEncoder passwordEncoder) {
//        this.userService = userService;
//        this.roleService = roleService;
//        this.passwordEncoder = passwordEncoder;
//    }
//
//    @GetMapping()
//    public String redirectToUsers() {
//        return "redirect:admin/users";
//    }
//
//    @GetMapping("/user")
//    public String adminProfile(Authentication authentication, Model model) {
//        String username = authentication.getName();
//        User user = userService.findByUsername(username);
//        model.addAttribute("user", user);
//        model.addAttribute("roles", user.getAuthorities());
//        return "admin/profile";
//    }
//
//    @GetMapping("/users")
//    public String users(Authentication authentication, Model model) {
//        String username = authentication.getName();
//        User user = userService.findByUsername(username);
//        model.addAttribute("user", user);
//        model.addAttribute("roles", user.getAuthorities());
//        model.addAttribute("users", userService.getUsers());
//        model.addAttribute("newUser", new User());
//        return "admin/users";
//    }
//
//    @GetMapping("/new")
//    public String newUser(Model model) {
//        User user = new User();
//        String roles = roleService.getAllRolesString();
//        model.addAttribute("newUser", user);
//        model.addAttribute("newRole", roles);
//        return "redirect:/admin/users";
//    }
//
//    @PostMapping("/user/new")
//    public String createUser(@ModelAttribute("newUser") User user, @RequestParam(value = "roles", required = false) Set<Long> roleIds) {
//        if (roleIds != null) {
//            Set<Role> roles = roleService.getAllRoles().stream()
//                    .filter(role -> roleIds.contains(role.getId()))
//                    .collect(Collectors.toSet());
//            user.setRoles(roles);
//        }
//        userService.saveUser(user);
//        return "redirect:/admin/users";  // Перенаправить после создания пользователя
//    }
//
//
//    @PostMapping("/update")
//    public String updateUser(@ModelAttribute("updateUser") User user,
//                             @RequestParam(value = "roles", required = false) Set<Long> roleIds) {
//        User existingUser = userService.getUserById(user.getId());
//
//        updateUsername(user, existingUser);
//        updatePassword(user, existingUser);
//        updateRoles(roleIds, existingUser);
//
//        userService.updateUser(existingUser);
//        return "redirect:/admin/users";
//    }
//
//    private void updateUsername(User user, User existingUser) {
//        if (StringUtils.isNotBlank(user.getUsername())) {
//            existingUser.setUsername(user.getUsername());
//        }
//    }
//
//    private void updatePassword(User user, User existingUser) {
//        if (StringUtils.isNotBlank(user.getPassword())) {
//            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
//        }
//    }
//
//    private void updateRoles(Set<Long> roleIds, User existingUser) {
//        if (roleIds != null && !roleIds.isEmpty()) {
//            Set<Role> roles = roleService.getAllRoles().stream()
//                    .filter(role -> roleIds.contains(role.getId()))
//                    .collect(Collectors.toSet());
//            existingUser.setRoles(roles);
//        }
//    }
//
//    @PostMapping("/delete")
//    public String deleteUser(@RequestParam("id") int id) {
//        userService.deleteUserById(id);
//        return "redirect:/admin/users";
//    }
//}
