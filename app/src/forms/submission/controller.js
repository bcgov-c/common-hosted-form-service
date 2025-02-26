const { Statuses } = require('../common/constants');
const cdogsService = require('../../components/cdogsService');
const emailService = require('../email/emailService');
const oesService = require('../../components/oesService');
const service = require('./service');

module.exports = {
  read: async (req, res, next) => {
    try {
      const response = await service.read(req.params.formSubmissionId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const response = await service.update(req.params.formSubmissionId, req.body, req.currentUser, req.headers.referer);
      if (!response) {
        // Return Bad request if we're trying to save draft on already submitted record
        res.status(400).json({ detail: 'Incorrect Submission status.' });
      } else {
        // Send an OES message, if required //
        const submission = await service.read(req.params.formSubmissionId);
        const formID = submission.form.id
        const threadID = submission.submission.submission.data.threadID;
        const caseID = submission.submission.submission.data.caseID;
        if (formID === "d91cf793-699d-46c6-a354-878a8f185c11"){ //TODO: use env var
          const token = req.kauth.grant.access_token.token;
          oesService.sendMessage(token, `I've revised and submitted my form. It can be viewed here: http://localhost:8081/app/form/view?s=${req.params.formSubmissionId}`, threadID, caseID)
          .catch((err) => {
            console.log("ERR SENDING MESSAGE: ", err)
          })
        }
        res.status(200).json(response);
      }
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const response = await service.delete(req.params.formSubmissionId, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  deleteMutipleSubmissions: async (req, res, next) => {
    try {
      let submissionIds = req.body && req.body.submissionIds ? req.body.submissionIds : [];
      const response = await service.deleteMutipleSubmissions(submissionIds, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  restoreMutipleSubmissions: async (req, res, next) => {
    try {
      let submissionIds = req.body && req.body.submissionIds ? req.body.submissionIds : [];
      const response = await service.restoreMutipleSubmissions(submissionIds, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  restore: async (req, res, next) => {
    try {
      const response = await service.restore(req.params.formSubmissionId, req.body, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  readOptions: async (req, res, next) => {
    try {
      const response = await service.readOptions(req.params.formSubmissionId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  getNotes: async (req, res, next) => {
    try {
      const response = await service.getNotes(req.params.formSubmissionId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  addNote: async (req, res, next) => {
    try {
      const response = await service.addNote(req.params.formSubmissionId, req.body, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  getStatus: async (req, res, next) => {
    try {
      const response = await service.getStatus(req.params.formSubmissionId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  addStatus: async (req, res, next) => {
    try {
      const tasks = [service.changeStatusState(req.params.formSubmissionId, req.body, req.currentUser), service.read(req.params.formSubmissionId)];
      const [response, submission] = await Promise.all(tasks);
      // send an email (async in the background)
      if (req.body.code === Statuses.ASSIGNED && req.body.assignmentNotificationEmail) {
        emailService
          .statusAssigned(submission.form.id, response[0], req.body.assignmentNotificationEmail, req.body.revisionNotificationEmailContent, req.headers.referer)
          .catch(() => {});
      } else if (req.body.code === Statuses.COMPLETED && req.body.submissionUserEmail) {
        emailService.statusCompleted(submission.form.id, response[0], req.body.submissionUserEmail, req.body.revisionNotificationEmailContent, req.headers.referer).catch(() => {});
      } else if (req.body.code === Statuses.REVISING && req.body.submissionUserEmail) {
        emailService.statusRevising(submission.form.id, response[0], req.body.submissionUserEmail, req.body.revisionNotificationEmailContent, req.headers.referer).catch(() => {});
      }

      // Send an OES message, if required //
      if (req.body.code === Statuses.REVISING){
        const submission = await service.read(req.params.formSubmissionId);
        //console.log("SUBMISSION DATA: ", submission.submission.submission.data)
        const formID = submission.form.id
        const threadID = submission.submission.submission.data.threadID;
        const caseID = submission.submission.submission.data.caseID;
        if (formID === "d91cf793-699d-46c6-a354-878a8f185c11" && threadID && caseID){ //TOOD: make this an env array variable
          const token = req.kauth.grant.access_token.token;
          oesService.sendMessage(token, `Hello, please review and re-sign your Client Consent Form submission. It can be accessed here: http://localhost:8081/app/user/draft?s=${req.params.formSubmissionId}`, threadID, caseID)
          .catch((err) => {
            console.log("ERR SENDING MESSAGE: ", err)
          })
        }
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  email: async (req, res, next) => {
    try {
      const submission = await service.read(req.params.formSubmissionId);
      const response = await emailService.submissionConfirmation(submission.form.id, req.params.formSubmissionId, req.body, req.headers.referer);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  templateUploadAndRender: async (req, res, next) => {
    try {
      const submission = await service.read(req.params.formSubmissionId);
      const templateBody = { ...req.body, data: submission.submission.submission.data };
      const { data, headers, status } = await cdogsService.templateUploadAndRender(templateBody);
      const contentDisposition = headers['content-disposition'];

      res
        .status(status)
        .set({
          'Content-Disposition': contentDisposition ? contentDisposition : 'attachment',
          'Content-Type': headers['content-type'],
        })
        .send(data);
    } catch (error) {
      next(error);
    }
  },
  draftTemplateUploadAndRender: async (req, res, next) => {
    try {
      const templateBody = { ...req.body.template, data: req.body.submission.data };
      const { data, headers, status } = await cdogsService.templateUploadAndRender(templateBody);
      const contentDisposition = headers['content-disposition'];

      res
        .status(status)
        .set({
          'Content-Disposition': contentDisposition ? contentDisposition : 'attachment',
          'Content-Type': headers['content-type'],
        })
        .send(data);
    } catch (error) {
      next(error);
    }
  },
  listEdits: async (req, res, next) => {
    try {
      const response = await service.listEdits(req.params.formSubmissionId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
