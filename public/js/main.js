// Function to fetch and display featured jobs
async function loadFeaturedJobs() {
    try {
        const response = await fetch('/jobs?featured=true', {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        const jobsContainer = document.getElementById('featured-jobs');
        const jobs = result.data || [];

        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<div class="col-12"><p class="text-center">No featured jobs available.</p></div>';
            return;
        }

        const jobsHTML = jobs.map(job => `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${job.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">
                            ${job.CompanyProfile ? job.CompanyProfile.companyName : 'Company Name Not Available'}
                        </h6>
                        <p class="card-text">${job.description ? job.description.substring(0, 100) + '...' : 'No description available'}</p>
                        <p class="mb-2">
                            <strong>Location:</strong> ${job.location || 'Location Not Specified'}
                        </p>
                        <a href="/jobs/${job.id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

        jobsContainer.innerHTML = jobsHTML;
    } catch (error) {
        console.error('Error loading featured jobs:', error);
        const jobsContainer = document.getElementById('featured-jobs');
        jobsContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error loading featured jobs.</p></div>';
    }
}