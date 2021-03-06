import { SimpleGraphClient } from './simpleGraphClient';
import { SimplePnPJsClient } from './simplePnpjsClient';

export class GraphHelper {
    /**
     * Let's the user see if the user exists using GraphClient
     * @param {TokenResponse} tokenResponse A response that includes a user token.
     * @param {string} emailAddress The email address of the user.
     */
    public static async userExists(tokenResponse: any, emailAddress: string): Promise<boolean> {
        if (!tokenResponse) {
            throw new Error('GraphHelper.userExists(): `tokenResponse` cannot be undefined.');
        }
        const client = new SimpleGraphClient(tokenResponse.token);
        await client.createTask(tokenResponse);
        return await client.userExists(emailAddress);
    }

    public static async createTask(tokenResponse, denneblirikkebrukt: string): Promise<void> {
        if (!tokenResponse) {
            throw new Error('GraphHelper.createTask(): `tokenResponse` cannot be undefined.')
        }
        const client = new SimpleGraphClient(tokenResponse.token);
        await client.createTask(denneblirikkebrukt)
    }

    /**
     * Let's the user see if the alias already is in use using PnPJs
     * @param {TokenResponse} tokenResponse A response that includes a user token.
     * @param {string} alias The alias of the site/group.
     */
    public static async aliasExists(tokenResponse: any, alias: string): Promise<boolean> {
        if (!tokenResponse) {
            throw new Error('GraphHelper.aliasExists(): `tokenResponse` cannot be undefined.');
        }
        const client = new SimplePnPJsClient(tokenResponse.token);
        return await client.aliasExists(alias);
    }
}
