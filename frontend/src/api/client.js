const BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    // The fetch itself failed - backend is down or unreachable.
    throw new Error("Could not reach the API. Is the backend server running?");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // response wasn't JSON, keep the default message
    }
    throw new Error(message);
  }

  return res.json();
}

export const api = {
  listCandidates: () => request("/candidates"),
  getCandidate: (id) => request(`/candidates/${id}`),
  getRecommendedJobs: (id) => request(`/candidates/${id}/recommended-jobs`),
  getSimilarCandidates: (id) => request(`/candidates/${id}/similar`),
  getReferralNetwork: (id, hops = 2) => request(`/candidates/${id}/referral-network?hops=${hops}`),
  createCandidate: (data) => request("/candidates", { method: "POST", body: JSON.stringify(data) }),

  listJobs: () => request("/jobs"),
  getJob: (id) => request(`/jobs/${id}`),
  getMatchedCandidates: (id) => request(`/jobs/${id}/matched-candidates`),
  createJob: (data) => request("/jobs", { method: "POST", body: JSON.stringify(data) }),
  applyToJob: (jobId, candidateId) =>
    request(`/jobs/${jobId}/apply`, { method: "POST", body: JSON.stringify({ candidateId }) }),

  health: () => request("/health"),
};
