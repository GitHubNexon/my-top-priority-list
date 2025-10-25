import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeInsert,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generatedId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({
    name: 'profile_image',
    type: 'text',
    nullable: true,
  })
  profileImage: string;

  @Column({ name: 'full_name', type: 'varchar', nullable: false })
  fullname: string;

  @Column({
    name: 'email',
    unique: true,
    nullable: false,
    transformer: {
      to: (value: string) => value.trim().toLowerCase(),
      from: (value: string) => value,
    },
  })
  email: string;

  @Column({ name: 'password', type: 'varchar', nullable: false })
  password: string;

  @Column({ name: 'failed_attempts', type: 'int', default: 0 })
  failedAttempts: number;

  @Column({
    name: 'lockout_until',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  lockoutUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @VersionColumn({ name: 'version' })
  version: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
