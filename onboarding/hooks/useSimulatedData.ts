"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOnboarding } from "../context/useOnboarding";
import {
  getDemoEventFixture,
  getDemoEventDetailFixture,
  getDemoEventDashboardFixture,
  getApplicationFixture,
  getTicketFixture,
  sampleApplicants,
} from "../fixtures";
import type { ExploreEvent, RegistrationItem, TicketItem, RegistrationListItem, OrganizerEventDetails } from "@/lib/api";
import type { DemoEventDetail, ApplicantDetail } from "../fixtures";

// Generic hook state
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook: useSimulatedEventList
 * Returns fixture event list during simulation, real data otherwise.
 */
export function useSimulatedEventList(
  realFetcher: () => Promise<ExploreEvent[]>
): DataState<ExploreEvent[]> {
  const { isSimulationActive, currentStage } = useOnboarding();
  const [state, setState] = useState<DataState<ExploreEvent[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (isSimulationActive && currentStage === "S2") {
      setState({
        data: [getDemoEventFixture()],
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    realFetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [isSimulationActive, currentStage, realFetcher]);

  return state;
}

/**
 * Hook: useSimulatedEventDetails
 * Returns fixture event detail during simulation, real data otherwise.
 */
export function useSimulatedEventDetails(
  eventId: string,
  realFetcher: (id: string) => Promise<any>
): DataState<DemoEventDetail> {
  const { isSimulationActive, currentStage } = useOnboarding();
  const [state, setState] = useState<DataState<DemoEventDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (
      isSimulationActive &&
      currentStage === "S2" &&
      eventId === "onboarding-demo-event"
    ) {
      setState({
        data: getDemoEventDetailFixture(),
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    realFetcher(eventId)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [isSimulationActive, currentStage, eventId, realFetcher]);

  return state;
}

/**
 * Hook: useSimulatedApplicationStatus
 * Returns phase-appropriate fixture during S2 simulation.
 */
export function useSimulatedApplicationStatus(
  realFetcher: () => Promise<RegistrationItem | null>
): DataState<RegistrationItem | null> {
  const { isSimulationActive, currentStage, simulationState } =
    useOnboarding();
  const [state, setState] = useState<DataState<RegistrationItem | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (isSimulationActive && currentStage === "S2") {
      setState({
        data: getApplicationFixture(simulationState.attendeePhase),
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    realFetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [
    isSimulationActive,
    currentStage,
    simulationState.attendeePhase,
    realFetcher,
  ]);

  return state;
}

/**
 * Hook: useSimulatedTicket
 * Returns fixture ticket during S2 simulation.
 */
export function useSimulatedTicket(
  realFetcher: () => Promise<TicketItem | null>
): DataState<TicketItem | null> {
  const { isSimulationActive, currentStage } = useOnboarding();
  const [state, setState] = useState<DataState<TicketItem | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (isSimulationActive && currentStage === "S2") {
      setState({
        data: getTicketFixture(),
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    realFetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [isSimulationActive, currentStage, realFetcher]);

  return state;
}

/**
 * Hook: useSimulatedApplicantQueue
 * Returns sampled fixture applicants during S3 simulation.
 */
export function useSimulatedApplicantQueue(
  eventId: string,
  realFetcher: (
    eventId: string,
    params?: { status?: string }
  ) => Promise<RegistrationListItem[]>
): DataState<RegistrationListItem[]> & { details: ApplicantDetail[] } {
  const { isSimulationActive, currentStage, simulationState, updateSimulationState } =
    useOnboarding();
  const [state, setState] = useState<
    DataState<RegistrationListItem[]> & { details: ApplicantDetail[] }
  >({
    data: null,
    loading: true,
    error: null,
    details: [],
  });

  // Sample applicants once on S3 entry
  useEffect(() => {
    if (
      isSimulationActive &&
      currentStage === "S3" &&
      !simulationState.sampledApplicants
    ) {
      const sampled = sampleApplicants();
      updateSimulationState({ sampledApplicants: sampled.details });

      // Apply action statuses
      const list = sampled.list.map((item) => {
        const action = simulationState.applicantActions[item.registration_id];
        return action ? { ...item, status: action } : item;
      });

      setState({
        data: list,
        loading: false,
        error: null,
        details: sampled.details,
      });
      return;
    }

    if (isSimulationActive && currentStage === "S3" && simulationState.sampledApplicants) {
      // Re-render with updated action statuses
      const details = simulationState.sampledApplicants as ApplicantDetail[];
      const list: RegistrationListItem[] = details.map((d) => {
        const action = simulationState.applicantActions[d.registration_id];
        return {
          registration_id: d.registration_id,
          status: action ?? "pending",
          name: d.name,
          type: "General Admission",
          price: 3000,
          profile_picture: d.profile_picture,
          linked_attendees: [],
          created_date: new Date().toISOString(),
          is_complete: true,
          actions: {
            canApprove: !action,
            canReject: !action,
          },
        };
      });

      setState({
        data: list,
        loading: false,
        error: null,
        details,
      });
      return;
    }

    // Real data path
    if (!isSimulationActive) {
      let cancelled = false;
      setState((prev) => ({ ...prev, loading: true }));
      realFetcher(eventId)
        .then((data) => {
          if (!cancelled)
            setState({ data, loading: false, error: null, details: [] });
        })
        .catch((error) => {
          if (!cancelled)
            setState({ data: null, loading: false, error, details: [] });
        });
      return () => {
        cancelled = true;
      };
    }
  }, [
    isSimulationActive,
    currentStage,
    simulationState.sampledApplicants,
    simulationState.applicantActions,
    eventId,
    realFetcher,
    updateSimulationState,
  ]);

  return state;
}

/**
 * Hook: useSimulatedEventDashboard
 * Returns fixture dashboard during S3 simulation.
 */
export function useSimulatedEventDashboard(
  eventId: string,
  realFetcher: (id: string) => Promise<OrganizerEventDetails>
): DataState<OrganizerEventDetails> {
  const { isSimulationActive, currentStage } = useOnboarding();
  const [state, setState] = useState<DataState<OrganizerEventDetails>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (
      isSimulationActive &&
      currentStage === "S3" &&
      eventId === "onboarding-demo-event"
    ) {
      setState({
        data: getDemoEventDashboardFixture(),
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    realFetcher(eventId)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [isSimulationActive, currentStage, eventId, realFetcher]);

  return state;
}
