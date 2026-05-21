import { Team } from '../../domain/entities/Team';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import prisma from '../database/prismaClient';

type PrismaTeam = {
  id: number;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  fullName: string;
  name: string;
};

function toDomain(t: PrismaTeam): Team {
  return {
    id: t.id,
    abbreviation: t.abbreviation,
    city: t.city,
    conference: t.conference as 'East' | 'West',
    division: t.division,
    fullName: t.fullName,
    name: t.name,
  };
}

export class PrismaTeamRepository implements ITeamRepository {
  async findAll(): Promise<Team[]> {
    const teams = await prisma.team.findMany({ orderBy: { fullName: 'asc' } });
    return teams.map(toDomain);
  }

  async findById(id: number): Promise<Team | null> {
    const team = await prisma.team.findUnique({ where: { id } });
    return team ? toDomain(team) : null;
  }

  async findByConference(conference: 'East' | 'West'): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { conference },
      orderBy: { fullName: 'asc' },
    });
    return teams.map(toDomain);
  }
}
