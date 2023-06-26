import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { ClientConfigGeneratorFactory } from './client_config_generator_factory.js';
import { BackendIdentifier } from '@aws-amplify/plugin-types';

// Because this function is acting as the DI container for this functionality, there is no way to test it without
// exposing the ClientConfigGeneratorFactory in the method signature. For this reason, we're turning off coverage for this file
// All this function should do is construct the factory and delegate to generateClientConfig()
// TODO this functionality should be tested in an E2E test once we've worked out a strategy to use real AWS credentials in tests
// https://github.com/aws-amplify/samsara-cli/issues/46
/* c8 ignore start */

/**
 * Main entry point for generating client config
 */
export const generateClientConfig = async (
  credentialProvider: AwsCredentialIdentityProvider,
  backendIdentifier: BackendIdentifier
) => {
  const clientConfigGeneratorFactory = new ClientConfigGeneratorFactory(
    credentialProvider
  );
  const clientConfigGenerator =
    'stackName' in backendIdentifier
      ? clientConfigGeneratorFactory.fromStackIdentifier(backendIdentifier)
      : clientConfigGeneratorFactory.fromProjectEnvironmentIdentifier(
          backendIdentifier
        );
  await clientConfigGenerator.generateClientConfig();
};