DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles
(
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (role)
VALUES ('USER'),
       ('ADMIN');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users
(
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);


INSERT INTO users (username, password)
VALUES ('user', '$2a$10$Z5I/5tKlFubeX6G.MSeGbeI30WLthKcV4hKSpFzsGSmGmID5h0OQi'); -- password: user

INSERT INTO users (username, password)
VALUES ('admin', '$2a$10$oLXVuCKd4VAmqc5MK8zw.uTwkm6C.B2Y3nMaGa1.Ii.UKLYMgJqHK'); -- password: admin

INSERT INTO users (username, password)
VALUES ('2', '$2a$10$Z5I/5tKlFubeX6G.MSeGbeI30WLthKcV4hKSpFzsGSmGmID5h0OQi'); -- password: 2

INSERT INTO users (username, password)
VALUES ('1', '$2a$10$I6E8qVJc7Q8ZAQPsN9IZjOiYEQu/UzAF0zUUpLxtE0VpOb09SymP.'); -- password: 1

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
        (SELECT id FROM roles WHERE role = 'USER'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM roles WHERE role = 'ADMIN'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM roles WHERE role = 'USER'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = '1'),
        (SELECT id FROM roles WHERE role = 'USER'));

INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE username = '2'),
        (SELECT id FROM roles WHERE role = 'ADMIN'));
