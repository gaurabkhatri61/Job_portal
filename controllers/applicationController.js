const { Application, Job, User, CompanyProfile } = require('../models');

const applicationController = {
  // Show application form
  async showApplicationForm(req, res) {
    try {
      const job = await Job.findByPk(req.params.jobId, {
        include: [{
          model: CompanyProfile,
          as: 'company',
          attributes: ['companyName', 'logoUrl']
        }]
      });

      if (!job) {
        req.flash('error_msg', 'Job not found');
        return res.redirect('/jobs');
      }

      if (job.status !== 'open') {
        req.flash('error_msg', 'This job is no longer accepting applications');
        return res.redirect(`/jobs/${req.params.jobId}`);
      }

      // Check if user has already applied
      const existingApplication = await Application.findOne({
        where: {
          userId: req.session.user.id,
          jobId: req.params.jobId
        }
      });

      if (existingApplication) {
        req.flash('error_msg', 'You have already applied for this job');
        return res.redirect(`/jobs/${req.params.jobId}`);
      }

      res.render('applications/apply', {
        title: 'Apply for Job',
        job
      });
    } catch (error) {
      console.error('Error showing application form:', error);
      req.flash('error_msg', 'Error loading application form');
      res.redirect('/jobs');
    }
  },

  // Submit application
  async submitApplication(req, res) {
    try {
      const { coverLetter, resumeUrl } = req.body;
      const jobId = req.params.jobId;
      const userId = req.session.user.id;

      if (!coverLetter || !resumeUrl) {
        req.flash('error_msg', 'Please provide both cover letter and resume URL');
        return res.redirect(`/jobs/${jobId}/apply`);
      }

      // Check if job exists and is open
      const job = await Job.findByPk(jobId);
      if (!job) {
        req.flash('error_msg', 'Job not found');
        return res.redirect('/jobs');
      }
      if (job.status !== 'open') {
        req.flash('error_msg', 'This job is no longer accepting applications');
        return res.redirect(`/jobs/${jobId}`);
      }

      // Check for existing application
      const existingApplication = await Application.findOne({
        where: { userId, jobId }
      });

      if (existingApplication) {
        req.flash('error_msg', 'You have already applied for this job');
        return res.redirect(`/jobs/${jobId}`);
      }

      // Create application
      await Application.create({
        userId,
        jobId,
        coverLetter,
        resumeUrl,
        status: 'pending'
      });

      req.flash('success_msg', 'Application submitted successfully!');
      res.redirect(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      req.flash('error_msg', 'Error submitting application');
      res.redirect(`/jobs/${req.params.jobId}/apply`);
    }
  },

  // Get user's applications
  async getMyApplications(req, res) {
    try {
      const applications = await Application.findAll({
        where: { userId: req.session.user.id },
        include: [{
          model: Job,
          include: [{
            model: CompanyProfile,
            as: 'company',
            attributes: ['companyName', 'logoUrl']
          }],
          attributes: ['id', 'title', 'type', 'companyProfileId']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.render('applications/my-applications', {
        title: 'My Applications',
        user: req.session.user,
        applications
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      req.flash('error_msg', 'Error fetching your applications');
      res.redirect('/jobs');
    }
  },

  // Get applications for a specific job
  async getJobApplications(req, res) {
    try {
      // First check if the logged-in user has a company profile
      const companyProfile = await CompanyProfile.findOne({
        where: { userId: req.session.user.id }
      });

      if (!companyProfile) {
        req.flash('error_msg', 'You do not have permission to view these applications');
        return res.redirect('/jobs');
      }

      // Get the job and verify it belongs to the logged-in user's company
      const job = await Job.findOne({
        where: {
          id: req.params.jobId,
          companyProfileId: companyProfile.id // This ensures the job belongs to the user's company
        },
        include: [{
          model: CompanyProfile,
          as: 'company',
          attributes: ['companyName', 'logoUrl', 'id', 'userId']
        }]
      });

      if (!job) {
        req.flash('error_msg', 'Job not found or you do not have permission to view its applications');
        return res.redirect('/jobs');
      }

      // Now get the applications for this job
      const applications = await Application.findAll({
        where: { jobId: job.id }, // Using job.id instead of req.params.jobId for extra safety
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.render('applications/job-applications', {
        title: 'Job Applications',
        job,
        applications,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching job applications:', error);
      req.flash('error_msg', 'Error fetching job applications');
      res.redirect('/jobs');
    }
  },

  // Update application status
  async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      // First check if the logged-in user has a company profile
      const companyProfile = await CompanyProfile.findOne({
        where: { userId: req.session.user.id }
      });

      if (!companyProfile) {
        return res.status(403).json({ 
          success: false,
          message: 'You do not have permission to update application status'
        });
      }

      // Find application with job details
      const application = await Application.findByPk(id, {
        include: [{
          model: Job,
          where: {
            companyProfileId: companyProfile.id // Only find applications for jobs owned by this company
          },
          include: [{
            model: CompanyProfile,
            as: 'company'
          }]
        }]
      });

      if (!application) {
        return res.status(404).json({ 
          success: false,
          message: 'Application not found or you do not have permission to update it'
        });
      }

      // Update status
      await application.update({ 
        status,
        updatedAt: new Date()
      });

      // Return updated application with success message
      res.json({
        success: true,
        message: 'Application status updated successfully',
        application: {
          id: application.id,
          status: application.status,
          updatedAt: application.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while updating the application status'
      });
    }
  }
};

module.exports = applicationController;
