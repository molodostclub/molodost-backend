/**
 * landing controller
 */

import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::landing.landing');
export default factories.createCoreController('api::landing.landing', ({ strapi }) => ({
  async find(ctx) {
    const houses = await strapi.db.query('api::house.house').findMany({});
    const trips = await strapi.db.query('api::trip.trip').findMany({});
    const result = {
      houses,
      trips,
    }

    return result;
    
    // const sanitizedResults = await this.sanitizeOutput(result, ctx);
    // return this.transformResponse(sanitizedResults, {});
  }
}))