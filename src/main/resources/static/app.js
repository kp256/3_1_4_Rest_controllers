const URL = "http://localhost:8080/api";

const userFetchService = {
    head: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': null
    },
    getAuthUser: async () => await fetch(URL + '/user'),
    getUsers: async () => await fetch(URL + '/admin/users'),
    getUser: async (id) => await fetch(URL + `/admin/users/${id}`),
    saveUser: async (user) => {
        const method = user.id ? 'PUT' : 'POST';
        try {
            const response = await fetch(URL + '/admin/users', {
                method: method,
                headers: userFetchService.head,
                body: JSON.stringify(user)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save user: ${errorText}`);
            }
            return response;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await fetch(URL + `/admin/users/${id}`, {
                method: 'DELETE',
                headers: userFetchService.head
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete user: ${errorText}`);
            }
            return response;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

class User {
    constructor(id, username, password, roles) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.roles = roles.map(role => ({
            id: role.id,
            role: role.role
        }));
    }
}

async function getAuth() {
    try {
        let response = await userFetchService.getAuthUser();
        if (!response.ok) throw new Error('Failed to fetch authenticated user');

        let authUser = await response.json();
        console.log('Authenticated user:', authUser);

        const authUsername = document.querySelector('#authUsername');
        const authRoles = document.querySelector('#authRoles');

        authUsername.innerText = authUser.username;
        authRoles.innerText = getRoles(authUser.roles);

        const authInfo = document.querySelector('#authInfo');
        if (authInfo) {
            const columns = authInfo.children;
            setUserRow(columns, authUser);
        }

        if (authUser.roles.some(role => role.role === 'ADMIN')) {
            await getUsers();
        } else {
            document.querySelector('#user-panel').classList.add("show", "active");
            document.querySelector('#admin-panel-tab').classList.remove('active');
            document.querySelector('#user-panel-tab').classList.add('active');
        }

        updateUserPanel(authUser);

    } catch (error) {
        console.error('Error fetching authenticated user:', error);
    }
}

async function handlerUserButton(event) {
    let id = Number(event.target.dataset.index);
    if (id) {
        let typeButton = event.target.dataset.type;
        try {
            let response = await userFetchService.getUser(id);
            if (!response.ok) throw new Error('Failed to fetch user data');
            let user = await response.json();

            if (typeButton === 'edit') {
                const editForm = document.querySelector('#editForm');
                clearValidateMsg(editForm.elements);
                inputModal(user, editForm);

                const editBtn = document.querySelector('#editBtn');
                editBtn.removeEventListener('click', handlerEditButton);
                editBtn.addEventListener('click', handlerEditButton);
            } else if (typeButton === 'delete') {
                const deleteForm = document.querySelector('#deleteForm');
                inputModal(user, deleteForm);

                const deleteBtn = document.querySelector('#deleteBtn');
                deleteBtn.removeEventListener('click', handlerDeleteButton);
                deleteBtn.addEventListener('click', handlerDeleteButton);
            }
        } catch (error) {
            console.error('Error handling user button:', error);
        }
    }
}

async function handlerEditButton(event) {
    event.preventDefault();
    const elements = event.target.form.elements;
    if (!validateForm(elements)) return;

    const roles = [{roleId: elements.roleId.value, name: elements.name.value}];
    const data = new User(elements.id.value, elements.username.value, elements.password.value, roles);

    try {
        await userFetchService.saveUser(data);
        document.querySelector('#editUser').classList.remove('show');
        document.querySelector('#editUser').classList.remove('fade');
        await getUsers();
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

async function handlerDeleteButton(event) {
    event.preventDefault();
    const id = document.querySelector('#idDelete').value;

    if (!id) {
        console.error("User ID is not set.");
        return;
    }

    try {
        await userFetchService.deleteUser(id);
        document.querySelector('#delUser').classList.remove('show');
        document.querySelector('#delUser').classList.remove('fade');
        await getUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function handlerAddButton(event) {
    event.preventDefault();
    const elements = event.target.form.elements;

    const usernameElement = elements.username || elements.create_username;
    const passwordElement = elements.password || elements.create_password;
    const rolesElement = elements.roles || elements.createRoles;

    if (!usernameElement || !passwordElement || !rolesElement || !validateForm({
        username: usernameElement,
        password: passwordElement
    })) return;

    const roles = Array.from(rolesElement.options)
        .filter(option => option.selected)
        .map(option => ({ id: rolesMap[option.value] }));

    const data = {
        username: usernameElement.value,
        password: passwordElement.value,
        roles: roles
    };

    try {
        await userFetchService.saveUser(data);
        clearAddForm();
        const usersTableTab = document.querySelector('#users-table-tab');
        usersTableTab.click();
        await getUsers();
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

function clearValidateMsg(formElements) {
    if (formElements.username) {
        formElements.username.classList.remove('is-invalid');
    }
    if (formElements.password) {
        formElements.password.classList.remove('is-invalid');
    }
    if (formElements.name) {
        formElements.name.classList.remove('is-invalid');
    }
}

function validateForm(formElements) {
    let check = true;
    clearValidateMsg(formElements);

    if (formElements.username && formElements.username.value.length < 1) {
        formElements.username.classList.add('is-invalid');
        check = false;
    }
    if (formElements.password && formElements.password.value.length < 1) {
        formElements.password.classList.add('is-invalid');
        check = false;
    }
    if (formElements.name && formElements.name.value.length < 1) {
        formElements.name.classList.add('is-invalid');
        check = false;
    }

    return check;
}

function clearAddForm() {
    const addForm = document.querySelector('#addForm');
    for (let i = 0; i < addForm.length; i++) {
        addForm[i].value = '';
    }
}

function setUserRow(columns, thisUser) {
    columns[0].innerText = thisUser.id;
    columns[1].innerText = thisUser.username;
    columns[2].innerText = getRoles(thisUser.roles);
}

function getRoles(listRoles) {
    return listRoles.map(role => role.role).join(' ');
}

function inputModal(user, element) {
    element[0].value = user.id;
    element[1].value = user.username;
    element[2].value = ''; // Оставляем пароль пустым
    element[3].value = user.roles.map(role => role.id).join(','); // ID ролей
    element[4].value = "Delete";
}

async function getUsers() {
    try {
        let response = await userFetchService.getUsers();
        if (!response.ok) throw new Error('Failed to fetch users');

        let listUsers = await response.json();
        const userTable = document.querySelector('#userTable');
        const userRow = document.querySelector('#userRow');
        userTable.innerHTML = '';

        for (let user of listUsers) {
            let newRow = userRow.content.firstElementChild.cloneNode(true);
            newRow.addEventListener('click', handlerUserButton);
            let columns = newRow.children;
            setUserRow(columns, user);

            columns[3].firstElementChild.dataset.index = user.id; // Edit button
            columns[4].firstElementChild.dataset.index = user.id; // Delete button
            userTable.append(newRow);
        }

        const addBtn = document.querySelector('#addBtn');
        addBtn.removeEventListener('click', handlerAddButton);
        addBtn.addEventListener('click', handlerAddButton);

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function updateUserPanel(user) {
    const userId = document.querySelector('#userId span');
    const userName = document.querySelector('#userName span');
    const userRole = document.querySelector('#userRole span');

    userId.innerText = user.id;
    userName.innerText = user.username;
    userRole.innerText = getRoles(user.roles);
}

let rolesMap = {};

async function fetchRoles() {
    try {
        const response = await fetch('/api/admin/roles');
        if (!response.ok) throw new Error('Failed to fetch roles');
        const roles = await response.json();
        roles.forEach(role => {
            rolesMap[role.role] = role.id;
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

fetchRoles(); // Call this function on initialization
getAuth();
