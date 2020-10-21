import { Client } from '@microsoft/microsoft-graph-client';
import { User } from '@microsoft/microsoft-graph-types';

export class SimpleGraphClient {
    
    private token: string;
    private graphClient: Client;

    constructor(token: any) {
        if (!token || !token.trim()) {
            throw new Error('SimpleGraphClient: Invalid token received.');
        }

        this.token = token;

        this.graphClient = Client.init({
            authProvider: (done) => {
                done(null, this.token); 
            }
        });
    }

    /**
     * Check if a user exists
     * @param {string} emailAddress Email address of the email's recipient.
     */
    public async userExists(emailAddress: string): Promise<boolean> {
        if (!emailAddress || !emailAddress.trim()) {
            throw new Error('SimpleGraphClient.userExists(): Invalid `emailAddress` parameter received.');
        }
        try {
            const user: User = await this.graphClient.api(`/users/${emailAddress}`).get();
            return user ? true : false;
        } catch (error) {
            return false;
        }
    }
    public async getUserID(): Promise<void> {
        let taskID : String = ""
        try {
            const data = await this.graphClient.api('/planner/tasks').post({"planId":"ooju5jbJVU6QGW5aMiLTjZgAC5KZ","title":"Bot task w/description 8)","assignments":{}});
            //console.log("Fungerer", data)
            taskID = data.id
        } catch (error) {
            console.log("her er feilen", error)
        }

        try {
            let details = await this.graphClient.api('/planner/tasks/' + taskID + "/details").get()
            console.log("DETAILS", details)
            let etag = details["@odata.etag"]
            console.log("HER", etag)
            const plannerTaskDetails = {description:"automatic description ;)"};
            let res = await this.graphClient.api('/planner/tasks/' + taskID + '/details')
            .header("If-Match", etag)
            .update(plannerTaskDetails);
            console.log("HER ER RES", res)
        } catch (error) {
            console.log("FEIL:", error)
        }
    } 
}