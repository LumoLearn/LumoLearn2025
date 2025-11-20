import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Quiz } from './Quiz.entity';
import { Student } from './Student.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'integer', nullable: true })
  score: number | null;

  @Column({ type: 'jsonb', nullable: true })
  answers: any; // Flexible JSON structure for quiz answers

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  // Relational mappings
  @ManyToOne(() => Quiz, quiz => quiz.attempts)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @ManyToOne(() => Student, student => student.quizAttempts)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
