import type { Question } from '../types';

// Helper to generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to create a believable distractor
const createDistractor = (correct: number): number => {
    // Tight distractors to force calculation over estimation
    const strategies = [
        () => correct + 1,
        () => correct - 1,
        () => correct + 2,
        () => correct - 2,
        () => correct + 3,
        () => correct - 3,
        // Common parity flip
        () => correct + (correct % 2 === 0 ? 1 : -1),
    ];

    let distractor = correct;
    let attempts = 0;
    while ((distractor === correct) && attempts < 20) {
        const strategy = strategies[randomInt(0, strategies.length - 1)];
        distractor = strategy();
        // Prevent negative distractors for positive answers unless it's an advanced level (handled roughly by value)
        // If correct is > 5, distractor shouldn't be negative generally in this simple logic
        if (correct >= 0 && distractor < 0) distractor = Math.abs(distractor);
        attempts++;
    }
    // Fallback if loop fails
    if (distractor === correct) distractor = correct + 1;

    return distractor;
};

export const COMPEXITY_NAMES: Record<number, string> = {
    1: "Basic Addition",
    2: "Basic Subtraction",
    3: "Intermediate Addition",
    4: "Intermediate Subtraction",
    5: "Multiplication (Basic)",
    6: "Division",
    7: "Multiplication (Advanced)",
    8: "Mixed Operations",
    9: "Simple Algebra",
    10: "Pre-Algebra"
};

export const getLevelName = (level: number) => COMPEXITY_NAMES[level] || "Unknown";

export const generateQuestion = (complexity: number): Question => {
    let expression = '';
    let correctAnswer = 0;

    // Safe clamping of complexity
    const level = Math.max(1, Math.min(10, complexity));

    switch (level) {
        case 1: // Addition (1-20, or 3 terms)
            {
                if (Math.random() < 0.2) {
                    // 3 terms: 2 + 3 + 1
                    const a = randomInt(1, 5);
                    const b = randomInt(1, 5);
                    const c = randomInt(1, 5);
                    expression = `${a} + ${b} + ${c}`;
                    correctAnswer = a + b + c;
                } else {
                    const a = randomInt(5, 20);
                    const b = randomInt(1, 10);
                    expression = `${a} + ${b}`;
                    correctAnswer = a + b;
                }
            }
            break;
        case 2: // Subtraction (1-20)
            {
                const a = randomInt(10, 25);
                const b = randomInt(1, 10);
                expression = `${a} - ${b}`;
                correctAnswer = a - b;
            }
            break;
        case 3: // Addition (Double Digits 10-99)
            {
                const a = randomInt(15, 99);
                const b = randomInt(10, 50);
                expression = `${a} + ${b}`;
                correctAnswer = a + b;
            }
            break;
        case 4: // Subtraction (Double Digits 10-99)
            {
                const a = randomInt(30, 99);
                const b = randomInt(10, Math.min(a - 1, 50));
                expression = `${a} - ${b}`;
                correctAnswer = a - b;
            }
            break;
        case 5: // Multiplication (Tables 2-9)
            {
                const a = randomInt(2, 9);
                const b = randomInt(2, 10);
                expression = `${a} × ${b}`;
                correctAnswer = a * b;
            }
            break;
        case 6: // Division (Larger integers)
            {
                const b = randomInt(3, 10); // divisor
                const result = randomInt(4, 15); // quotient
                const a = b * result; // dividend
                expression = `${a} ÷ ${b}`;
                correctAnswer = result;
            }
            break;
        case 7: // Multiplication (Tables 7-15, Squares)
            {
                if (Math.random() < 0.3) {
                    // Squares
                    const a = randomInt(5, 12);
                    expression = `${a}²`; // Display as square if renderer supports, or just a * a behavior
                    expression = `${a} × ${a}`;
                    correctAnswer = a * a;
                } else {
                    const a = randomInt(8, 15);
                    const b = randomInt(3, 10);
                    expression = `${a} × ${b}`;
                    correctAnswer = a * b;
                }
            }
            break;
        case 8: // Mixed Operations (e.g. 5 * 3 + 2, 20 - 4 * 2)
            {
                const mode = Math.random();
                if (mode < 0.33) {
                    // a * b + c
                    const a = randomInt(2, 8);
                    const b = randomInt(2, 8);
                    const c = randomInt(1, 20);
                    expression = `${a} × ${b} + ${c}`;
                    correctAnswer = a * b + c;
                } else if (mode < 0.66) {
                    // a * b - c
                    const a = randomInt(3, 9);
                    const b = randomInt(2, 9);
                    const c = randomInt(1, (a * b) - 1);
                    expression = `${a} × ${b} - ${c}`;
                    correctAnswer = a * b - c;
                } else {
                    // a + b * c
                    const a = randomInt(5, 20);
                    const b = randomInt(2, 6);
                    const c = randomInt(2, 6);
                    expression = `${a} + ${b} × ${c}`;
                    correctAnswer = a + b * c;
                }
            }
            break;
        case 9: // Algebra (x + a = b, ax = b)
            {
                const mode = Math.random();
                if (mode < 0.5) {
                    // ax + b = c -> x = ?
                    // 2x + 5 = 15 -> 2x = 10 -> x = 5
                    const x = randomInt(2, 10);
                    const a = randomInt(2, 5);
                    const b = randomInt(1, 20);
                    const c = (a * x) + b;
                    expression = `${a}x + ${b} = ${c}`;
                    correctAnswer = x;
                } else {
                    // x - a = b
                    const x = randomInt(10, 50);
                    const a = randomInt(5, 20);
                    const b = x - a;
                    expression = `x - ${a} = ${b}`;
                    correctAnswer = x;
                }
            }
            break;
        case 10: // Pre-Algebra / Harder
            {
                const mode = Math.random();
                if (mode < 0.33) {
                    // Inequalities: 2x < 10 (Solve for limit? Or just evaluate? Hard for single number answer)
                    // Let's stick to equations but harder.
                    // 3x - 5 = x + 7
                    // 2x = 12 -> x = 6
                    const x = randomInt(3, 12);
                    // Let's do: ax - b = c
                    const a = randomInt(3, 9);
                    const b = randomInt(1, 20);
                    const result = (a * x) - b;
                    expression = `${a}x - ${b} = ${result}`;
                    correctAnswer = x;
                } else if (mode < 0.66) {
                    // Negative Arithmetic
                    const a = randomInt(5, 20);
                    const b = randomInt(25, 50);
                    expression = `${a} - ${b}`;
                    correctAnswer = a - b;
                } else {
                    // Variable Squares: x^2 = 49
                    const x = randomInt(3, 12);
                    expression = `x² = ${x * x}`;
                    correctAnswer = x;
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

    // Generate 3 unique distractors
    const distractors = new Set<number>();

    // Safety break
    let loops = 0;
    while (distractors.size < 3 && loops < 50) {
        const d = createDistractor(correctAnswer);
        if (d !== correctAnswer && !distractors.has(d)) {
            distractors.add(d);
        }
        loops++;
    }

    // Fill if we failed to find enough distinct ones (rare edge case with small numbers)
    while (distractors.size < 3) {
        distractors.add(correctAnswer + distractors.size + 1);
    }

    // Combine and shuffle
    const answers = [correctAnswer, ...Array.from(distractors)];
    // Fisher-Yates shuffle
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    return {
        id: crypto.randomUUID(),
        expression,
        correctAnswer,
        answers,
        complexityLevel: level,
    };
};
