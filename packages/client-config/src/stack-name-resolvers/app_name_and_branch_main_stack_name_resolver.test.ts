import { beforeEach, describe, it, mock } from 'node:test';
import { AmplifyClient } from '@aws-sdk/client-amplify';
import {
  AppNameAndBranchBackendIdentifier,
  AppNameAndBranchMainStackNameResolver,
} from './app_name_and_branch_main_stack_name_resolver.js';
import assert from 'node:assert';

describe('AppNameAndBranchMainStackNameResolver', () => {
  const amplifyClientMock = new AmplifyClient({ region: 'test-region' });
  const amplifyCLientSendMock = mock.fn();
  mock.method(amplifyClientMock, 'send', amplifyCLientSendMock);

  const appNameAndBranch: AppNameAndBranchBackendIdentifier = {
    appName: 'testAppName',
    branch: 'testBranch',
  };

  beforeEach(() => {
    amplifyCLientSendMock.mock.resetCalls();
  });
  it('fails if no apps have specified name', async () => {
    const resolver = new AppNameAndBranchMainStackNameResolver(
      amplifyClientMock,
      appNameAndBranch
    );
    await assert.rejects(() => resolver.resolveMainStackName(), {
      message: 'No apps found with name testAppName in region test-region',
    });
  });
  it('fails if multiple apps have specified name', async () => {
    amplifyCLientSendMock.mock.mockImplementation(() =>
      Promise.resolve({
        apps: [{ name: 'testAppName' }, { name: 'testAppName' }],
      })
    );
    const resolver = new AppNameAndBranchMainStackNameResolver(
      amplifyClientMock,
      appNameAndBranch
    );
    await assert.rejects(() => resolver.resolveMainStackName(), {
      message:
        'Multiple apps found with name testAppName in region test-region. Use AppId instead of AppName to specify which Amplify App to use.',
    });
  });
  it('fails if matched app does not have appId', async () => {
    amplifyCLientSendMock.mock.mockImplementation(() =>
      Promise.resolve({
        apps: [
          { name: 'testAppName' },
          { name: 'otherAppName', appId: 'otherAppId' },
        ],
      })
    );
    const resolver = new AppNameAndBranchMainStackNameResolver(
      amplifyClientMock,
      appNameAndBranch
    );
    await assert.rejects(() => resolver.resolveMainStackName(), {
      message:
        'Could not determine appId from app name testAppName. Try using AppId instead.',
    });
  });
  it('returns expected stack name', async () => {
    amplifyCLientSendMock.mock.mockImplementation(() =>
      Promise.resolve({
        apps: [{ name: 'testAppName', appId: 'testAppId' }],
      })
    );
    const resolver = new AppNameAndBranchMainStackNameResolver(
      amplifyClientMock,
      appNameAndBranch
    );
    const result = await resolver.resolveMainStackName();
    assert.equal(result, 'amplify-testAppName-testAppId-testBranch');
  });
});