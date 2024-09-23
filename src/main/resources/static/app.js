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

        // Условная логика для отображения интерфейса
        const adminTab = document.querySelector('#adminTab');
        const adminPanel = document.querySelector('#admin-panel');
        const userTab = document.querySelector('#userTab');
        const userPanel = document.querySelector('#user-panel');

        if (authUser.roles.some(role => role.role === 'ADMIN')) {
            adminTab.classList.add('active');
            adminPanel.classList.add('show', 'active');
            userTab.classList.remove('active');
            userPanel.classList.remove('show', 'active');
            await getUsers(); // Получение пользователей для администратора
        } else {
            // Скрыть вкладку администратора
            adminTab.classList.add('d-none');
            adminPanel.classList.add('d-none');

            userTab.classList.add('active');
            userPanel.classList.add('show', 'active');
        }

        await updateUserPanel(authUser);
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
                inputModal(user, editForm, 'edit');
                const editBtn = document.querySelector('#editBtn');
                editBtn.removeEventListener('click', handlerEditButton);
                editBtn.addEventListener('click', handlerEditButton);
            } else if (typeButton === 'delete') {
                const deleteForm = document.querySelector('#deleteForm');
                inputModal(user, deleteForm, 'delete');
                const deleteBtn = document.querySelector('#deleteBtn');
                deleteBtn.removeEventListener('click', handlerDeleteButton);
                deleteBtn.addEventListener('click', handlerDeleteButton);
            }
        } catch (error) {
            console.error('Error handling user button:', error);
        }
    }
}
async function handlerAddButton(event) {
    event.preventDefault();
    const elements = event.target.form.elements;
    const roles = Array.from(elements.createRoles.options)
        .filter(option => option.selected)
        .map(option => ({ id: rolesMap[option.value], role: option.value }));
    const data = {
        username: elements.create_username.value.trim(),
        password: elements.create_password.value.trim(),
        roles: roles
    };
    try {
        await userFetchService.saveUser(data);
        clearAddForm();
        const usersTableTab = document.querySelector('#show-users-table');
        usersTableTab.click();
        await getUsers();
    } catch (error) {
        console.error('Error adding user:', error);
    }
}
async function handlerEditButton(event) {
    event.preventDefault();
    const elements = event.target.form.elements;
    const username = elements.usernameEdit.value.trim();
    const password = elements.passwordEdit.value.trim();
    const errors = [];
    if (username.length < 3 || username.length > 30) {
        errors.push("Username must be between 3 and 30 characters.");
    }
    if (password && (password.length < 6 || password.length > 100)) {
        errors.push("Password must be between 6 and 100 characters.");
    }
    if (elements.editRoles.selectedOptions.length === 0) {
        errors.push("At least one role must be selected.");
    }
    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }
    const roles = Array.from(elements.editRoles.options)
        .filter(option => option.selected)
        .map(option => ({ id: rolesMap[option.value], role: option.value }));
    const data = {
        id: elements.idEdit.value,
        username: username,
        password: password || null,
        roles: roles
    };
    try {
        await userFetchService.saveUser(data);
        const modal = bootstrap.Modal.getInstance(document.querySelector('#editUser'));
        modal.hide();
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
        const deleteModal = bootstrap.Modal.getInstance(document.querySelector('#delUser'));
        deleteModal.hide();
        await getUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
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
function inputModal(user, formElement, type) {
    formElement[0].value = user.id;
    formElement[1].value = user.username;
    if (type === 'edit') {
        formElement[2].value = '';
        const rolesOptions = formElement[3].options;
        Array.from(rolesOptions).forEach(option => {
            option.selected = user.roles.some(role => role.role === option.value);
        });
        formElement[4].value = "Edit";
    } else if (type === 'delete') {
        formElement[4].value = "Delete";
    }
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
            columns[3].firstElementChild.dataset.index = user.id;
            columns[4].firstElementChild.dataset.index = user.id;
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
        const response = await fetch('/api/user/roles');
        if (!response.ok) throw new Error('Failed to fetch roles');
        const roles = await response.json();
        roles.forEach(role => {
            rolesMap[role.role] = role.id;
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}
document.getElementById('addForm').addEventListener('input', validateAddForm);
function validateAddForm() {
    const username = document.getElementById('create_username');
    const password = document.getElementById('create_password');
    const roles = document.getElementById('createRoles');
    let valid = true;
    document.getElementById('usernameError').innerText = '';
    document.getElementById('passwordError').innerText = '';
    document.getElementById('rolesError').innerText = '';
    if (username.value.trim().length < 3 || username.value.trim().length > 30) {
        document.getElementById('usernameError').innerText = "Username must be between 3 and 30 characters.";
        valid = false;
    }
    if (password.value.trim().length < 6 || password.value.trim().length > 100) {
        document.getElementById('passwordError').innerText = "Password must be between 6 and 100 characters.";
        valid = false;
    }
    if (Array.from(roles.selectedOptions).length === 0) {
        document.getElementById('rolesError').innerText = "At least one role must be selected.";
        valid = false;
    }
    document.getElementById('addBtn').disabled = !valid;
}
document.getElementById('editForm').addEventListener('input', validateEditForm);
function validateEditForm() {
    const username = document.getElementById('usernameEdit');
    const password = document.getElementById('passwordEdit');
    const roles = document.getElementById('editRoles');
    let valid = true;
    document.getElementById('usernameEditError').innerText = '';
    document.getElementById('passwordEditError').innerText = '';
    document.getElementById('rolesEditError').innerText = '';
    if (username.value.trim().length < 3 || username.value.trim().length > 30) {
        document.getElementById('usernameEditError').innerText = "Username must be between 3 and 30 characters.";
        valid = false;
    }
    if (password.value && (password.value.trim().length < 6 || password.value.trim().length > 100)) {
        document.getElementById('passwordEditError').innerText = "Password must be between 6 and 100 characters.";
        valid = false;
    }
    if (Array.from(roles.selectedOptions).length === 0) {
        document.getElementById('rolesEditError').innerText = "At least one role must be selected.";
        valid = false;
    }
    document.getElementById('editBtn').disabled = !valid;
}
fetchRoles();
getAuth();
