const {
  expect,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
  databaseBuilder,
  knex,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const nock = require('nock');

describe('Acceptance | Controller | user-tutorial-controller', function () {
  let server;

  const learningContent = {
    skills: [
      {
        id: 'skillId',
        challenges: [{ id: 'k_challenge_id' }],
      },
    ],
    tutorials: [
      {
        id: 'tutorialId',
        locale: 'en-us',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'Source Example, Example',
        title: 'Communiquer',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
    await databaseBuilder.factory.buildUser({
      id: 4444,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });
    await databaseBuilder.commit();

    mockLearningContent(learningContent);
  });

  describe('PUT /api/users/tutorials/{tutorialId}', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'PUT',
        url: '/api/users/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444),
        },
      };
    });

    afterEach(async function () {
      return knex('user-saved-tutorials').delete();
    });

    describe('nominal case', function () {
      it('should respond with a 201 and return user-tutorial created', async function () {
        // given
        const expectedUserTutorial = {
          data: {
            type: 'user-tutorials',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.deep.equal(expectedUserTutorial.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes['user-id']).to.deep.equal(
          expectedUserTutorial.data.attributes['user-id']
        );
        expect(response.result.data.attributes['tutorial-id']).to.deep.equal(
          expectedUserTutorial.data.attributes['tutorial-id']
        );
      });

      describe('when skill id is given', function () {
        it('should respond with a 201 and return user-tutorial created', async function () {
          // given
          options.payload = { data: { attributes: { 'skill-id': 'skillId' } } };
          const expectedUserTutorial = {
            data: {
              type: 'user-tutorials',
              id: '1',
              attributes: {
                'skill-id': 'skillId',
                'tutorial-id': 'tutorialId',
                'user-id': 4444,
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.type).to.deep.equal(expectedUserTutorial.data.type);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['user-id']).to.deep.equal(
            expectedUserTutorial.data.attributes['user-id']
          );
          expect(response.result.data.attributes['tutorial-id']).to.deep.equal(
            expectedUserTutorial.data.attributes['tutorial-id']
          );
          expect(response.result.data.attributes['skill-id']).to.deep.equal(
            expectedUserTutorial.data.attributes['skill-id']
          );
        });
      });
    });

    describe('error cases', function () {
      it('should respond with a 404 - not found when tutorialId does not exist', async function () {
        // given
        options.url = '/api/users/tutorials/badId';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('GET /api/users/tutorials', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'GET',
        url: '/api/users/tutorials',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444),
        },
      };
    });

    describe('nominal case', function () {
      it('should respond with a 200 and return tutorials saved by user', async function () {
        // given
        databaseBuilder.factory.buildUserSavedTutorial({ id: 4242, userId: 4444, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedUserTutorials = {
          data: [
            {
              type: 'user-tutorials',
              id: '4242',
              attributes: {
                'user-id': 4444,
              },
              relationships: {
                tutorial: {
                  data: {
                    id: 'tutorialId',
                    type: 'tutorials',
                  },
                },
              },
            },
          ],
          included: [
            {
              id: 'tutorialId',
              type: 'tutorials',
              attributes: {
                id: 'tutorialId',
                duration: '00:03:31',
                format: 'vidéo',
                link: 'http://www.example.com/this-is-an-example.html',
                source: 'Source Example, Example',
                title: 'Communiquer',
              },
            },
          ],
        };
        expect(response.result.included).to.deep.equal(expectedUserTutorials.included);
        expect(response.result.data[0].type).to.deep.equal(expectedUserTutorials.data[0].type);
        expect(response.result.data[0].id).to.deep.equal(expectedUserTutorials.data[0].id);
        expect(response.result.data[0].attributes['user-id']).to.deep.equal(
          expectedUserTutorials.data[0].attributes['user-id']
        );
        expect(response.result.data[0].relationships).to.deep.equal(expectedUserTutorials.data[0].relationships);
      });
    });
  });

  describe('GET /api/users/tutorials/recommended', function () {
    let options;
    const userId = 4444;
    let learningContentObjects;

    beforeEach(async function () {
      nock.cleanAll();
      cache.flushAll();
      options = {
        method: 'GET',
        url: '/api/users/tutorials/recommended',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': 'fr',
        },
      };
      learningContentObjects = learningContentBuilder.buildLearningContent([
        {
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name: 'Fabriquer un meuble',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web1',
                      challenges: [],
                      tutorialIds: ['tuto1', 'tuto2'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                        {
                          id: 'tuto2',
                          locale: 'fr-fr',
                          duration: '00:01:51',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example2.html',
                          source: 'tuto.com',
                          title: 'tuto2',
                        },
                      ],
                    },
                    {
                      id: 'recSkill2',
                      nom: '@web2',
                      challenges: [],
                      tutorialIds: ['tuto3'],
                      tutorials: [
                        {
                          id: 'tuto3',
                          locale: 'fr-fr',
                          duration: '00:03:31',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example3.html',
                          source: 'tuto.com',
                          title: 'tuto3',
                        },
                      ],
                    },
                    {
                      id: 'recSkill3',
                      nom: '@web3',
                      challenges: [],
                      tutorialIds: ['tuto4'],
                      tutorials: [
                        {
                          id: 'tuto4',
                          locale: 'fr-fr',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                        {
                          id: 'tuto5',
                          locale: 'en-us',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    describe('nominal case', function () {
      it('should respond with a 200 and return tutorials recommended for user', async function () {
        // given
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill1',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.VALIDATED,
          source: KnowledgeElement.SourceType.INFERRED,
          skillId: 'recSkill2',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill3',
        });

        const tutorialEvaluationId = databaseBuilder.factory.buildTutorialEvaluation({
          userId,
          tutorialId: 'tuto1',
        }).id;
        const userSavedTutorialId = databaseBuilder.factory.buildUserSavedTutorial({
          userId,
          tutorialId: 'tuto1',
          skillId: 'recSkill1',
        }).id;

        await databaseBuilder.commit();

        const expectedUserTutorials = [
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
            id: 'tuto1',
            relationships: {
              'tutorial-evaluation': {
                data: {
                  id: `${tutorialEvaluationId}`,
                  type: 'tutorialEvaluation',
                },
              },
              'user-tutorial': {
                data: {
                  id: `${userSavedTutorialId}`,
                  type: 'user-tutorial',
                },
              },
            },
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:01:51',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example2.html',
              source: 'tuto.com',
              title: 'tuto2',
            },
            id: 'tuto2',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:04:38',
              format: 'vidéo',
              link: 'http://www.example.com/this-is-an-example4.html',
              source: 'tuto.com',
              title: 'tuto4',
            },
            id: 'tuto4',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedUserTutorials);
        expect(response.result.meta).to.deep.equal({
          page: 1,
          pageSize: 10,
          rowCount: 3,
          pageCount: 1,
        });
      });
    });

    describe('with pagination', function () {
      it('should respond with a 200 and return paginated recommended tutorials for a user ', async function () {
        // given
        options.url = '/api/users/tutorials/recommended?page[number]=1&page[size]=2';
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill1',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.VALIDATED,
          source: KnowledgeElement.SourceType.INFERRED,
          skillId: 'recSkill2',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill3',
        });

        await databaseBuilder.commit();

        const expectedUserTutorials = [
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
            id: 'tuto1',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:01:51',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example2.html',
              source: 'tuto.com',
              title: 'tuto2',
            },
            id: 'tuto2',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedUserTutorials);
        expect(response.result.meta).to.deep.equal({
          page: 1,
          pageSize: 2,
          rowCount: 3,
          pageCount: 2,
        });
      });
    });
  });

  describe('GET /api/users/tutorials/saved', function () {
    let options;
    let learningContentObjects;
    const userId = 4444;

    beforeEach(async function () {
      nock.cleanAll();
      cache.flushAll();
      options = {
        method: 'GET',
        url: '/api/users/tutorials/saved',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      learningContentObjects = learningContentBuilder.buildLearningContent([
        {
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name: 'Fabriquer un meuble',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web1',
                      challenges: [],
                      tutorialIds: ['tuto1', 'tuto2'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'en-us',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                        {
                          id: 'tuto2',
                          locale: 'en-us',
                          duration: '00:01:51',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example2.html',
                          source: 'tuto.com',
                          title: 'tuto2',
                        },
                      ],
                    },
                    {
                      id: 'recSkill2',
                      nom: '@web2',
                      challenges: [],
                      tutorialIds: ['tuto3'],
                      tutorials: [
                        {
                          id: 'tuto3',
                          locale: 'fr-fr',
                          duration: '00:03:31',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example3.html',
                          source: 'tuto.com',
                          title: 'tuto3',
                        },
                      ],
                    },
                    {
                      id: 'recSkill3',
                      nom: '@web3',
                      challenges: [],
                      tutorialIds: ['tuto4'],
                      tutorials: [
                        {
                          id: 'tuto4',
                          locale: 'fr-fr',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    describe('nominal case', function () {
      it('should respond with a 200 and return tutorials saved for user', async function () {
        // given
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildUserSavedTutorial({ id: 101, userId: 4444, tutorialId: 'tuto1' });

        await databaseBuilder.commit();

        const expectedUserSavedTutorials = [
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
            relationships: {
              'user-tutorial': { data: { id: '101', type: 'user-tutorial' } },
              'tutorial-evaluation': {
                data: null,
              },
            },
            id: 'tuto1',
            type: 'tutorials',
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedUserSavedTutorials);
        expect(response.result.meta).to.deep.equal({
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        });
      });
    });

    describe('with pagination', function () {
      it('should respond with a 200 and return paginated saved tutorials for a user ', async function () {
        // given
        options.url = '/api/users/tutorials/saved?page[number]=1&page[size]=2';

        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildUserSavedTutorial({ id: 101, userId: 4444, tutorialId: 'tuto1' });
        databaseBuilder.factory.buildUserSavedTutorial({ id: 102, userId: 4444, tutorialId: 'tuto2' });
        databaseBuilder.factory.buildUserSavedTutorial({ id: 103, userId: 4444, tutorialId: 'tuto3' });

        await databaseBuilder.commit();

        const expectedUserSavedTutorials = [
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
            relationships: {
              'user-tutorial': { data: { id: '101', type: 'user-tutorial' } },
              'tutorial-evaluation': {
                data: null,
              },
            },
            id: 'tuto1',
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:01:51',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example2.html',
              source: 'tuto.com',
              title: 'tuto2',
            },
            relationships: {
              'user-tutorial': { data: { id: '102', type: 'user-tutorial' } },
              'tutorial-evaluation': {
                data: null,
              },
            },
            id: 'tuto2',
            type: 'tutorials',
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedUserSavedTutorials);
        expect(response.result.meta).to.deep.equal({
          page: 1,
          pageSize: 2,
          rowCount: 3,
          pageCount: 2,
        });
      });
    });
  });

  describe('DELETE /api/users/tutorials/{tutorialId}', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'DELETE',
        url: '/api/users/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444),
        },
      };
    });

    describe('nominal case', function () {
      it('should respond with a 204', async function () {
        // given
        databaseBuilder.factory.buildUserSavedTutorial({ userId: 4444, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
