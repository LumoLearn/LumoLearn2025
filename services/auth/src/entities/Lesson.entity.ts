import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  Index
} from 'typeorm';
import { Teacher } from './Teacher.entity';
import { Quiz } from './Quiz.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  @Index()
  teacherId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content_id', type: 'varchar', length: 255, nullable: true })
  contentId: string | null; // MongoDB ObjectID reference

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relational mappings
  @ManyToOne(() => Teacher, teacher => teacher.lessons)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => Quiz, quiz => quiz.lesson)
  quizzes: Quiz[];
}
