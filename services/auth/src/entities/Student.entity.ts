import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany
} from 'typeorm';
import { User } from './User.entity';
import { Parent } from './Parent.entity';
import { QuizAttempt } from './QuizAttempt.entity';

export interface AccessibilitySettings {
  font_family?: string;
  font_size?: number;
  line_spacing?: number;
  letter_spacing?: number;
  text_color?: string;
  background_color?: string;
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({
    name: 'accessibility_settings',
    type: 'jsonb',
    nullable: true,
    default: {
      font_family: 'Arial',
      font_size: 16,
      line_spacing: 1.5,
      letter_spacing: 0,
      text_color: '#000000',
      background_color: '#FFFFFF'
    }
  })
  accessibilitySettings: AccessibilitySettings | null;

  // Relational mappings
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Parent, parent => parent.students)
  parents: Parent[];

  @OneToMany(() => QuizAttempt, attempt => attempt.student)
  quizAttempts: QuizAttempt[];
}
