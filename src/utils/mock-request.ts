import { create_services } from "./create-services";

// creates mocked values of controller function parameters
export function mock_request({ params, body, query }: { params?: any; query?: any; body?: any; services: any; }) {
  const services = create_services();
  const request = {
    params: {
      ...params
    },
    body: {
      ...body
    },
    query: {
      ...query
    },
    context: {
      services
    }
  } as any;
  const response = {
    status: jest.fn(() => response),
    json: jest.fn(() => response)
  } as any;
  const next = jest.fn();

  return {
    request,
    response,
    next
  }
}
