package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.exeption_handling.NoSuchUserException;
import ru.kata.spring.boot_security.demo.services.UserService;
import ru.kata.spring.boot_security.demo.models.User;

import java.util.List;


@RestController
@RequestMapping("/admin/api")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class RESTController {

    private final UserService userService;

    @Autowired
    public RESTController(UserService userService) {
        this.userService = userService;
    }

    /*
    GET     /users               все пользователи
    GET     /users/{user_id}     получение одного пользователя
    POST    /users               добавление пользователя
    PUT     /users               изменение пользователя
    DELETE  /users/{user_id}     удаление пользователя
     */

    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) {
            throw new NoSuchUserException("No found user with id " + id);
        }
        return user;
    }


    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        userService.saveUser(user);
        return user;
    }

    @PutMapping("/users")
    public User updateUser(@RequestBody User user) {
        userService.updateUser(user);
        return user;
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) {
            throw new NoSuchUserException("No found user with id " + id);
        }

        userService.deleteUserById(id);
        return "User with id " + id + " was deleted";
    }
}
