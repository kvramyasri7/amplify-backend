import { glob } from 'glob';
import path from 'path';
import assert from 'node:assert';
import fs from 'fs';

const UPDATE_SNAPSHOTS = process.env.UPDATE_INTEGRATION_SNAPSHOTS === 'true';

/**
 * Essentially a snapshot validator.
 *
 * It checks that actualDir and expectedDir have the same files (ignoring ignoreFiles defined below)
 * It then checks that all JSON files parse to identical objects
 * It fails if a non-JSON file is found
 * @param actualDir The actual cdk synth output generated by the test
 * @param expectedDir The expected cdk synth output
 */
export const validateCdkOutDir = async (
  actualDir: string,
  expectedDir: string
) => {
  // These are CDK internal bookkeeping files that change across minor versions of CDK.
  // We only care about validating the CFN templates
  const ignoreFiles = ['tree.json', 'cdk.out', 'manifest.json'];

  const actualFiles = await glob(path.join(actualDir, '*'));
  const expectedFiles = await glob(path.join(expectedDir, '*'));

  /**
   * Filter out ignoreFiles and sort
   */
  const normalize = (paths: string[]) =>
    paths
      .filter((p) => !ignoreFiles.some((ignoreFile) => p.endsWith(ignoreFile)))
      .sort();

  const normalizedActualFiles = normalize(actualFiles);
  const normalizedExpectedFiles = normalize(expectedFiles);

  if (UPDATE_SNAPSHOTS) {
    normalizedActualFiles.forEach((actualFile) => {
      const destination = path.resolve(expectedDir, path.basename(actualFile));
      fs.copyFileSync(actualFile, destination);
    });
    return;
  }

  assert.deepStrictEqual(
    normalizedActualFiles.map((fileName) => path.basename(fileName)),
    normalizedExpectedFiles.map((fileName) => path.basename(fileName))
  );

  // check that JSON files parse to the same object
  for (let i = 0; i < normalizedActualFiles.length; i++) {
    const actualFile = normalizedActualFiles[i];
    const expectedFile = normalizedExpectedFiles[i];
    if (path.extname(normalizedActualFiles[i]) !== '.json') {
      assert.fail(`Unknown file type ${actualFile}`);
    }
    const actualObj = JSON.parse(fs.readFileSync(actualFile, 'utf-8'));
    const expectedObj = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
    assert.deepStrictEqual(actualObj, expectedObj);
  }
};