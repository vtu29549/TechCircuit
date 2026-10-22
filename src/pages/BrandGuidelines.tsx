import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  BookMarked,
  Shield,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { BrandProfile, Severity, ContentType } from '../types';

interface BrandGuidelinesProps {
  brands: BrandProfile[];
  onSaveBrand: (brand: Partial<BrandProfile>) => Promise<void>;
  onDeleteBrand: (id: string) => Promise<void>;
  onSelectBrandForReview: (brandId: string) => void;
}

export const BrandGuidelines: React.FC<BrandGuidelinesProps> = ({
  brands,
  onSaveBrand,
  onDeleteBrand,
  onSelectBrandForReview,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    brands[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandProfile> | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'voice' | 'terms' | 'prohibited' | 'disclaimers' | 'claims' | 'weights'
  >('prohibited');

  const activeBrand =
    brands.find((b) => b.id === selectedBrandId) || brands[0] || null;

  const handleStartEdit = (brand: BrandProfile) => {
    setEditingBrand(JSON.parse(JSON.stringify(brand)));
    setIsEditing(true);
  };

  const handleStartNew = () => {
    const newBrand: Partial<BrandProfile> = {
      name: 'New Brand Profile',
      tagline: 'Enterprise Governance Policy',
      description: 'Brand description and strategic goals.',
      targetAudience: 'Global enterprise customers and stakeholders.',
      brandVoice: 'Professional, clear, and objective.',
      toneAttributes: ['Authoritative', 'Transparent'],
      approvedTerms: [
        {
          id: `term-${Date.now()}`,
          term: 'Preferred Term',
          preferredOver: 'Legacy Term',
          context: 'Preferred in formal copy.',
        },
      ],
      prohibitedPhrases: [
        {
          id: `proh-${Date.now()}`,
          phrase: '100% guaranteed',
          reason: 'Never make absolute promises.',
          severity: 'critical',
          suggestedAlternative: 'highly reliable',
        },
      ],
      requiredDisclaimers: [
        {
          id: `disc-${Date.now()}`,
          text: 'Terms and conditions apply',
          placement: 'end',
          mandatoryForContentTypes: ['advertisement', 'social_media'],
        },
      ],
      claimRestrictions: [
        {
          id: `claim-${Date.now()}`,
          claimPattern: 'Savings claims',
          guidance: 'Must cite verified customer case study.',
          severity: 'high',
        },
      ],
      severityWeights: {
        critical: 35,
        high: 20,
        medium: 10,
        low: 5,
      },
    };

    setEditingBrand(newBrand);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingBrand || !editingBrand.name?.trim()) return;
    setSaving(true);
    try {
      await onSaveBrand(editingBrand);
      setIsEditing(false);
      setEditingBrand(null);
    } catch (err) {
      console.error('Failed to save brand:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand profile "${name}"?`)) {
      await onDeleteBrand(id);
      if (selectedBrandId === id) {
        setSelectedBrandId(brands.find((b) => b.id !== id)?.id || '');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar with Brand Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Brand Governance Guidelines
            </h2>
            <p className="text-xs text-slate-500">
              Define voice standards, approved terminology, and compliance gates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Brand Dropdown */}
          <select
            value={selectedBrandId}
            onChange={(e) => {
              setSelectedBrandId(e.target.value);
              setIsEditing(false);
              setEditingBrand(null);
            }}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-teal-500"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} {b.name === 'NovaTech' ? '(Sample Demo Brand)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleStartNew}
            className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Brand</span>
          </button>
        </div>
      </div>

      {/* Main Brand View or Editor */}
      {activeBrand && !isEditing ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Brand Profile Overview Card */}
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50/50">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {activeBrand.name}
                </h3>
                {activeBrand.name === 'NovaTech' && (
                  <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    Official Hackathon Demo Brand
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-teal-700">
                {activeBrand.tagline}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeBrand.description}
              </p>
              <div className="pt-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Target Audience:
                </span>{' '}
                {activeBrand.targetAudience}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectBrandForReview(activeBrand.id)}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
              >
                Use for Review
              </button>
              <button
                onClick={() => handleStartEdit(activeBrand)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
              {brands.length > 1 && (
                <button
                  onClick={() => handleDelete(activeBrand.id, activeBrand.name)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs Navigation for Rules */}
          <div className="border-b border-slate-200 px-6 flex flex-wrap gap-2 pt-3">
            {[
              { id: 'prohibited', label: `Prohibited Phrases (${activeBrand.prohibitedPhrases?.length || 0})` },
              { id: 'disclaimers', label: `Required Disclaimers (${activeBrand.requiredDisclaimers?.length || 0})` },
              { id: 'terms', label: `Approved Terminology (${activeBrand.approvedTerms?.length || 0})` },
              { id: 'voice', label: 'Brand Voice & Tone' },
              { id: 'claims', label: `Claim Restrictions (${activeBrand.claimRestrictions?.length || 0})` },
              { id: 'weights', label: 'Severity Weights' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="p-6">
            {/* 1. Prohibited Phrases */}
            {activeTab === 'prohibited' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Prohibited Phrases & Banned Clichés
                    </h4>
                    <p className="text-xs text-slate-500">
                      Strict deterministic and contextual triggers that flag copy immediately.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {activeBrand.prohibitedPhrases.map((p) => (
                    <div key={p.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-700 text-sm">
                            "{p.phrase}"
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : p.severity === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.severity}
                          </span>
                        </div>
                        <p className="text-slate-600">{p.reason}</p>
                      </div>

                      {p.suggestedAlternative && (
                        <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0">
                          <span className="text-[10px] text-emerald-700 block uppercase font-bold">Suggested Alternative:</span>
                          "{p.suggestedAlternative}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Required Disclaimers */}
            {activeTab === 'disclaimers' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Mandatory Regulatory & Policy Disclaimers
                  </h4>
                  <p className="text-xs text-slate-500">
                    Disclaimers automatically verified by deterministic check prior to publication.
                  </p>
                </div>

                <div className="space-y-3">
                  {activeBrand.requiredDisclaimers.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm">
                          "{d.text}"
                        </div>
                        <span className="text-[11px] font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded capitalize">
                          Placement: {d.placement}
                        </span>
                      </div>
                      <div className="text-slate-500 flex flex-wrap gap-4 text-[11px]">
                        <div>
                          <strong>Applies to:</strong>{' '}
                          {d.mandatoryForContentTypes?.join(', ') || 'All Content Types'}
                        </div>
                        {d.triggerKeywords && d.triggerKeywords.length > 0 && (
                          <div>
                            <strong>Triggers on:</strong>{' '}
                            {d.triggerKeywords.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Approved Terminology */}
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Approved Terminology & Lexicon
                  </h4>
                  <p className="text-xs text-slate-500">
                    Official product and architectural nomenclature.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {activeBrand.approvedTerms.map((t) => (
                    <div key={t.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {t.term}
                        </div>
                        <p className="text-slate-500 mt-0.5">{t.context}</p>
                      </div>

                      {t.preferredOver && (
                        <div className="text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preferred Over:</span>
                          <span className="line-through text-rose-600 font-mono text-[11px]">{t.preferredOver}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Brand Voice */}
            {activeTab === 'voice' && (
              <div className="space-y-4 max-w-3xl text-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Brand Voice & Editorial Direction
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                    {activeBrand.brandVoice}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">
                    Governing Tone Attributes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeBrand.toneAttributes.map((attr, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Claim Restrictions */}
            {activeTab === 'claims' && (
              <div className="space-y-3">
                {activeBrand.claimRestrictions.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        Pattern: {c.claimPattern}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-slate-600">{c.guidance}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 6. Severity Weights */}
            {activeTab === 'weights' && (
              <div className="max-w-md space-y-3 text-xs">
                <h4 className="text-sm font-bold text-slate-900">
                  Compliance Deduction Weight Matrix
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-rose-600 font-bold">Critical Severity:</span>
                    <span>-{activeBrand.severityWeights.critical} points + Approval Hard-Blocker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600 font-bold">High Severity:</span>
                    <span>-{activeBrand.severityWeights.high} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">Medium Severity:</span>
                    <span>-{activeBrand.severityWeights.medium} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Low Severity:</span>
                    <span>-{activeBrand.severityWeights.low} points</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isEditing && editingBrand ? (
        /* Edit Brand Form */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingBrand.id ? 'Edit Brand Guidelines' : 'Create New Brand Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure brand voice, prohibited phrases, approved terms, and disclaimers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingBrand(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Brand Profile'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={editingBrand.name || ''}
                onChange={(e) =>
                  setEditingBrand({ ...editingBrand, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={editingBrand.tagline || ''}
                onChange={(e) =>
                  setEditingBrand({ ...editingBrand, tagline: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingBrand.description || ''}
                onChange={(e) =>
                  setEditingBrand({ ...editingBrand, description: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={editingBrand.targetAudience || ''}
                onChange={(e) =>
                  setEditingBrand({
                    ...editingBrand,
                    targetAudience: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tone Attributes (comma separated)
              </label>
              <input
                type="text"
                value={(editingBrand.toneAttributes || []).join(', ')}
                onChange={(e) =>
                  setEditingBrand({
                    ...editingBrand,
                    toneAttributes: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Brand Voice & Editorial Direction
              </label>
              <textarea
                rows={3}
                value={editingBrand.brandVoice || ''}
                onChange={(e) =>
                  setEditingBrand({ ...editingBrand, brandVoice: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-teal-500"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
