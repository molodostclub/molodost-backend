/**
 * form-request router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::form-request.form-request', {
  prefix: '',
  only: ['create'],
  except: [],
  config: {
    find: {},
    findOne: {},
    create: {
      auth: false,
    },
    update: {},
    delete: {},
  },
});
