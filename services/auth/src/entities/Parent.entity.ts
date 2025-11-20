import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { User } from './User.entity';
import { Student } from './Student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // Relational mappings
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Student, student => student.parents)
  @JoinTable({
    name: 'parent_student',
    joinColumn: {
      name: 'parent_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'student_id',
      referencedColumnName: 'id'
    }
  })
  students: Student[];
}
