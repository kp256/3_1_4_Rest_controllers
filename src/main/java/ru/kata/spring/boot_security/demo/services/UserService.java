package ru.kata.spring.boot_security.demo.services;


import ru.kata.spring.boot_security.demo.models.User;

import java.util.List;

public interface UserService {
    List<User> getUsers();

    User getUserById(int id);

    void saveUser(User user);

    void deleteUserById(int id);

    User findByUsername(String username);
}
