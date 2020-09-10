const schoolingRegistrationDependentUserController = require('./schooling-registration-dependent-user-controller');
const securityPreHandlers = require('../security-pre-handlers');
const JSONAPIError = require('jsonapi-serializer').Error;
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { passwordValidationPattern } = require('../../config').account;
const XRegExp = require('xregexp');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users',
      config: {
        auth: false,
        handler: schoolingRegistrationDependentUserController.createAndReconcileUserToSchoolingRegistration,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'birthdate': Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
                'with-username': Joi.boolean().required(),
              },
            },
          }),
        },
        notes: [
          'Cette route crée un utilisateur et l\'associe à l\'élève trouvé au sein de l\'organisation à laquelle ' +
          'appartient la campagne spécifiée',
        ],
        tags: ['api', 'schoolingRegistrationDependentUser'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/external-user-token',
      config: {
        auth: false,
        handler: schoolingRegistrationDependentUserController.createUserAndReconcileToSchoolingRegistrationFromExternalUser,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'external-user-token': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'birthdate': Joi.date().format('YYYY-MM-DD').raw().required(),
                'access-token': Joi.string().allow(null).optional(),
              },
              type: 'external-users',
            },
          }),
          failAction: (request, h, err) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: err.details[0].message,
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          },
        },
        notes: [
          'Cette route crée un compte utilisateur suite à une connexion provenant d\'un IDP externe (GAR). ' +
          'Les informations sont fournies dans un token. Elle réconcilie également cet utilisateur avec l\'inscription ' +
          'de l\'élève au sein de l\'organisation qui a créé la campagne.',
        ],
        tags: ['api', 'schoolingRegistrationDependentUser'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/password-update',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents',
        }],
        handler: schoolingRegistrationDependentUserController.updatePassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': Joi.number().required(),
                'schooling-registration-id': Joi.number().required(),
              },
            },
          }),
          failAction: (request, h) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          },
        },
        notes : [
          '- Met à jour le mot de passe d\'un utilisateur identifié par son identifiant élève\n' +
          '- La demande de modification du mot de passe doit être effectuée par un membre de l\'organisation à laquelle appartient l\'élève.',
        ],
        tags: ['api', 'schoolingRegistrationDependentUser'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users/generate-username-password',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents,
          assign: 'belongsToScoOrganizationAndManageStudents',
        }],
        handler: schoolingRegistrationDependentUserController.generateUsernameWithTemporaryPassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'organization-id': Joi.number().required(),
                'schooling-registration-id': Joi.number().required(),
              },
            },
          }),
          failAction: (request, h, err) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: err.details[0].message,
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          },
        },
        notes : [
          '- Génère un identifiant pour l\'élève avec un mot de passe temporaire \n' +
          '- La demande de génération d\'identifiant doit être effectuée par un membre de l\'organisation à laquelle appartient l\'élève.',
        ],
        tags: ['api', 'schoolingRegistrationDependentUser', 'username'],
      },
    },
  ]);
};

exports.name = 'schooling-registration-dependent-users-api';
