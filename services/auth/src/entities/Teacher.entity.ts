import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './User.entity';
import { Lesson } from './Lesson.entity';
import { Quiz } from './Quiz.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // Relational mappings
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Lesson, lesson => lesson.teacher)
  lessons: Lesson[];

  @OneToMany(() => Quiz, quiz => quiz.teacher)
  quizzes: Quiz[];
}
