import chalk from "chalk";

export class SwbError extends Error {
  constructor(message: string, type?: string) {
    super(message);
    this.name = type ? type : "SwbError";
  }
  public toString(): string {
    return `${this.name}:: ${this.message}`;
  }
  public toFormattedString(): string {
    return `${chalk.red(this.name)}:: ${this.message}`;
  }
}

export class ConfigError extends SwbError {
  constructor(message: string) {
    super(message, "ConfigError");
  }
}
