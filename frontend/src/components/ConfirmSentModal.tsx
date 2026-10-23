'use client';

import { useState } from 'react';
import { X, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { OutreachDraft } from '@/lib/api';

interface ConfirmSentModalProps {
  draft: OutreachDraft;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (data: {
    exact_sent_text: string;
    channel: string;
    schedule_follow_up_days?: number;
    follow_up_reason?: string;
  }) => Promise<void>;
}

export function ConfirmSentModal({
  draft,
  businessName,
  isOpen,
  onClose,
  onConfirmed,
}: ConfirmSentModalProps) {
  const [exactText, setExactText] = useState(draft.body);
  const [channel, setChannel] = useState(draft.channel);
  const [followUpDays, setFollowUpDays] = useState<number>(3);
  const [followUpReason, setFollowUpReason] = useState('Check for reply to initial outreach');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirmed({
        exact_sent_text: exactText,
        channel,
        schedule_follow_up_days: followUpDays > 0 ? followUpDays : undefined,
        follow_up_reason: followUpReason,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm sent message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121620] border border-white/10 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Confirm Manual Outreach Sent</h3>
              <p className="text-xs text-slate-400">Prospect: {businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Channel Used
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="instagram_dm">Instagram Direct Message</option>
              <option value="email">Direct Business Email</option>
              <option value="website_contact">Website Contact / Inquiry Form</option>
              <option value="linkedin">LinkedIn Direct Message</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Exact Sent Content (Immutable Historical Record)
            </label>
            <textarea
              rows={5}
              value={exactText}
              onChange={(e) => setExactText(e.target.value)}
              required
              className="w-full bg-[#0B0D12] border border-white/10 rounded-md p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              placeholder="Paste the exact text sent externally..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Saving this will permanently record this exact message in the sent log and advance the prospect stage to <strong className="text-emerald-400">Contacted</strong>.
            </p>
          </div>

          {/* Follow-up scheduler */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Next Follow-Up Reminder</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFollowUpDays(2)}
                className={`py-1 text-xs rounded border transition-colors ${
                  followUpDays === 2 ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-white/10 text-slate-400'
                }`}
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => setFollowUpDays(4)}
                className={`py-1 text-xs rounded border transition-colors ${
                  followUpDays === 4 ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-white/10 text-slate-400'
                }`}
              >
                In 4 Days
              </button>
              <button
                type="button"
                onClick={() => setFollowUpDays(7)}
                className={`py-1 text-xs rounded border transition-colors ${
                  followUpDays === 7 ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-white/10 text-slate-400'
                }`}
              >
                In 7 Days
              </button>
            </div>
            <input
              type="text"
              value={followUpReason}
              onChange={(e) => setFollowUpReason(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white"
              placeholder="Follow up reason..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-md shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Sent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
