import chalk from "chalk";

export function debug(...message: unknown[]) {
    console.log(chalk.dim("[DEBUG]", ...message));
}

export function server(...message: unknown[]) {
    console.log(chalk.blue("[SERVER]"), ...message);
}

export function game(...message: unknown[]) {
    console.log(chalk.green("[GAME]"), ...message);
}

export function warn(...message: unknown[]) {
    console.log(chalk.bgYellow("[WARN]"), ...message);
}

export function error(...message: unknown[]) {
    console.log(chalk.bgRed("[ERROR]"), ...message);
}

export function log(...text: unknown[]) { console.log(...text) };