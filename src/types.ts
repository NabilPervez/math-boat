export type Operation = '+' | '-' | '*' | '/' | 'mixed' | 'algebra_x' | 'algebra_pre';

export interface Question {
    id: string;
    expression: string; // e.g., "5 + x = 10" or "5 + 5"
    correctAnswer: number;
    distractor: number;
    complexityLevel: number;
}

export interface GameState {
    status: 'IDLE' | 'PLAYING' | 'FINISHED';
    timer: number; // in seconds
    boatPosition: number; // 0 to 100 percentage
    questionsAnsweredCorrectly: number;
    consecutiveWrong: number;
    currentComplexity: number;
    currentQuestion: Question | null;
    history: GameHistory[];
}

export interface GameHistory {
    questionId: string;
    isCorrect: boolean;
    timeTaken: number;
}
