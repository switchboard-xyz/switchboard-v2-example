import findGitRoot from "find-git-root";

export const findProjectRoot = (): string => {
  const gitRoot: string = findGitRoot(process.cwd()).replace(".git", "");
  return gitRoot;
};
