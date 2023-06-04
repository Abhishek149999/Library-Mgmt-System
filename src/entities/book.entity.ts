import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LibraryEntity } from './library.entity';

@Entity({ name: 'BOOK_ENTITY' })
export class BookEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  public id: number;

  @Column({ name: 'NAME', length: 100 })
  public name: string;

  @Column({ name: 'AUTHOR', length: 100 })
  public author: string;

  @Column({ name: 'NUMBER_OF_COPIES' })
  public numberOfCopies: number;

  @CreateDateColumn({ name: 'CREATED_AT' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
  public updatedAt: Date;

  @ManyToOne(() => LibraryEntity, { nullable: true })
  @JoinColumn({
    name: 'LIBRARY_ID',
    referencedColumnName: 'id',
  })
  public library: LibraryEntity;
}
