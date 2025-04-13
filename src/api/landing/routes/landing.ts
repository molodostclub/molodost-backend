/**
 * landing router
 */

import { factories } from '@strapi/strapi';

// export default factories.createCoreRouter('api::landing.landing');
export default factories.createCoreRouter('api::landing.landing', {
  prefix: '',
  only: ['find'],
  except: [],
  config: {
    find: {
      auth: false,
    },
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});

