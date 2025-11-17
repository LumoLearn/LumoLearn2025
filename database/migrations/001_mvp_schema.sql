CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (sve uloge)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'parent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

-- Students (sa accessibility settings)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    accessibility_settings JSONB DEFAULT '{"font_family": "Arial", "font_size": 16, "line_spacing": 1.5, "letter_spacing": 0, "text_color": "#000000", "background_color": "#FFFFFF"}'
);

-- Teachers
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Parents
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Parent-Student link
CREATE TABLE parent_student (
    parent_id UUID REFERENCES parents(id),
    student_id UUID REFERENCES students(id),
    PRIMARY KEY (parent_id, student_id)
);

-- Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id),
    title VARCHAR(255) NOT NULL,
    content_id VARCHAR(255), -- MongoDB ID
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id),
    teacher_id UUID REFERENCES teachers(id),
    title VARCHAR(255) NOT NULL,
    content_id VARCHAR(255), -- MongoDB ID
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id),
    student_id UUID REFERENCES students(id),
    score INTEGER,
    answers JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);

-- Test user
INSERT INTO users (email, password_hash, role) 
VALUES ('teacher@test.com', '$2b$12$LQ3KXSshE3jTJdPHSAr.x.vZ7uQ2xXI8YxC5E0J6vdLQ8KqYHX8t6', 'teacher');
-- Password: Test1234!

