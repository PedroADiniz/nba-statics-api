import { AppError } from '../../shared/errors/AppError';

export class TeamNotFoundError extends AppError {
  constructor(teamId: number) {
    super(`Time com ID ${teamId} não encontrado.`, 404);
    this.name = 'TeamNotFoundError';
  }
}

export class SameTeamError extends AppError {
  constructor() {
    super('Os dois times devem ser diferentes.', 422);
    this.name = 'SameTeamError';
  }
}

export class InvalidDateRangeError extends AppError {
  constructor() {
    super('startDate deve ser anterior a endDate.', 422);
    this.name = 'InvalidDateRangeError';
  }
}

export class NoGamesFoundError extends AppError {
  constructor(team1: string, team2: string) {
    super(`Nenhum jogo H2H encontrado entre ${team1} e ${team2} no período informado.`, 404);
    this.name = 'NoGamesFoundError';
  }
}
