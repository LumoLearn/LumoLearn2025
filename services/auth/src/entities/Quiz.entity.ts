import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Lesson } from './Lesson.entity';
import { Teacher } from './Teacher.entity';
import { QuizAttempt } from './QuizAttempt.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  @Index()
  lessonId: string | null;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content_id', type: 'varchar', length: 255, nullable: true })
  contentId: string | null; // MongoDB ObjectID reference

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relational mappings
  @ManyToOne(() => Lesson, lesson => lesson.quizzes, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson | null;

  @ManyToOne(() => Teacher, teacher => teacher.quizzes)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz)
  attempts: QuizAttempt[];
}
