const path = require('path');

/**
 * Custom artifact path builder for Detox
 * Organizes artifacts by test suite and timestamp
 */
class ArtifactPathBuilder {
  constructor(config) {
    this.config = config;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  buildArtifactPath(artifactName, testSuite, artifactName2) {
    // Clean test suite name for file system
    const cleanTestSuite = testSuite
      ? testSuite.replace(/[^a-zA-Z0-9\-_]/g, '_').toLowerCase()
      : 'unknown';

    // Create directory structure: rootDir/testSuite/timestamp/
    const directory = path.join(
      this.config.rootDir,
      cleanTestSuite,
      this.timestamp
    );

    // Build final path
    const finalArtifactName = artifactName2 ? `${artifactName}_${artifactName2}` : artifactName;
    return path.join(directory, finalArtifactName);
  }
}

module.exports = ArtifactPathBuilder;