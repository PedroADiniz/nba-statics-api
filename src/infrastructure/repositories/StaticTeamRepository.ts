import { Team } from '../../domain/entities/Team';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { NBA_TEAMS } from '../data/nbaTeams';

export class StaticTeamRepository implements ITeamRepository {
  async findAll(): Promise<Team[]> {
    return NBA_TEAMS.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async findById(id: number): Promise<Team | null> {
    return NBA_TEAMS.find((t) => t.id === id) ?? null;
  }

  async findByConference(conference: 'East' | 'West'): Promise<Team[]> {
    return NBA_TEAMS.filter((t) => t.conference === conference)
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
}
