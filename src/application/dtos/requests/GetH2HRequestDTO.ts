export interface GetH2HRequestDTO {
  team1Id: number;
  team2Id: number;
  startDate: string;
  endDate: string;
  includeQuarters?: boolean;
}
