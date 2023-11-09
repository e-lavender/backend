export const getConfiguration = () => ({
  global: {
    domain: process.env.DOMAIN,
  },
  services: {
    users: {
      port: process.env.USERS_SERVICES_PORT,
      salt: process.env.SALT_GENERATE_ROUND,
    },
    email: {
      gmail: process.env.GMAIL,
      password: process.env.GMAIL_PASS,
    },
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
