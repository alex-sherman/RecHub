import { titleCase } from ".";

const fetching = async (url: string, queryParams: any, token: any, baseUrl?: string) => {
  let options: any = {
    method: "POST",
    headers: {},
  };
  if (queryParams) {
    if (queryParams.__proto__ !== FormData.prototype) {
      queryParams = JSON.stringify(queryParams);
    }
    options.body = queryParams;
  }

  if (token) {
    options.headers["Authorization"] = token;
  }

  return await fetch(`${baseUrl || "/api"}/${url}`, options);
};

export default fetching;
