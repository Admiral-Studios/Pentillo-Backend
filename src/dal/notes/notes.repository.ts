import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateNoteDto } from '../../notes/dto/request-dto/create-note.dto';
import {
  NoteWithAssignedPersonInclude,
  noteWithUserInclude,
} from './types/note-with-user.type';
import { GetNotesDto } from '../../notes/dto/request-dto/get-notes.dto';

@Injectable()
export class NotesRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createNote(
    userId: string,
    dto: CreateNoteDto,
    tx?: Prisma.TransactionClient,
  ): Promise<NoteWithAssignedPersonInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.note.create({
      data: {
        userId,
        ...dto,
      },
      include: noteWithUserInclude,
    });
  }

  public getNotes(
    filter: GetNotesDto,
    tx?: Prisma.TransactionClient,
  ): Promise<NoteWithAssignedPersonInclude[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.NoteWhereInput = {};

    if (filter.fileId) {
      where.fileId = filter.fileId;
    }

    if (filter.taskId) {
      where.taskId = filter.taskId;
    }

    return transactionManager.note.findMany({
      where,
      include: noteWithUserInclude,
      orderBy: { createdAt: 'desc' },
      skip: filter?.skip,
      take: filter?.take,
    });
  }
}
