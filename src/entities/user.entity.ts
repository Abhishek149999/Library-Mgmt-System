import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BookBorrowedRecordEntity } from './bookBorrowed.entity';
import { LibraryEntity } from './library.entity';

@Entity({ name: 'USER_DETAIL' })
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  public id: number;

  @Column({ name: 'NAME', length: 30 })
  public firstName: string;

  @Column({ name: 'MOBILE_NO', length: 12 })
  public lastName: string;

  @Column({ name: 'EMAIL_ID', length: 30 })
  public emailId: string;

  @OneToMany(() => BookBorrowedRecordEntity, (record) => record.user)
  public borrowedRecord: BookBorrowedRecordEntity[];

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
