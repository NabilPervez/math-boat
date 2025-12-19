import type { Question } from '../types';

// Helper to generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to create a believable distractor
const createDistractor = (correct: number): number => {
    const strategies = [
        () => correct + 1,
        () => correct - 1,
        () => correct + 10,
        () => correct - 10,
        () => correct + randomInt(2, 5),
        () => correct - randomInt(2, 5),
    ];

    // Try to pick a distractor that isn't the correct answer and is positive if the correct answer is positive/small
    let distractor = correct;
    while (distractor === correct) {
        const strategy = strategies[randomInt(0, strategies.length - 1)];
        distractor = strategy();
        // For simple arithmetic, avoid negative distractors if the answer is positive, unless complexity is high
        if (correct >= 0 && distractor < 0) distractor = Math.abs(distractor);
    }
    return distractor;
};

export const generateQuestion = (complexity: number): Question => {
    let expression = '';
    let correctAnswer = 0;

    // Safe clamping of complexity
    const level = Math.max(1, Math.min(10, complexity));

    switch (level) {
        case 1: // Addition (1-10)
            {
                const a = randomInt(1, 10);
                const b = randomInt(1, 10);
                expression = `${a} + ${b}`;
                correctAnswer = a + b;
            }
            break;
        case 2: // Subtraction (1-10)
            {
                const a = randomInt(1, 10);
                const b = randomInt(1, 10);
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                expression = `${big} - ${small}`;
                correctAnswer = big - small;
            }
            break;
        case 3: // Addition (10-50)
            {
                const a = randomInt(10, 50);
                const b = randomInt(1, 50);
                expression = `${a} + ${b}`;
                correctAnswer = a + b;
            }
            break;
        case 4: // Subtraction (10-50)
            {
                const a = randomInt(10, 50);
                const b = randomInt(1, 40);
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                expression = `${big} - ${small}`;
                correctAnswer = big - small;
            }
            break;
        case 5: // Multiplication (Tables 1-5)
            {
                const a = randomInt(1, 5);
                const b = randomInt(1, 10);
                expression = `${a} × ${b}`;
                correctAnswer = a * b;
            }
            break;
        case 6: // Division (Simple integers)
            {
                const b = randomInt(2, 9); // divisor
                const result = randomInt(1, 10); // quotient
                const a = b * result; // dividend
                expression = `${a} ÷ ${b}`;
                correctAnswer = result;
            }
            break;
        case 7: // Multiplication (Tables 6-12)
            {
                const a = randomInt(6, 12);
                const b = randomInt(2, 10);
                expression = `${a} × ${b}`;
                correctAnswer = a * b;
            }
            break;
        case 8: // Mixed Operations (Simple 3-term)
            {
                // e.g. 5 + 3 * 2. Keep it simple for mental math, maybe just 2 terms but larger range or mixed types
                // Let's do (a + b) or (a - b) type things but maybe slightly larger or just random + / - / *
                const op = Math.random() < 0.5 ? '+' : '-';
                const a = randomInt(20, 100);
                const b = randomInt(5, 20);
                expression = `${a} ${op} ${b}`;
                correctAnswer = op === '+' ? a + b : a - b;
            }
            break;
        case 9: // Simple Algebra (x + a = b)
            {
                // x + 5 = 12 -> x = 7
                const x = randomInt(1, 12);
                const add = randomInt(1, 20);
                const sum = x + add;
                expression = `x + ${add} = ${sum}`;
                correctAnswer = x;
            }
            break;
        case 10: // Pre-Algebra (Negative numbers/variables - e.g. 2x = 10 or 5 - x = 8)
            {
                if (Math.random() < 0.5) {
                    // 2x = 10
                    const x = randomInt(2, 12);
                    const coeff = randomInt(2, 9);
                    const product = x * coeff;
                    expression = `${coeff}x = ${product}`;
                    correctAnswer = x;
                } else {
                    // Negative result: 5 - 10 = ?
                    const a = randomInt(5, 10);
                    const b = randomInt(11, 20);
                    expression = `${a} - ${b}`;
                    correctAnswer = a - b;
                }
            }
            break;
        default:
            {
                const a = randomInt(1, 10);
                const b = randomInt(1, 10);
                expression = `${a} + ${b}`;
                correctAnswer = a + b;
            }
    }

    const distractor = createDistractor(correctAnswer);

    return {
        id: crypto.randomUUID(),
        expression,
        correctAnswer,
        distractor,
        complexityLevel: level,
    };
};
