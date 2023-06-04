import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BookEntity } from './book.entity';

@Entity({ name: 'LIBRARY_ENTITY' })
export class LibraryEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  public id: number;

  @Column({ name: 'NAME', length: 50 })
  public name: string;

  @Column({ name: 'ADDRESS', length: 500 })
  public address: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
  public updatedAt: Date;

  @OneToMany(() => BookEntity, (book) => book.library, { cascade: true })
  public bookDetail: BookEntity[];
}
