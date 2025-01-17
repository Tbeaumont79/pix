import {
  ImportStorage,
  S3DeleteError,
  S3ReadError,
  S3UploadError,
} from '../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { config } from '../../../../../../src/shared/config.js';
import { FileValidationError } from '../../../../../../src/shared/domain/errors.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Storage | ImportStorage', function () {
  let basenameStub, createReadStreamStub;

  beforeEach(function () {
    basenameStub = sinon.stub().callsFake((f) => f);
    createReadStreamStub = sinon.stub();
  });

  it('should create a S3 client', async function () {
    // given
    const clientStub = sinon.stub(S3ObjectStorageProvider, 'createClient');

    // when
    new ImportStorage({ basename: basenameStub, createReadStream: createReadStreamStub });

    // then
    expect(clientStub).to.have.been.calledWithExactly(config.import.storage.client);
  });

  describe('#sendFile', function () {
    it('should upload a file', async function () {
      // given
      const filepath = 'hey.xml';
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const importStorage = new ImportStorage({ basename: basenameStub, createReadStream: createReadStreamStub });
      providerStub.startUpload.resolves();
      const noOpStream = { on: () => sinon.stub() };
      createReadStreamStub.withArgs(filepath).returns(noOpStream);

      // when
      await importStorage.sendFile({ filepath });

      // then
      expect(providerStub.startUpload).to.have.been.calledWithExactly({
        filename: 'hey.xml',
        readableStream: noOpStream,
      });
    });

    it('should return filename stored in bucket', async function () {
      // given
      const filepath = 'src/hey.xml';
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      basenameStub.withArgs(filepath).returns('hey.xml');
      const importStorage = new ImportStorage({ basename: basenameStub, createReadStream: createReadStreamStub });
      providerStub.startUpload.resolves();
      const noOpStream = { on: () => sinon.stub() };
      createReadStreamStub.withArgs(filepath).returns(noOpStream);

      // when
      const filename = await importStorage.sendFile({ filepath });

      // then
      expect(filename).to.equals('hey.xml');
    });

    it('throw an error if createReadStream fails', async function () {
      // Given
      const filepath = 'hey.xml';
      createReadStreamStub.throws();
      const importStorage = new ImportStorage({
        basename: basenameStub,
        createReadStream: createReadStreamStub,
      });

      // When
      const fileError = await catchErr(importStorage.sendFile, importStorage)({ filepath });
      // Then
      expect(fileError).to.be.an.instanceOf(FileValidationError);
    });

    it('throw an error if stream send fails', async function () {
      // Given
      const filepath = 'hey.xml';
      const streamStub = {
        on: (_, errorCallback) => {
          errorCallback(new Error());
        },
      };
      createReadStreamStub.returns(streamStub);
      const importStorage = new ImportStorage({
        basename: basenameStub,
        createReadStream: createReadStreamStub.returns(streamStub),
      });

      // When
      const fileError = await catchErr(importStorage.sendFile, importStorage)({ filepath });
      // Then
      expect(fileError).to.be.an.instanceOf(FileValidationError);
    });

    it('throws a S3UploadError if startUpload fail', async function () {
      // Given
      const filepath = 'hey.xml';
      const noOpStream = { on: () => sinon.stub() };
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      providerStub.startUpload.rejects(new Error('Something went wrong'));

      const importStorage = new ImportStorage({
        basename: basenameStub,
        createReadStream: createReadStreamStub.returns(noOpStream),
      });

      // When
      const error = await catchErr(importStorage.sendFile, importStorage)({ filepath });
      // Then
      expect(error).to.be.an.instanceOf(S3UploadError);
      expect(error.message).to.equal('Something went wrong');
    });
  });

  describe('#readFile', function () {
    it('should return readable stream', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const importStorage = new ImportStorage();
      const noOpStream = sinon.stub();
      providerStub.readFile.withArgs({ key: 'hey.xml' }).resolves({ Body: noOpStream });

      // when
      const expectedStream = await importStorage.readFile({ filename: 'hey.xml' });

      // then
      expect(expectedStream).to.equal(noOpStream);
    });

    it('should throw a S3ReadError if readFile fail', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const importStorage = new ImportStorage();
      providerStub.readFile.rejects(new Error('Something went wrong'));

      // when
      const error = await catchErr(importStorage.readFile, importStorage)({ filename: 'hey.xml' });

      // then
      expect(error).to.be.instanceOf(S3ReadError);
      expect(error.message).to.equal('Something went wrong');
    });
  });

  describe('#deleteFile', function () {
    it('should delete a file', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const importStorage = new ImportStorage();
      providerStub.deleteFile.resolves();

      // when
      await importStorage.deleteFile({ filename: 'hey.xml' });

      // then
      expect(providerStub.deleteFile).to.have.been.calledWithExactly({
        key: 'hey.xml',
      });
    });

    it('should throw a S3DeleteError if deleteFile fail', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const importStorage = new ImportStorage();
      providerStub.deleteFile.rejects(new Error('Something went wrong'));

      // when
      const error = await catchErr(importStorage.deleteFile, importStorage)({ filename: 'hey.xml' });

      // then
      expect(error).to.be.instanceOf(S3DeleteError);
      expect(error.message).to.equal('Something went wrong');
    });
  });
});
