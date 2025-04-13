export default ({ env }) => ({
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        trip: {
          field: "slug",
          references: "title",
        },
        house: {
          field: "slug",
          references: "title",
        },
      },
      shouldUpdateSlug: true,
    },
  },
  upload: {
    config: {
      providerOptions: {
        localServer: {
          // 3 days
          maxAge: 3 * 24 * 60 * 60,
        },
      },
    },
  },
});
