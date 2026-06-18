class Lesson {
    constructor(id, name, description, createdBy, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Lesson;