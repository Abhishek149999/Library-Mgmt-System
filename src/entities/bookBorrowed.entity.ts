import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { BookEntity } from './book.entity';
import { LibraryEntity } from './library.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'BOOK_BORROWED_RECORD_ENTITY' })
export class BookBorrowedRecordEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  public id: number;

  @CreateDateColumn({ name: 'BORROWED_AT' })
  public borrowedAt: Date;

  @Column({ name: 'RETURNED_AT', nullable: true })
  public returnedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'USER_ID',
    referencedColumnName: 'id',
  })
  public user: UserEntity;

  @ManyToOne(() => BookEntity)
  @JoinColumn({
    name: 'BOOK_ID',
    referencedColumnName: 'id',
  })
  public book: BookEntity;

  @ManyToOne(() => LibraryEntity)
  @JoinColumn({
    name: 'LIBRARY_ID',
    referencedColumnName: 'id',
  })
  public library: LibraryEntity;

  @CreateDateColumn({ name: 'CREATED_AT' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
  public updatedAt: Date;
}
