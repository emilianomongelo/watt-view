import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('readings')
export class Reading {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'timestamptz' })
  recorded_at!: Date;

  @Column({ type: 'real', nullable: true })
  battery_soc!: number | null;

  @Column({ type: 'real', nullable: true })
  battery_power!: number | null;

  @Column({ type: 'real', nullable: true })
  pv_power!: number | null;

  @Column({ type: 'real', nullable: true })
  load_power!: number | null;

  @Column({ type: 'real', nullable: true })
  daily_yield!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
