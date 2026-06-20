class User {
    constructor(id, name, email, phone, role, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt
    }
}

module.exports = User;
