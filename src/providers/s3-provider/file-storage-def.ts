import { AmplifyConfigBase, ResourceDefinition } from '../../manifest/imperative-types';

/**
 * Types and class for S3 bucket
 */
type FileStorageBase = {
  enforceSSL: boolean;
  bpa: boolean;
};
type FileStorageProps = ResourceDefinition<FileStorageBase, 'stream', undefined>;
type FileStorageActions = 'create' | 'read' | 'update' | 'delete' | 'list';
type FileStorageScopes = string;
export class AmplifyFileStorage extends AmplifyConfigBase<FileStorageProps, FileStorageActions, FileStorageScopes> {
  constructor(public readonly props: FileStorageProps) {
    super('@aws-amplify/file-storage-provider');
  }
}
export const FileStorage = (props: FileStorageProps) => new AmplifyFileStorage(props);