DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles
(
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (role)
VALUES ('ROLE_USER'),
       ('ROLE_ADMIN');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users
(
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password)
VALUES ('user', '{bcrypt}$2a$10$AwZt2qO4LT3X4xAOPE/46.xI8jtehfGKeDbAU.TREXTuCddNxMWbW'); -- password: user

INSERT INTO users (username, password)
VALUES ('admin', '{bcrypt}$2a$10$Wp7S2w2pqJJ1Ydeb/zuMcOJlRt1O7Xglwc9lcP4PRNeE3qHeoGOgW'); -- password: admin

DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = 'user'),
        (SELECT id FROM roles WHERE role = 'ROLE_USER'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM roles WHERE role = 'ROLE_ADMIN'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM roles WHERE role = 'ROLE_USER'));
