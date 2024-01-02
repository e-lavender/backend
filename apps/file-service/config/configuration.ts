export const getConfiguration = () => ({
  services: {
    file: {
      port: process.env.FILE_SERVICE_PORT,
      host: process.env.FILE_SERVICE_HOST,
    },
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
