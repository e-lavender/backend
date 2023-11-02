export const getConfiguration = () => ({
  global: {},
  services: {
    users: {
      port: process.env.USERS_SERVICES_PORT,
    },
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
