export const logRequest = (request: Request) => {
  console.log(`LOG FROM SERVICE WORKER: [Request] ${request.method} ${request.url}`);
};

export const logResponse = async (response: Response) => {
  console.log(
    `LOG FROM SERVICE WORKER: [Response] Endpoint ${response.url} returned with ${response.status} ${response.statusText}`,
  );
  console.log(await response.json());
};
