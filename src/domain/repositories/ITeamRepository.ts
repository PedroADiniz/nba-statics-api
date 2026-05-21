import { Team } from '../entities/Team';

export interface ITeamRepository {
  findAll(): Promise<Team[]>;
  findById(id: number): Promise<Team | null>;
  findByConference(conference: 'East' | 'West'): Promise<Team[]>;
}
