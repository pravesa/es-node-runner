import {relative} from 'path';

// It takes the absolute path of the dir as an argument and returns the root path
function getParentDir(cwd: string) {
  return cwd.substring(0, cwd.search(/[\\/]/) + 1);
}

/**
 * This function returns the number of up level from the current working directory
 * to the project root / parent dir.
 * This can be achieved with this statement (str.match(/(..)/g) || []).length but below
 * implementation is faster.
 * @param str pass the relative path between the two absolute path evaluated by path.relative
 * @returns number of up level from the {from} path to {to} path
 */
function rootLevelFromCWD(str: string) {
  const strLen = str.length;
  let level = 0,
    i = 0;

  while (i < strLen) {
    if (str[i] + str[i + 1] === '..') {
      level += 1;
      i += 3;
    } else i += 1;
  }
  return level;
}

// Resolves list of relative path to the node_modules from cwd until project root / parent dir reaches.
function resolveNodeModulePaths() {
  const cwd = process.cwd();
  let nodeModuleDir = `node_modules/*`,
    level = 0;

  const depth = rootLevelFromCWD(
    relative(cwd, process.env.PROJECT_CWD ?? getParentDir(cwd))
  );

  const nodeModulePaths = [`./${nodeModuleDir}`];

  while (level < depth) {
    nodeModuleDir = '../' + nodeModuleDir;
    nodeModulePaths.push(nodeModuleDir);
    level++;
  }
  return nodeModulePaths;
}

export default resolveNodeModulePaths;
