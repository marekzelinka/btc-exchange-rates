import morgan from 'morgan';

export const middleware = {
  logger: morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
      stream: {
        write: (message) => console.log(message.trim()),
      },
    }
  ),
};
