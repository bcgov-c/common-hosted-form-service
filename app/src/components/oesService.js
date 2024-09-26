const config = require('config');
const axios = require('axios');
const errorToProblem = require('./errorToProblem');
const SERVICE = 'OESService';

class OESService {
  constructor({ username, password, apiUrl }) {
    if (!username || !password || !apiUrl) {
      throw new Error('OES service is not configured. Check configuration.');
    }
    this.username = username;
    this.password = password;
    this.apiUrl = apiUrl;
  }

  async getThreadAndCaseID(token) {
    let threadID;
    let caseID;
    await axios.get(`${this.apiUrl}/Message/InboxSummaryList`,
      {
        headers: { "KeycloakToken": token },
        auth: {
          username: this.username,
          password: this.password
        },
        params: {
          pageNum: 1,
          recordCount: 10,
          excludeAttachmentContent: true
        }
      }
    )
    .then((res) => {
      res.data.ResultList.forEach((message => {
        if (message.MessageSubject === "Client Consent Form" && !threadID && !caseID){
          console.log("MESSAGE: ", message)
          threadID = message.ICMParentMessageID;
          caseID = message.ICMCaseID;
        }
      }))
    })
    .catch((err) => {
      console.log(err);
    })
    return { threadID, caseID }
  }
  async sendMessage(token, message, threadID, caseID) {
    try {
      if (token && message && threadID && caseID){
        console.log("THREAD ID: ", threadID);
        console.log("CASE ID: ", caseID);
        let request = {
          "requestObject": 
          {
              "Attachments": null,
              "Form": null,
              "MessageSubject": "Client Consent Form",
              "ICMParentMessageID": threadID, //"1-4ZJKH4C",//threadID, //1-4ZJKG20 or 1-4ZJJD0V
              "MessageBody": message,
              "ToCaseWorkerID": null,
              "ICMCaseID": caseID,
              "UpdateLockNumber": 0,
              "ICMContactID": "1-4T3MXTJ", //TODO
              //"MessageGUID": null //TODO - try hardcoding this!
          }            
        }
        await axios.post(
          `${this.apiUrl}/Message/Create`, 
          request,
          {
            headers: { "KeycloakToken": token },
            auth: {
              username: this.username,
              password: this.password
            }
          }
        )
        .then((res) => {
          console.log("message send response: ", res.data);
        })
        .catch((err) => {
          console.log(err)
        })
        return { threadID: threadID, caseID: caseID}
      }
      else {
        console.log("threadID or caseID not found: ", threadID, caseID)
        return null
      }
    } catch (e) {
      errorToProblem(SERVICE, e);
    }
  }

  async getUserData(token) {
    try {
      let data = { case: null, contact: null, storefront: null, profile: null }
      await axios.get(
        `${this.apiUrl}/AuthenticateClient`, 
        {
          headers: { "KeycloakToken": token },
          auth: {
            username: this.username,
            password: this.password
          }
        }
      )
      .then(async (res) => {
        data.contact = res.data?.CaseContactInfoResponse?.ContactInformation;
        if (res.data.CaseContactInfoResponse?.ContactInformation?.CaseInformation?.HLSCaseInformationList != null){
          const employmentCase = res.data.CaseContactInfoResponse.ContactInformation.CaseInformation.HLSCaseInformationList.find(c => c.Type === "Employment Services"); //TODO: Just getting the first for the PoC. Need to somehow get case data from the 'correct' case? Need to see how to determine this
          data.case = employmentCase;
          if (employmentCase?.ServiceOfficeID){
            await axios.get(`${this.apiUrl}/Storefront/Office/?officeCodes=${employmentCase.ServiceOfficeID}`,
              {
                headers: { "KeycloakToken": token },
                auth: {
                  username: this.username,
                  password: this.password
                }
              }
            )
            .then(async (res) => {
              data.storefront = res.data[0];
              await axios.get(`${this.apiUrl}/Profile`,
                {
                  headers: { "KeycloakToken": token },
                  auth: {
                    username: this.username,
                    password: this.password
                  }
                }
              )
              .then((res) => {
                data.profile = res.data;
              })
              .catch((err) => {
                console.log(err);
              })
            })
            .catch((err) => {
              console.log(err);
            })
          }
        }
      })
      .catch((err) => {
        console.log(err);
      })

      return data
    } catch (e) {
      errorToProblem(SERVICE, e);
    }
  }
}

const username = config.get('serviceClient.oes.wbc.username');
const password = config.get('serviceClient.oes.wbc.password');
const apiUrl = config.get('serviceClient.oes.wbc.apiUrl');

let oesService = new OESService({ username: username, password: password, apiUrl: apiUrl});
module.exports = oesService;
