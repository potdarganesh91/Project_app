class Users {
    // Constructor
    constructor() {
        this._nextUserId = 1;
        this._userData = {};
    }

    /* Create a new user. */
    createUser(user) {
        const userId = this._nextUserId++;
        this._userData[userId] = { id: userId, ...user };
        return userId;
    }

    /* Update user data. */
    updateUser(userId, updatedUser) {
        if (this._userData.hasOwnProperty(userId)) {
            this._userData[userId] = { ...this._userData[userId], ...updatedUser };
            return true;
        }
        return false; // User not found
    }

    /* Get user data by ID. */
    getUser(userId) {
        return this._userData[userId] || null;
    }

    /* Delete user data by ID. */
    deleteUser(userId) {
        if (this._userData.hasOwnProperty(userId)) {
            delete this._userData[userId];
            return true;
        }
        return false; // User not found
    }

    /* Get all users. */
    getAllUsers() {
        return Object.values(this._userData);
    }
}

// Example usage:
const users = new Users();

const userId = users.createUser({ name: 'John Doe', email: 'john@example.com' });
console.log(users.getUser(userId)); // { id: 1, name: 'John Doe', email: 'john@example.com' }

users.updateUser(userId, { name: 'Updated Name' });
console.log(users.getUser(userId)); // { id: 1, name: 'Updated Name', email: 'john@example.com' }

const allUsers = users.getAllUsers();
console.log(allUsers);
