export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Fixture {
  id: number;
  date: string;
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
}

export interface Match {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
}

// Structura răspunsului API
export interface ApiResponse {
  response: Match[];
}