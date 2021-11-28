export interface DevOpsError {
  message: string;
  name: string;
  responseText: string;
  serverError: {
    errorCode: number;
    eventId: number;
    message: string;
    typeKey: string;
    typeName: string;
  };
}
