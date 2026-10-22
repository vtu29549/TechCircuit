import {
  BrandProfile,
  ComplianceAnalysisResult,
  ContentRewriteResult,
  ReviewRecord,
  ApprovalStatus,
} from '../types';

export interface SystemStatus {
  status: string;
  appName: string;
  version: string;
  geminiConfigured: boolean;
  modelName: string;
  totalBrands: number;
  totalReviews: number;
  timestamp: string;
}

export const api = {
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to retrieve system status');
    return res.json();
  },

  async getBrands(): Promise<BrandProfile[]> {
    const res = await fetch('/api/brands');
    if (!res.ok) throw new Error('Failed to fetch brand profiles');
    return res.json();
  },

  async getBrand(id: string): Promise<BrandProfile> {
    const res = await fetch(`/api/brands/${id}`);
    if (!res.ok) throw new Error('Brand not found');
    return res.json();
  },

  async saveBrand(brand: Partial<BrandProfile>): Promise<BrandProfile> {
    const isEdit = !!brand.id;
    const url = isEdit ? `/api/brands/${brand.id}` : '/api/brands';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save brand profile');
    }
    return res.json();
  },

  async deleteBrand(id: string): Promise<void> {
    const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete brand profile');
  },

  async analyzeContent(payload: {
    content: string;
    brandId: string;
    campaignName: string;
    contentType: string;
  }): Promise<ComplianceAnalysisResult> {
    const res = await fetch('/api/compliance/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Compliance analysis failed');
    }
    return res.json();
  },

  async rewriteContent(payload: {
    content: string;
    brandId: string;
    contentType: string;
    issues: any[];
  }): Promise<ContentRewriteResult> {
    const res = await fetch('/api/compliance/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Content rewrite failed');
    }
    return res.json();
  },

  async getReviews(): Promise<ReviewRecord[]> {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to fetch review history');
    return res.json();
  },

  async getReview(id: string): Promise<ReviewRecord> {
    const res = await fetch(`/api/reviews/${id}`);
    if (!res.ok) throw new Error('Review not found');
    return res.json();
  },

  async saveReview(review: Partial<ReviewRecord>): Promise<ReviewRecord> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save review');
    }
    return res.json();
  },

  async updateReviewStatus(
    id: string,
    payload: {
      newStatus: ApprovalStatus;
      reviewer: string;
      reviewerRole: string;
      rationale: string;
    }
  ): Promise<ReviewRecord> {
    const res = await fetch(`/api/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to transition review status');
    }
    return res.json();
  },

  async deleteReview(id: string): Promise<void> {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete review');
  },

  async resetDemoData(): Promise<void> {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to restore demo data');
  },
};
