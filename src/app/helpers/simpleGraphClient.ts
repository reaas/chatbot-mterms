import { Client } from '@microsoft/microsoft-graph-client';
import { User } from '@microsoft/microsoft-graph-types';
import { GraphHelper } from '../helpers/graphHelper';


export class SimpleGraphClient {
    
    private token: string;
    private static tokenResponse: any;
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

    public async createTask(schemaValues): Promise<void> {
        let taskID : string = ""
        let userID : string = ""
        let taskEtag : string = ""

        console.log("heyhey:", schemaValues)

        let title = "Purchase: " + schemaValues._isin + ", " + schemaValues._issuer 
        let description = "Issuer: " + schemaValues._issuer 
        + "\n" + "Issue Date: " + schemaValues._issueDate 
        + "\n" + "Maturity Date: " + schemaValues._maturityDate
        + "\n" + "Rate: " + schemaValues._rate 
        + "\n" + "Manager: " + schemaValues._manager
        + "\n" + "Amount: " + schemaValues._amount
        + "\n" + "Percentage Price: " + schemaValues._percentagePrice
        + "\n" + "Credit Curve: " + schemaValues._creditCurve
        + "\n" + "Issuer Type: " + schemaValues._issuerType
        + "\n" + "Included in Stress: " + schemaValues._stressIncludeInStress
        + "\n" + "Stress Interest Rate: " + schemaValues._stressInterestRate
        + "\n" + "Stress Spread: " + schemaValues._stressSpread
        + "\n" + "Stress Currency: " + schemaValues._stressCurrency
        
        try {
            const data = await this.graphClient.api('/planner/tasks').post({"planId":"ooju5jbJVU6QGW5aMiLTjZgAC5KZ","title": title,"assignments":{}});
            taskID = data.id
            userID = data.createdBy.user.id
            taskEtag = data["@odata.etag"]
        } catch (error) {
            console.log("Error creating the task", error)
            //Sende ut feilmelding i chatten?
        }
        try {
            let details = await this.graphClient.api('/planner/tasks/' + taskID + "/details").get()
            const assignee = {
                "assignments": {
                    [userID] : {
                        "@odata.type": "#microsoft.graph.plannerAssignment",
                        "orderHint": " !"
                    }
                }
            }
            let assignment = await this.graphClient.api('planner/tasks/' + taskID).header("If-Match", taskEtag).update(assignee)
            let newDescription = await this.graphClient.api('/planner/tasks/' + taskID + '/details')
            .header("If-Match", details["@odata.etag"])
            .update({description: description});
            
        } catch (error) {
            console.log("Error updating the task:", error)
            //Sende ut feilmelding i chatten?
        }
    }

}
