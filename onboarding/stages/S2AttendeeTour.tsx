"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../context/useOnboarding";
import { TooltipOverlay } from "../components/TooltipOverlay";
import { TransitionScreen } from "../components/TransitionScreen";
import { getDemoEventDetailFixture } from "../fixtures/demo-event";
import { getTicketFixture } from "../fixtures/ticket";
import {
  sendWhatsappApplicationReceived,
  sendWhatsappApplicationApproved,
  sendWhatsappTicketConfirmed,
} from "@/lib/onboardingApi";
import { trackOnboardingEvent } from "../analytics";
import type { TooltipConfig } from "../context/types";

// Phase sub-components
function DiscoveryPhase({
  onEventTap,
}: {
  onEventTap: () => void;
}) {
  const event = getDemoEventDetailFixture();
  const [showDetail, setShowDetail] = useState(false);
  const [tooltipIdx, setTooltipIdx] = useState(0);

  const tooltips: (TooltipConfig | null)[] = [
    {
      id: "s2_discovery_feed",
      targetSelector: "[data-onboarding='event-card']",
      title: "Your event feed",
      body: "This is what your attendees see. Every event on Whispr looks and feels like this.",
      placement: "bottom",
      onDismiss: () => setTooltipIdx(1),
    },
    showDetail
      ? {
          id: "s2_discovery_apply",
          targetSelector: "[data-onboarding='apply-button']",
          title: "Apply to attend",
          body: "Tap Apply to start your application. Every attendee goes through this.",
          placement: "top",
          onDismiss: () => setTooltipIdx(-1),
        }
      : null,
  ];

  const activeTooltip = tooltipIdx >= 0 ? tooltips[tooltipIdx] : null;

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {!showDetail ? (
          // Event feed view
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2
              className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6"
              style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
            >
              Explore Events
            </h2>

            {/* Demo event card */}
            <div
              data-onboarding="event-card"
              onClick={() => {
                if (tooltipIdx < 0 || tooltipIdx > 0) {
                  setShowDetail(true);
                  if (tooltipIdx < 0) setTooltipIdx(1);
                }
              }}
              className="cursor-pointer rounded-xl border border-[#333] overflow-hidden transition-all hover:border-[#D4A574]/40"
              style={{ background: "#1A1A1A" }}
            >
              {/* Event cover placeholder */}
              <div className="h-48 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center">
                <span className="text-[40px] text-[#333]">W</span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#D4A574]/20 flex items-center justify-center text-[10px] text-[#D4A574]">
                    W
                  </div>
                  <span className="text-[12px] text-[#999]">
                    {event.organization?.name}
                  </span>
                </div>
                <h3 className="text-[18px] text-white font-semibold">
                  {event.name}
                </h3>
                <p className="text-[13px] text-[#999] mt-1">
                  {event.location}
                </p>
                <p className="text-[12px] text-[#666] mt-1">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Date TBA"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // Event detail view
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Event header */}
            <div className="h-56 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl flex items-center justify-center mb-6">
              <span className="text-[60px] text-[#333]">W</span>
            </div>

            <h2 className="text-[24px] text-white font-semibold">
              {event.name}
            </h2>
            <p className="text-[14px] text-[#999] mt-2">{event.description}</p>

            <div className="mt-4 space-y-2">
              <p className="text-[13px] text-[#CCC]">
                <span className="text-[#666]">Location:</span>{" "}
                {event.location}
              </p>
              <p className="text-[13px] text-[#CCC]">
                <span className="text-[#666]">Dress code:</span>{" "}
                {event.dress_code}
              </p>
              <p className="text-[13px] text-[#CCC]">
                <span className="text-[#666]">Capacity:</span>{" "}
                {event.capacity} guests
              </p>
            </div>

            {/* Lineup */}
            <div className="mt-6">
              <h3 className="text-[12px] uppercase tracking-[0.15em] text-[#666] mb-3">
                Lineup
              </h3>
              <div className="space-y-2">
                {event.lineup.map((act) => (
                  <div
                    key={act.name}
                    className="flex items-center justify-between text-[13px] text-[#CCC]"
                  >
                    <span>{act.name}</span>
                    <span className="text-[#666]">{act.genre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply button */}
            <button
              data-onboarding="apply-button"
              onClick={onEventTap}
              className="mt-8 w-full py-3.5 rounded-lg text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90"
              style={{ background: "#D4A574" }}
            >
              Apply to Attend &mdash; PKR 3,000
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <TooltipOverlay
        tooltip={activeTooltip}
        onDismiss={() => {
          if (activeTooltip?.onDismiss) activeTooltip.onDismiss();
        }}
      />
    </div>
  );
}

function ApplicationPhase({
  onSubmit,
}: {
  onSubmit: () => void;
}) {
  const event = getDemoEventDetailFixture();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const formStartTime = Date.now();

  const allAnswered = event.screening_questions.every(
    (q) => answers[q.id]?.trim()
  );

  async function handleSubmit() {
    if (!allAnswered || submitting) return;

    setSubmitting(true);

    trackOnboardingEvent("onboarding_s2_application_submitted", {
      time_on_form_seconds: Math.round((Date.now() - formStartTime) / 1000),
    });

    // Fire-and-forget WhatsApp
    sendWhatsappApplicationReceived();

    // Brief delay to simulate submission
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onSubmit();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[500px] mx-auto px-6 py-8"
    >
      <h2
        className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2"
        style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
      >
        Application
      </h2>
      <p className="text-[13px] text-[#666] mb-8">
        {event.name} &bull; {event.passes[0].type} &bull; PKR{" "}
        {event.passes[0].price.toLocaleString()}
      </p>

      <div className="space-y-6">
        {event.screening_questions.map((q) => (
          <div key={q.id}>
            <label className="block text-[13px] text-[#CCC] mb-2">
              {q.text}
            </label>
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: e.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[13px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all resize-none"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="mt-8 w-full py-3.5 rounded-lg text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#D4A574" }}
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>

      <TooltipOverlay
        tooltip={{
          id: "s2_application_screening",
          targetSelector: "textarea",
          title: "Screening questions",
          body: "The Whispr team reviews every application so you don\u2019t have to. This is our job, not yours.",
          placement: "right",
        }}
        onDismiss={() => {}}
      />
    </motion.div>
  );
}

function ApprovalPhase({ onContinue }: { onContinue: () => void }) {
  const [showApproved, setShowApproved] = useState(false);
  const approvalTime = Date.now();

  const handleReviewComplete = useCallback(() => {
    sendWhatsappApplicationApproved();
    setShowApproved(true);
  }, []);

  if (!showApproved) {
    return (
      <TransitionScreen
        title="The Whispr team is reviewing your application..."
        showPulse
        autoAdvanceMs={3500}
        onAdvance={handleReviewComplete}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[500px] mx-auto px-6 py-8 text-center"
    >
      {/* Approval checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ background: "#D4A574" }}
      >
        <svg
          className="w-8 h-8 text-[#111]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      <h2
        className="text-[20px] text-white font-semibold"
        style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
      >
        You&apos;re approved!
      </h2>
      <p className="text-[13px] text-[#999] mt-2">
        This is what every approved attendee sees. The Whispr team curates the
        guest list for your events.
      </p>

      <button
        onClick={() => {
          trackOnboardingEvent("onboarding_s2_payment_simulated", {
            time_since_approval_seconds: Math.round(
              (Date.now() - approvalTime) / 1000
            ),
          });
          onContinue();
        }}
        className="mt-8 px-8 py-3 rounded-full text-[13px] font-medium text-[#111] transition-opacity hover:opacity-90"
        style={{ background: "#D4A574" }}
      >
        Continue to payment
      </button>
    </motion.div>
  );
}

function PaymentPhase({ onComplete }: { onComplete: () => void }) {
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const ticket = getTicketFixture();

  async function handleSimulatePayment() {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPaying(false);
    setPaid(true);

    // Fire-and-forget WhatsApp
    sendWhatsappTicketConfirmed();
  }

  if (!paid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[500px] mx-auto px-6 py-8 text-center"
      >
        <h2
          className="text-[20px] text-white font-semibold mb-2"
          style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        >
          Payment
        </h2>
        <p className="text-[13px] text-[#999] mb-8">
          General Admission &bull; Whispr Demo Night
        </p>

        <div
          className="rounded-xl border border-[#333] p-6 mb-8"
          style={{ background: "#1A1A1A" }}
        >
          <p className="text-[32px] text-white font-semibold">PKR 3,000</p>
          <p className="text-[12px] text-[#666] mt-1">
            This is a simulation &mdash; no real payment
          </p>
        </div>

        <button
          onClick={handleSimulatePayment}
          disabled={paying}
          className="w-full py-3.5 rounded-lg text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#D4A574" }}
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </span>
          ) : (
            "Simulate Payment"
          )}
        </button>
      </motion.div>
    );
  }

  // Ticket view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[500px] mx-auto px-6 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <h2
          className="text-[24px] text-white font-semibold mb-2"
          style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        >
          Your night is confirmed
        </h2>
        <p className="text-[13px] text-[#999] mb-8">
          You&apos;ll also receive this on WhatsApp
        </p>

        {/* Ticket card */}
        <div
          className="rounded-xl border border-[#333] overflow-hidden"
          style={{ background: "#1A1A1A" }}
        >
          <div className="p-6">
            <p className="text-[18px] text-white font-semibold">
              {ticket.event?.name}
            </p>
            <p className="text-[13px] text-[#999] mt-1">
              {ticket.event?.location}
            </p>
            <p className="text-[12px] text-[#666] mt-1">
              {ticket.event?.date
                ? new Date(ticket.event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>

          {/* QR Code placeholder */}
          <div className="border-t border-dashed border-[#333] p-6 flex flex-col items-center">
            <div
              className="w-32 h-32 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "white" }}
              data-onboarding="ticket-qr"
            >
              {/* QR placeholder - will be replaced with qrcode.react */}
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <rect x="10" y="10" width="25" height="25" fill="#111" />
                <rect x="65" y="10" width="25" height="25" fill="#111" />
                <rect x="10" y="65" width="25" height="25" fill="#111" />
                <rect x="40" y="40" width="20" height="20" fill="#111" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="20" y="20" width="5" height="5" fill="#111" />
                <rect x="75" y="20" width="5" height="5" fill="#111" />
                <rect x="20" y="75" width="5" height="5" fill="#111" />
              </svg>
            </div>
            <p className="text-[11px] text-[#666]">
              {ticket.pass_type} &bull; {ticket.id}
            </p>
          </div>
        </div>
      </motion.div>

      <button
        onClick={onComplete}
        className="mt-8 px-8 py-3 rounded-full text-[13px] font-medium text-[#111] transition-opacity hover:opacity-90"
        style={{ background: "#D4A574" }}
      >
        See what it looks like from the other side
      </button>

      <TooltipOverlay
        tooltip={{
          id: "s2_ticket_qr",
          targetSelector: "[data-onboarding='ticket-qr']",
          title: "Entry pass",
          body: "This QR code is their entry pass. They\u2019ll also get it on WhatsApp.",
          placement: "top",
        }}
        onDismiss={() => {}}
      />
    </motion.div>
  );
}

// Main S2 orchestrator
export function S2AttendeeTour() {
  const { simulationState, updateSimulationState, advanceStage } =
    useOnboarding();

  // Initialize to discovery phase if not set
  const phase = simulationState.attendeePhase ?? "discovery";

  function setPhase(p: typeof phase) {
    updateSimulationState({ attendeePhase: p });
    trackOnboardingEvent("onboarding_s2_phase_entered", { phase: p });
  }

  // Initialize discovery on first render
  if (!simulationState.attendeePhase) {
    updateSimulationState({ attendeePhase: "discovery" });
  }

  return (
    <div className="pt-[40px]">
      {" "}
      {/* Offset for context banner */}
      <AnimatePresence mode="wait">
        {phase === "discovery" && (
          <motion.div key="discovery" exit={{ opacity: 0 }}>
            <DiscoveryPhase onEventTap={() => setPhase("application")} />
          </motion.div>
        )}

        {phase === "application" && (
          <motion.div key="application" exit={{ opacity: 0 }}>
            <ApplicationPhase
              onSubmit={() => {
                updateSimulationState({ applicationSubmitted: true });
                setPhase("review");
              }}
            />
          </motion.div>
        )}

        {(phase === "review" || phase === "approved") && (
          <motion.div key="review" exit={{ opacity: 0 }}>
            <ApprovalPhase onContinue={() => setPhase("payment")} />
          </motion.div>
        )}

        {(phase === "payment" || phase === "ticket") && (
          <motion.div key="payment" exit={{ opacity: 0 }}>
            <PaymentPhase
              onComplete={() => {
                updateSimulationState({ paymentSimulated: true });
                advanceStage("S2", "S3");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
