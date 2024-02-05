import { APIGatewayProxyResult } from "aws-lambda";

export const sendResponse = <T>(data: T, code: number, headers?: Object): APIGatewayProxyResult => {
    return {
        statusCode: code,   
        body: JSON.stringify(data),
    };
};


export const ensureString = (object: { [name: string]: any }, propName: string): string => {
    if (!object[propName] || object[propName].trim().length === 0)
        throw new Error(propName + " does not exist or is empty");
    return object[propName];
}